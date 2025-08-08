'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PremiumHistory } from '@/app/loss-run/page';
import { formatCurrency } from '@/lib/utils';

const scenarios = [
  { label: '3%-4%', rate: 0.035 },
  { label: '5%-6%', rate: 0.055 },
  { label: '10%', rate: 0.1 },
];

interface LossRunDashboardProps {
  history: PremiumHistory[];
}

export function LossRunDashboard({ history: rawHistory }: LossRunDashboardProps) {
  const [scenarioHistory, setScenarioHistory] = useState<PremiumHistory[]>([]);
  const [projection, setProjection] = useState<PremiumHistory[]>([]);
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!rawHistory.length) return;

    const firstPoint = rawHistory[0];
    if (!firstPoint) return;

    const histScenario = rawHistory.map((d) => {
      const yearsSinceStart = d.year - firstPoint.year;
      return {
        year: d.year,
        premium: +(firstPoint.premium * Math.pow(1 + selectedScenario.rate, yearsSinceStart)).toFixed(2),
      };
    });
    setScenarioHistory(histScenario);

    const lastPoint = histScenario[histScenario.length - 1];
    if (!lastPoint) return;

    const futureProj = [];
    for (let i = 1; i <= 5; i++) {
      futureProj.push({
        year: lastPoint.year + i,
        premium: +(lastPoint.premium * Math.pow(1 + selectedScenario.rate, i)).toFixed(2),
      });
    }
    setProjection(futureProj);
  }, [rawHistory, selectedScenario]);
  
  const dataMap: {[key: number]: { year: number; history: number | null; projection: number | null }} = {};

  scenarioHistory.forEach((d) => {
    dataMap[d.year] = { year: d.year, history: d.premium, projection: null };
  });

  projection.forEach((d) => {
    const lastHistPoint = scenarioHistory[scenarioHistory.length-1];
    if(lastHistPoint && d.year === lastHistPoint.year) {
        dataMap[d.year]!.projection = lastHistPoint.premium;
    } else {
        dataMap[d.year] = { year: d.year, history: null, projection: d.premium };
    }
  });
  
  // Create a point to connect the lines
  if (scenarioHistory.length > 0) {
      const lastHistPoint = scenarioHistory[scenarioHistory.length-1];
      if (lastHistPoint) {
          dataMap[lastHistPoint.year]!.projection = lastHistPoint.premium;
      }
  }

  const chartData = Object.values(dataMap).sort((a, b) => a.year - b.year);


  return (
    <div className="grid gap-6 animate-in fade-in-50 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Premium Projection Analysis</CardTitle>
          <CardDescription>
            A premium projection based on your earliest data point, compounded annually by the selected growth scenario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <span className="font-medium text-sm">Growth Scenario:</span>
            <Select
              value={selectedScenario.label}
              onValueChange={(val) => {
                const sc = scenarios.find((s) => s.label === val);
                if (sc) setSelectedScenario(sc);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select rate" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.label} value={s.label}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" domain={['dataMin', 'dataMax']} tickCount={chartData.length} />
              <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value as number), name === 'history' ? 'Adjusted Historical' : 'Projected']}
                labelClassName="font-bold"
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="history"
                name="Adjusted Historical"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="projection"
                name="Projected"
                stroke="hsl(var(--chart-2))"
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                strokeWidth={2}
                connectNulls
              />
               <ReferenceLine
                x={currentYear}
                stroke="hsl(var(--chart-3))"
                strokeDasharray="3 3"
                label={{ value: "Current Year", position: "insideTopLeft" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Adjusted Historical Premiums</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Premium</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {scenarioHistory.map((d) => (
                        <TableRow key={d.year}>
                        <TableCell>{d.year}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.premium)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Projected Premiums</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Premium</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {projection.map((d) => (
                        <TableRow key={d.year}>
                        <TableCell>{d.year}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.premium)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
