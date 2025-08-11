'use client';

import { useMemo } from 'react';
import type { Claim } from '@/types';
import type { AnalyzeInsuranceClaimsOutput } from '@/ai/flows/analyze-insurance-claims';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUp, Sparkles, DollarSign, ListChecks, FileText } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

interface InsuranceDashboardProps {
  claims: Claim[];
  analysis: AnalyzeInsuranceClaimsOutput | null;
  onAnalyze: () => void;
  isLoadingAnalysis: boolean;
  onReset: () => void;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function InsuranceDashboard({ claims, analysis, onAnalyze, isLoadingAnalysis, onReset }: InsuranceDashboardProps) {
  const { totalClaims, totalAmount, avgAmount, claimsByType, claimsByStatus } = useMemo(() => {
    if (!claims || claims.length === 0) {
      return { totalClaims: 0, totalAmount: 0, avgAmount: 0, claimsByType: [], claimsByStatus: [] };
    }

    const totalClaims = claims.length;
    const totalAmount = claims.reduce((acc, claim) => acc + (Number(claim.claim_amount) || Number(claim.amount) || 0), 0);
    const avgAmount = totalClaims > 0 ? totalAmount / totalClaims : 0;

    const claimsByType = claims.reduce((acc, claim) => {
        const type = String(claim.claim_type || claim.type || 'Unknown');
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const claimsByStatus = claims.reduce((acc, claim) => {
        const status = String(claim.claim_status || claim.status || 'Unknown');
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    return { 
        totalClaims, 
        totalAmount, 
        avgAmount, 
        claimsByType: Object.entries(claimsByType).map(([name, value]) => ({ name, value })),
        claimsByStatus: Object.entries(claimsByStatus).map(([name, value]) => ({ name, value }))
    };
  }, [claims]);

  const claimKeys = claims.length > 0 ? Object.keys(claims[0]) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between h-16 px-4 border-b shrink-0 sm:px-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
            <FileText />
            Insurance Claims Dashboard
        </h1>
        <Button onClick={onReset} variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Upload New File
        </Button>
      </div>
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/50">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClaims}</div>
              <p className="text-xs text-muted-foreground">claims in the dataset</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claim Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-muted-foreground">across all claims</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Claim Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-muted-foreground">per claim</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="text-accent" /> AI Analysis</CardTitle>
               <CardDescription>Get insights from your data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onAnalyze} disabled={isLoadingAnalysis} className="w-full bg-accent hover:bg-accent/90">
                {isLoadingAnalysis ? 'Analyzing...' : 'Run AI Analysis'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 grid gap-6">
                {(isLoadingAnalysis && !analysis) && (
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Analysis Result</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                )}
                {analysis && (
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Analysis Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{analysis.analysisResult}</p>
                        </CardContent>
                    </Card>
                )}
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Claims by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-64 w-full">
                            <RechartsBarChart data={claimsByType} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Claims by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={{}} className="h-[278px] w-full">
                            <PieChart>
                                <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={claimsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                        <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                        );
                                    }}>
                                    {claimsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Claims Data</CardTitle>
            <CardDescription>A complete list of all claims in the uploaded file.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
                <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                    {claimKeys.map(key => <TableHead key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {claims.map((claim, index) => (
                    <TableRow key={index}>
                        {claimKeys.map(key => (
                            <TableCell key={key}>
                                {key.includes('status') ? (
                                    <Badge variant={String(claim[key]).toLowerCase() === 'approved' ? 'default' : String(claim[key]).toLowerCase() === 'denied' ? 'destructive' : 'secondary'}>
                                        {String(claim[key])}
                                    </Badge>
                                ) : (
                                    String(claim[key])
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </ScrollArea>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
