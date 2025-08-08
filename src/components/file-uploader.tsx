'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  onFileProcess: (fileContent: string) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileProcess, isLoading }: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentLoaded = Math.round((e.loaded / e.total) * 100);
          setProgress(percentLoaded);
        }
      };
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTimeout(() => { // simulate processing
            onFileProcess(text);
            setProgress(100);
        }, 500);
      };
      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
       <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 font-headline">Insurance Assistant</h1>
        <p className="text-lg text-muted-foreground">Upload your insurance claim data to get AI-powered insights.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <Card className="flex flex-col shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <UploadCloud className="text-accent" />
                Upload Your CSV
            </CardTitle>
            <CardDescription>Click the button below to select your file.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
            <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors border-border">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                <Button onClick={handleButtonClick} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Browse Files'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Maximum file size: 5MB</p>
                {fileName && !isLoading && <p className="text-sm text-primary mt-4">Selected: {fileName}</p>}
                {isLoading && <Progress value={progress} className="w-3/4 mt-4" />}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-accent"/>
                How to Use
            </CardTitle>
            <CardDescription>Follow these steps for a successful analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-3 font-bold shrink-0">1</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Prepare Your Data</h3>
                  <p>Ensure your data is in a CSV format with a header row. Common columns include `claim_id`, `amount`, `date`, `status`, and `type`.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-3 font-bold shrink-0">2</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Upload Your File</h3>
                  <p>Click "Browse Files" to select your prepared CSV file from your computer.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-3 font-bold shrink-0">3</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Review Dashboard</h3>
                  <p>Once uploaded, an interactive dashboard will automatically appear, summarizing your data with charts and key metrics.</p>
                </div>
              </li>
               <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-3 font-bold shrink-0">4</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Get AI Insights</h3>
                  <p>On the dashboard, click "Run AI Analysis" to get automated insights and trend analysis on your claims data.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
