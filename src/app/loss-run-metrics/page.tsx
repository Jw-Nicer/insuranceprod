'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  AlertCircle,
  BarChart,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Coins,
  DollarSign,
  Hash,
  TrendingUp,
  Users,
} from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

async function getMetrics() {
  try {
    const docRef = doc(firestore, 'dashboardMetrics', 'current');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { data: null, error: 'Metrics data not found.' };
    }
    const data = docSnap.data();

    // Convert Firestore Timestamp to string
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

export default function LossRunMetricsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await getMetrics();
      if (error) {
        setError(error);
      } else {
        setData(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (error && !loading) {
    return (
      <AppShell>
        <main className="flex-1 p-4 sm:p-6">
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle /> Error Loading Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please ensure the backend function has run successfully and the
                environment variables for Firebase are correctly configured.
              </p>
            </CardContent>
          </Card>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Loss Run Metrics
          </h1>
          {loading ? <Skeleton className="h-4 w-48" /> : data?.updatedAt && (
            <p className="text-sm text-muted-foreground">
              Last updated: {data.updatedAt}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Total Incurred"
            value={formatCurrency(data?.totalIncurred)}
            icon={DollarSign}
            isLoading={loading}
          />
          <MetricCard
            title="Loss Ratio"
            value={formatPercent(data?.lossRatio)}
            icon={TrendingUp}
            isLoading={loading}
          />
          <MetricCard
            title="Claim Count"
            value={data?.claimCount}
            icon={Hash}
            isLoading={loading}
          />
          <MetricCard
            title="Avg. Severity"
            value={formatCurrency(data?.avgSeverity)}
            icon={CircleDollarSign}
            isLoading={loading}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
             <MetricCard
              title="Total Loss Paid"
              value={formatCurrency(data?.totalLossPaid)}
              icon={Coins}
              isLoading={loading}
            />
            <MetricCard
              title="Total Expense Paid"
              value={formatCurrency(data?.totalExpensePaid)}
              icon={Coins}
              isLoading={loading}
            />
            <MetricCard
              title="Average Premium"
              value={formatCurrency(data?.avgPremium)}
              icon={ClipboardList}
              isLoading={loading}
            />
            <MetricCard
              title="Outstanding Claims"
              value={data?.outstandingClaims}
              icon={AlertCircle}
              isLoading={loading}
            />
             <MetricCard
              title="Avg. Exposure Days"
              value={loading ? "..." : Math.round(data?.avgExposureDays) + ' days'}
              icon={CalendarDays}
              isLoading={loading}
            />
            <MetricCard
              title="Avg. Time to Close"
              value={loading ? "..." : Math.round(data?.avgCloseDays) + ' days'}
              icon={Clock}
              isLoading={loading}
            />
          </div>
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Severity Percentiles</CardTitle>
              <CardDescription>Claim loss distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">25th Percentile</span>
                      <span className="font-bold">{formatCurrency(data?.severityPct['25'])}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">50th Percentile (Median)</span>
                      <span className="font-bold">{formatCurrency(data?.severityPct['50'])}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">75th Percentile</span>
                      <span className="font-bold">{formatCurrency(data?.severityPct['75'])}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>


        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle>Top 5 Insured by Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-[300px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart layout="vertical" data={data?.topInsured} margin={{ right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="insured" type="category" width={100} tick={{ fontSize: 12 }} interval={0}/>
                        <Tooltip
                            formatter={(value) => formatCurrency(value as number)}
                            cursor={{ fill: 'hsl(var(--accent))' }}
                        />
                        <Bar dataKey="loss" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
            </Card>
             <Card className="lg:col-span-3">
                <CardHeader>
                <CardTitle>Loss by Claim Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-[300px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart layout="vertical" data={Object.entries(data?.lossByType || {}).map(([name, value]) => ({name, value}))} margin={{ right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} interval={0}/>
                        <Tooltip
                            formatter={(value) => formatCurrency(value as number)}
                            cursor={{ fill: 'hsl(var(--accent))' }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
            </Card>
        </div>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Monthly Paid vs Premium</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[400px] w-full" /> : (
                 <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data?.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Line type="monotone" dataKey="paid" stroke="hsl(var(--chart-1))" name="Paid" />
                        <Line type="monotone" dataKey="premium" stroke="hsl(var(--chart-2))" name="Premium"/>
                    </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
        </Card>

      </main>
    </AppShell>
  );
}
