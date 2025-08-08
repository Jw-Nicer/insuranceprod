'use client';

import type { UploadedData } from '@/app/loss-run/page';
import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock AI processing function
async function processLossRun(file: File): Promise<UploadedData> {
  console.log(`Processing ${file.name}...`);
  // Simulate network delay and processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real application, you would send the file to a backend service
  // that uses AI to parse the PDF and extract the data.
  // For this example, we'll return mock data.
  const mockData: UploadedData = {
    history: [
      { year: 2020, premium: 50000 },
      { year: 2021, premium: 52000 },
      { year: 2022, premium: 55000 },
      { year: 2023, premium: 53000 },
    ],
    totalLossPaid: 75000,
    totalExpensePaid: 15000,
    totalPremium: 210000,
    totalClaims: 42,
  };

  console.log("Processing complete.");
  return mockData;
}


interface LossRunUploaderProps {
  onDataUploaded: (data: UploadedData, json: string) => void;
}

export function LossRunUploader({ onDataUploaded }: LossRunUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a PDF file.",
        })
        return;
      }
      setFileName(file.name);
      setIsUploading(true);
      try {
        const data = await processLossRun(file);
        const json = JSON.stringify(data, null, 2);
        onDataUploaded(data, json);
      } catch (error) {
        console.error("Failed to process loss run:", error);
         toast({
            variant: "destructive",
            title: "Processing Error",
            description: "Failed to process the uploaded file. Please try again.",
        })
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Loss Run PDF</CardTitle>
        <CardDescription>
          Select your loss run report in PDF format to begin the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors border-border cursor-pointer hover:bg-muted"
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Processing: {fileName}</p>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">Click or drag & drop to upload PDF</p>
                {fileName && <p className="text-xs text-muted-foreground mt-2">Last file: {fileName}</p>}
            </div>
          )}
        </div>
        <Button onClick={handleButtonClick} disabled={isUploading} className="w-full mt-4">
          {isUploading ? 'Processing...' : 'Select PDF File'}
        </Button>
      </CardContent>
    </Card>
  );
}
