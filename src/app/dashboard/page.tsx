'use client';

import { useState } from 'react';
import { analyzeInsuranceClaims, AnalyzeInsuranceClaimsOutput } from '@/ai/flows/analyze-insurance-claims';
import FileUploader from '@/components/file-uploader';
import InsuranceDashboard from '@/components/insurance-dashboard';
import { parseCsv } from '@/lib/csv-helpers';
import { useToast } from "@/hooks/use-toast"
import { AppShell } from '@/components/app-shell';
import type { Transaction } from '@/types';

export default function DashboardPage() {
  const [claims, setClaims] = useState<Transaction[] | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeInsuranceClaimsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileProcess = (fileContent: string) => {
    try {
      setCsvData(fileContent);
      const records: Transaction[] = parseCsv(fileContent);
      setClaims(records);
      setAnalysis(null);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "CSV Parsing Error",
        description: "Failed to parse CSV file. Please ensure it's correctly formatted with a header row.",
      })
      setClaims(null);
      setCsvData(null);
    }
  };
  
  const handleAnalyze = async () => {
    if (!csvData) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "No CSV data available to analyze.",
      })
      return;
    }
    try {
      setIsLoading(true);
      const result = await analyzeInsuranceClaims({ csvData });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "AI Analysis Error",
        description: "An error occurred during AI analysis. Please try again.",
      })
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setClaims(null);
    setCsvData(null);
    setAnalysis(null);
    setIsLoading(false);
  };

  return (
    <AppShell>
        <div className="mx-auto w-full max-w-[1200px]">
        {!claims ? (
          <FileUploader
            onFileProcess={handleFileProcess}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        ) : (
          <InsuranceDashboard
            claims={claims as any[]}
            analysis={analysis}
            onAnalyze={handleAnalyze}
            isLoadingAnalysis={isLoading}
            onReset={reset}
          />
        )}
      </div>
    </AppShell>
  );
}
