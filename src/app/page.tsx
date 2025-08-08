'use client';

import { useState } from 'react';
import { analyzeInsuranceClaims, AnalyzeInsuranceClaimsOutput } from '@/ai/flows/analyze-insurance-claims';
import FileUploader from '@/components/file-uploader';
import InsuranceDashboard from '@/components/insurance-dashboard';
import { parseCsv } from '@/lib/csv-helpers';
import { useToast } from "@/hooks/use-toast"

// A generic claim type
export type Claim = {
  [key: string]: string | number;
};

export default function Home() {
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeInsuranceClaimsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileProcess = (fileContent: string) => {
    try {
      setIsLoading(true);
      setCsvData(fileContent);

      const records: Claim[] = parseCsv(fileContent);

      setClaims(records);
      setAnalysis(null); // Reset analysis on new file
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "CSV Parsing Error",
        description: "Failed to parse CSV file. Please ensure it's correctly formatted with a header row.",
      })
      setClaims(null);
      setCsvData(null);
    } finally {
      setIsLoading(false);
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
  };

  return (
    <>
      {!claims ? (
        <FileUploader
          onFileProcess={handleFileProcess}
          isLoading={isLoading}
        />
      ) : (
        <InsuranceDashboard
          claims={claims}
          analysis={analysis}
          onAnalyze={handleAnalyze}
          isLoadingAnalysis={isLoading}
          onReset={reset}
        />
      )}
    </>
  );
}
