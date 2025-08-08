
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

export function LossRunInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loss Run Analysis Instructions</CardTitle>
        <CardDescription>
          Follow these steps to analyze historical loss data and calculate premiums.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">1</span>
            Extract Claims and Premium Data
          </h3>
          <div className="pl-9 space-y-2">
            <p className="text-muted-foreground">
              First, open the Loss Run Analyzer GPT to process your documents.
            </p>
            <a href="https://chatgpt.com/g/g-68642191c5f88191971f0b7d80ea419c-loss-run-analyzer" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                    Open Loss Run Analyzer GPT
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </a>
            <p className="text-muted-foreground">
              Upload your claims documents to extract loss data.
            </p>
            <div className="pt-2">
                <p className="font-medium">If premium data is missing:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                    <li>Manually input the premium amount.</li>
                    <li>Ask the GPT to integrate the premium with the claims data.</li>
                    <li>Download the finalized claims table.</li>
                </ul>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">2</span>
              Upload Your File
          </h3>
          <p className="text-muted-foreground pl-9">
            Upload the finalized table (CSV or Excel) into this tool to begin the analysis.
          </p>
        </div>
        
        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">3</span>
            Run Premium Calculations
          </h3>
          <p className="text-muted-foreground pl-9">
            Once your data is uploaded, choose a scenario to calculate:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 pl-9">
            <li><span className="font-semibold text-foreground">Premium Backcasting:</span> Reconstructs what the premium should have been based on past claims.</li>
            <li><span className="font-semibold text-foreground">Future Premium Projection:</span> Estimates future premiums using historical loss patterns.</li>
          </ul>
        </div>
        
      </CardContent>
    </Card>
  );
}
