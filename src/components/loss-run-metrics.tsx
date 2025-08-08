'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  TrendingUp,
  DollarSign,
  Hash,
  CircleDollarSign,
} from 'lucide-react';
import { formatPercent, formatCurrency } from '@/lib/utils';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricCard } from '@/components/metric-card';

async function getMetrics() {
  try {
    const docRef = doc(firestore, 'dashboardMetrics', 'current');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { data: null, error: 'Metrics data not found.' };
    }
    const data = docSnap.data();

    if (data && data.updatedAt) {
      data.updatedAt = new Date(
        data.updatedAt.seconds * 1000
      ).toLocaleString();
    }

    return { data, error: null };
  } catch (err) {
    console.error(err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'An unknown error occurred while fetching metrics.';
    return { data: null, error: errorMessage };
  }
}

export function LossRunMetrics() {
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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Loss Run Analysis</h1>
        {loadingMetrics ? (
          <Skeleton className="h-4 w-48" />
        ) : (
          metricsData?.updatedAt && (
            <p className="text-sm text-muted-foreground">
              Last updated: {metricsData.updatedAt}
            </p>
          )
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
    </>
  );
}
