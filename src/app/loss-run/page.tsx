'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { LossRunInstructions } from '@/components/loss-run-instructions';
import { LossRunUploader } from '@/components/loss-run-uploader';
import { LossRunDashboard } from '@/components/loss-run-dashboard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingUp, Combine, Percent, Hash } from 'lucide-react';
import { formatPercent } from '@/lib/utils';


export interface PremiumHistory {
  year: number;
  premium: number;
}

export interface UploadedData {
  history: PremiumHistory[];
  totalLossPaid: number;
  totalExpensePaid: number;
  totalPremium: number;
  totalClaims: number;
}


export default function LossRunPage() {
  const [premiumHistory, setPremiumHistory] = useState<PremiumHistory[] | null>(null);
  const [claimsDataJson, setClaimsDataJson] = useState<string | null>(null);
  const [totalClaims, setTotalClaims] = useState<number | null>(null);
  const [ratios, setRatios] = useState<{
    paidLossRatio: number | null;
    expenseRatio: number | null;
    combinedRatio: number | null;
  }>({ paidLossRatio: null, expenseRatio: null, combinedRatio: null });

  const handleDataUploaded = (data: UploadedData, json: string) => {
    setPremiumHistory(data.history);
    setClaimsDataJson(json);
    setTotalClaims(data.totalClaims);

    const paidLossRatio = data.totalPremium > 0 ? data.totalLossPaid / data.totalPremium : 0;
    const expenseRatio = data.totalPremium > 0 ? data.totalExpensePaid / data.totalPremium : 0;
    const combinedRatio = paidLossRatio + expenseRatio;

    setRatios({ paidLossRatio, expenseRatio, combinedRatio });
  };

  const handleReset = () => {
    setPremiumHistory(null);
    setClaimsDataJson(null);
    setTotalClaims(null);
    setRatios({ paidLossRatio: null, expenseRatio: null, combinedRatio: null });
  };

  return (
    <AppShell>
      <main className="flex-1 p-4 sm:p-6">
        {!premiumHistory ? (
          <>
            <LossRunInstructions />
            <LossRunUploader onDataUploaded={handleDataUploaded} />
          </>
        ) : (
          <div className="animate-in fade-in-50 duration-500">
            <div className="flex justify-end mb-4">
              <Button onClick={handleReset} variant="outline">
                Upload New File
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClaims?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total number of claims in the uploaded data.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid Loss Ratio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercent(ratios.paidLossRatio)}</div>
                  <p className="text-xs text-muted-foreground">
                    Shows how much of your premiums are being paid out as losses.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercent(ratios.expenseRatio)}</div>
                  <p className="text-xs text-muted-foreground">
                    Tracks claims-handling costs relative to premium.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Combined Ratio</CardTitle>
                  <Combine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercent(ratios.combinedRatio)}</div>
                  <p className="text-xs text-muted-foreground">
                    Measures underwriting profitability. (Loss + Expense)
                  </p>
                </CardContent>
              </Card>
            </div>

            {premiumHistory && <LossRunDashboard history={premiumHistory} />}
          </div>
        )}
      </main>
    </AppShell>
  );
}
