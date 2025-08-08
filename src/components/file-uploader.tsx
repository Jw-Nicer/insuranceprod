'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFileProcess: (fileContent: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileProcess, onAnalyze, isLoading }: FileUploaderProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        onFileProcess(text);
      };
      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyzeClick = () => {
    onAnalyze();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Upload Your Spend Data</CardTitle>
          <CardDescription>Drag & drop your CSV file here or click to select a file.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <div 
            className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors border-border cursor-pointer hover:bg-muted"
            onClick={handleButtonClick}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drag 'n' drop a file here, or click to select a file</p>
          </div>
          <p className="text-xs text-muted-foreground">Required columns: Category, Supplier Name, Spend, Addressable, Discoverable</p>
          <Button onClick={handleAnalyzeClick} disabled={isLoading || !fileContent} className="w-full">
              {isLoading ? 'Analyzing...' : 'Analyze Spend Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
