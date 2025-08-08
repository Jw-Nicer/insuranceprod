'use client';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import type { Gpt } from '@/types';

const gpts: Gpt[] = [
  {
    name: 'Loss Run Analyzer',
    description:
      'The Loss Run Analyzer GPT processes your claims documents, extracts loss data, and integrates premium information to create a finalized claims table for analysis.',
    url: 'https://chatgpt.com/g/g-68642191c5f88191971f0b7d80ea419c-loss-run-analyzer',
  },
  {
    name: 'Insurance Policy Reviewer',
    description:
      'Upload your insurance policy documents to get a detailed review of your coverage, exclusions, and potential gaps. Helps you understand complex terms.',
    url: '#',
  },
  {
    name: 'Risk Assessment Assistant',
    description:
      'Identifies potential risks in your business operations and suggests mitigation strategies. Analyzes your data to score and prioritize risks.',
    url: '#',
  },
  {
    name: 'Claims Fraud Detector',
    description:
      'Analyzes claim patterns and data points to flag potentially fraudulent activities, helping you reduce unnecessary losses.',
    url: '#',
  },
  {
    name: 'Underwriting Data Analyst',
    description:
      'Assists in the underwriting process by analyzing applicant data, assessing risk, and providing data-driven recommendations for policy pricing.',
    url: '#',
  },
   {
    name: 'Regulatory Compliance Checker',
    description:
      'Cross-references your business practices and policies with the latest insurance regulations to ensure you remain compliant.',
    url: '#',
  },
];

export default function GptsPage() {
  return (
    <AppShell>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight">GPT Collection</h1>
                <p className="text-muted-foreground mt-1">
                A curated list of specialized GPTs to help with your insurance needs.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gpts.map((gpt) => (
            <Card key={gpt.name} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{gpt.name}</CardTitle>
                <CardDescription className="pt-2">{gpt.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                 <a href={gpt.url} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" className="w-full" disabled={gpt.url === '#'}>
                    {gpt.url === '#' ? 'Coming Soon' : 'Open GPT'}
                    {gpt.url !== '#' && <ArrowUpRight className="ml-2 h-4 w-4" />}
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
