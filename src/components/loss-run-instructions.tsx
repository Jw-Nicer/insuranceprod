import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function LossRunInstructions() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Loss Run Analysis</CardTitle>
        </div>
        <CardDescription>
          Upload your loss run data to analyze premium history, loss ratios, and claim trends.
          This tool helps you understand your insurance performance and identify areas for improvement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Upload your loss run reports in PDF format.</li>
          <li>Ensure the document is clear and legible for accurate data extraction.</li>
          <li>Our AI will process the document to extract key data points.</li>
          <li>Review the extracted data and view the analysis dashboard.</li>
        </ul>
      </CardContent>
    </Card>
  );
}
