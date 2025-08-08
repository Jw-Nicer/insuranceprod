'use client';

import type { PremiumHistory } from '@/app/loss-run/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LossRunDashboardProps {
  history: PremiumHistory[];
}

export function LossRunDashboard({ history }: LossRunDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Premium History</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-80 w-full">
          <ResponsiveContainer>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                tickFormatter={(value) =>
                  `$${(value / 1000).toLocaleString()}k`
                }
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Bar
                dataKey="premium"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
