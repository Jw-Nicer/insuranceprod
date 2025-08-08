'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { LossRunInstructions } from '@/components/loss-run-instructions';
import { LossRunUploader } from '@/components/loss-run-uploader';
import { LossRunDashboard } from '@/components/loss-run-dashboard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  TrendingUp,
  Combine,
  Percent,
  Hash,
  AlertCircle,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Coins,
  DollarSign,
} from 'lucide-react';
import { formatPercent, formatCurrency } from '@/lib/utils';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';


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

async function getMetrics() {
  try {
    const docRef = doc(firestore, 'dashboardMetrics', 'current');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { data: null, error: 'Metrics data not found.' };
    }
    const data = docSnap.data();

    if (data && data.updatedAt) {
      data.updatedAt = new Date(data.updatedAt.seconds * 1000).toLocaleString();
    }
    
    return { data, error: null };
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching metrics.';
    return { data: null, error: errorMessage };
  }
}

function MetricCard({
  title,
  value,
  icon,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  const Icon = icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
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

  const [metricsData, setMetricsData] = useState<any>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await getMetrics();
      if (error) {
        setMetricsError(error);
      } else {
        setMetricsData(data);
      }
      setLoadingMetrics(false);
    }
    loadData();
  }, []);

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Loss Run Analysis
          </h1>
          {loadingMetrics ? <Skeleton className="h-4 w-48" /> : metricsData?.updatedAt && (
            <p className="text-sm text-muted-foreground">
              Last updated: {metricsData.updatedAt}
            </p>
          )}
        </div>

        {metricsError && !loadingMetrics && (
          <Card className="bg-destructive/10 border-destructive mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle /> Error Loading Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{metricsError}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please ensure the backend function has run successfully and the
                environment variables for Firebase are correctly configured.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Total Incurred"
            value={formatCurrency(metricsData?.totalIncurred)}
            icon={DollarSign}
            isLoading={loadingMetrics}
          />
          <MetricCard
            title="Loss Ratio"
            value={formatPercent(metricsData?.lossRatio)}
            icon={TrendingUp}
            isLoading={loadingMetrics}
          />
          <MetricCard
            title="Claim Count"
            value={metricsData?.claimCount}
            icon={Hash}
            isLoading={loadingMetrics}
          />
          <MetricCard
            title="Avg. Severity"
            value={formatCurrency(metricsData?.avgSeverity)}
            icon={CircleDollarSign}
            isLoading={loadingMetrics}
          />
        </div>

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

            <LossRunDashboard history={premiumHistory} />
          </div>
        )}
      </main>
    </AppShell>
  );
}