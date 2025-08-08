'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { LossRunInstructions } from '@/components/loss-run-instructions';
import { LossRunDashboard } from '@/components/loss-run-dashboard';
import { Button } from '@/components/ui/button';
import type { UploadedData, PremiumHistory } from '@/types';
import { LossRunMetrics } from '@/components/loss-run-metrics';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LossRunPage() {
  const [premiumHistory, setPremiumHistory] = useState<PremiumHistory[] | null>(
    null
  );
  const [claimsDataJson, setClaimsDataJson] = useState<string | null>(null);
  const [totalClaims, setTotalClaims] = useState<number | null>(null);
  const [ratios, setRatios] = useState<{
    paidLossRatio: number | null;
    expenseRatio: number | null;
    combinedRatio: number | null;
  }>({ paidLossRatio: null, expenseRatio: null, combinedRatio: null });
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const parseCsv = (csvText: string): { data: UploadedData, json: string } | null => {
    try {
      const results = Papa.parse<any>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      });
      
      const requiredHeaders = ['cov eff date', 'annual premium', 'loss paid', 'expense paid'];
      const fileHeaders = results.meta.fields || [];
      const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

      if (missingHeaders.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing Required Columns",
          description: `The CSV is missing the following columns: ${missingHeaders.join(', ')}`,
        });
        return null;
      }
      
      let totalLossPaid = 0;
      let totalExpensePaid = 0;
      let totalPremium = 0;

      const raw = results.data
        .filter(row => row['cov eff date'])
        .map(row => {
            const premium = parseFloat(String(row['annual premium']).replace(/[$,]/g, '')) || 0;
            const lossPaid = parseFloat(String(row['loss paid']).replace(/[$,]/g, '')) || 0;
            const expensePaid = parseFloat(String(row['expense paid']).replace(/[$,]/g, '')) || 0;
            
            totalLossPaid += lossPaid;
            totalExpensePaid += expensePaid;
            
            return {
              year: new Date(row['cov eff date']).getFullYear(),
              premium,
              lossPaid,
              expensePaid
            }
        });
        
      const totalClaims = raw.length;

      const premiumByYear: { [year: number]: number } = {};
      raw.forEach(({ year, premium }) => {
        if (!isNaN(year) && premium > 0) {
            premiumByYear[year] = premium;
        }
      });
      totalPremium = Object.values(premiumByYear).reduce((acc, p) => acc + p, 0);


      const grouped: { [year: number]: { sum: number; count: number } } = {};
      raw.forEach(({ year, premium }) => {
        if (!isNaN(year) && !isNaN(premium)) {
          if (!grouped[year]) {
            grouped[year] = { sum: 0, count: 0 };
          }
          grouped[year].sum += premium;
          grouped[year].count += 1;
        }
      });
      
      const history = Object.entries(grouped)
        .map(([yr, { sum, count }]) => ({
          year: +yr,
          premium: +(sum / count).toFixed(2),
        }))
        .sort((a, b) => a.year - b.year);
        
      if (history.length === 0) {
        toast({
            variant: "destructive",
            title: "No Valid Data Found",
            description: "Could not find any valid premium data in the uploaded file.",
        });
        return null;
      }
      
      const data = { history, totalLossPaid, totalExpensePaid, totalPremium, totalClaims };

      return { data, json: JSON.stringify(results.data) };

    } catch (error) {
      console.error('CSV Parsing Error:', error);
      toast({
        variant: 'destructive',
        title: 'CSV Parsing Error',
        description: error instanceof Error ? error.message : 'Could not parse the CSV file. Please check the format.',
      });
      return null;
    }
  };

  const handleProcessFile = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsedData = parseCsv(content);
        if (parsedData) {
          handleDataUploaded(parsedData.data, parsedData.json);
          toast({
            title: 'Success',
            description: `Successfully imported and processed premium history.`,
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const acceptedFile = acceptedFiles[0];
      if (acceptedFile.type === 'text/csv' || acceptedFile.name.endsWith('.csv')) {
        setFile(acceptedFile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a CSV file.',
        });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const handleDataUploaded = (data: UploadedData, json: string) => {
    setPremiumHistory(data.history);
    setClaimsDataJson(json);
    setTotalClaims(data.totalClaims);

    const paidLossRatio =
      data.totalPremium > 0 ? data.totalLossPaid / data.totalPremium : 0;
    const expenseRatio =
      data.totalPremium > 0 ? data.totalExpensePaid / data.totalPremium : 0;
    const combinedRatio = paidLossRatio + expenseRatio;

    setRatios({ paidLossRatio, expenseRatio, combinedRatio });
  };

  const handleReset = () => {
    setPremiumHistory(null);
    setClaimsDataJson(null);
    setTotalClaims(null);
    setRatios({ paidLossRatio: null, expenseRatio: null, combinedRatio: null });
    setFile(null);
  };

  return (
    <AppShell>
      <LossRunMetrics />
      {!premiumHistory ? (
        <>
          <LossRunInstructions />
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload Claims Table</CardTitle>
                <CardDescription>
                  Drag & drop your finalized claims CSV file here or click to select a file.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 w-full cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} accept=".csv" />
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <UploadCloud className="w-12 h-12" />
                    {isDragActive ? (
                      <p>Drop the file here ...</p>
                    ) : file ? (
                      <p className="font-semibold text-foreground">{file.name}</p>
                    ) : (
                      <p>Drag 'n' drop a file here, or click to select a file</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Required columns: Cov Eff Date, Annual Premium, Loss Paid, Expense Paid
                </p>

                <Button
                  onClick={handleProcessFile}
                  disabled={!file}
                  className="mt-6 w-full max-w-sm"
                  size="lg"
                >
                  Analyze Claim Table
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in-50 duration-500">
          <div className="flex justify-end mb-4">
            <Button onClick={handleReset} variant="outline">
              Upload New File
            </Button>
          </div>

          <LossRunDashboard
            history={premiumHistory}
            totalClaims={totalClaims}
            ratios={ratios}
          />
        </div>
      )}
    </AppShell>
  );
}
