'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { LossRunInstructions } from '@/components/loss-run-instructions';
import { LossRunUploader } from '@/components/loss-run-uploader';
import { LossRunDashboard } from '@/components/loss-run-dashboard';
import { Button } from '@/components/ui/button';
import { LossRunMetrics } from '@/components/loss-run-metrics';
import type { UploadedData, PremiumHistory } from '@/types';

export default function LossRunPage() {
  const [premiumHistory, setPremiumHistory] = useState<PremiumHistory[] | null>(
    null
  );
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

    const paidLossRatio =
      data.totalPremium > 0 ? data.totalLossPaid / data.totalPremium : 0;
    const expenseRatio =
      data.totalPremium > 0 ? data.totalExpensePaid / data.totalPremium : 0;
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
        <LossRunMetrics />
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

            <LossRunDashboard
              history={premiumHistory}
              totalClaims={totalClaims}
              ratios={ratios}
            />
          </div>
        )}
      </main>
    </AppShell>
  );
}
