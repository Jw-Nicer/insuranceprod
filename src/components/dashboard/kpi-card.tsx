"use client";

import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type KpiTrend = "up" | "down" | "flat";

export interface KpiCardProps {
  label: string;
  value: number | string;
  /** Optional unit/suffix shown after the animated number, e.g. "h", "%". */
  suffix?: string;
  /** Optional prefix, e.g. "$". */
  prefix?: string;
  /** Percentage change vs previous period (e.g. 12.4 means +12.4%). */
  delta?: number;
  /** Direction of delta. If omitted, inferred from sign of `delta`. */
  trend?: KpiTrend;
  /** Whether an upward delta is "good" (default true). For metrics like response time, set false. */
  positiveIsGood?: boolean;
  /** Sparkline data points. */
  series?: number[];
  /** Lucide icon component. */
  icon?: React.ElementType;
  /** Drill-down route. */
  href?: string;
  /** Accent color (CSS HSL var name without `hsl()`). */
  accent?: "primary" | "emerald" | "amber" | "rose" | "violet";
  className?: string;
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, { from: string; to: string; text: string; bg: string }> = {
  primary: { from: "from-primary/25", to: "to-primary/0", text: "text-primary", bg: "bg-primary/10" },
  emerald: { from: "from-emerald-500/25", to: "to-emerald-500/0", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  amber: { from: "from-amber-500/25", to: "to-amber-500/0", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  rose: { from: "from-rose-500/25", to: "to-rose-500/0", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  violet: { from: "from-violet-500/25", to: "to-violet-500/0", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
};

function AnimatedNumber({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => {
    const isInt = Number.isInteger(value);
    const formatted = isInt
      ? Math.round(latest).toLocaleString()
      : latest.toFixed(1);
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
  });

  React.useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [mv, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function KpiCard({
  label,
  value,
  prefix,
  suffix,
  delta,
  trend,
  positiveIsGood = true,
  series,
  icon: Icon,
  href,
  accent = "primary",
  className,
}: KpiCardProps) {
  const palette = ACCENTS[accent];
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value));
  const showAnimated = !Number.isNaN(numeric) && typeof value === "number";

  const inferredTrend: KpiTrend = trend ?? (delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat");
  const deltaIsGood = inferredTrend === "flat" ? null : positiveIsGood ? inferredTrend === "up" : inferredTrend === "down";
  const deltaColor = deltaIsGood == null ? "text-muted-foreground" : deltaIsGood ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const DeltaIcon = inferredTrend === "up" ? ArrowUpRight : inferredTrend === "down" ? ArrowDownRight : Minus;

  const chartData = React.useMemo(() => (series ?? []).map((y, x) => ({ x, y })), [series]);
  const gradientId = React.useId();

  const Inner = (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all",
        "hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Glow */}
      <div
        aria-hidden
        className={cn("pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl bg-gradient-to-br", palette.from, palette.to)}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {Icon ? (
            <span className={cn("grid h-7 w-7 place-items-center rounded-md", palette.bg, palette.text)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
          ) : null}
          <span className="truncate">{label}</span>
        </div>
        {delta != null ? (
          <span className={cn("inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium", deltaColor)}>
            <DeltaIcon className="h-3 w-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>

      <div className="relative mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        {showAnimated ? (
          <AnimatedNumber value={numeric} prefix={prefix} suffix={suffix} />
        ) : (
          <span>{prefix}{value}{suffix}</span>
        )}
      </div>

      {chartData.length > 1 ? (
        <div className="relative -mx-1 mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
                labelFormatter={() => ""}
                formatter={(v: number) => [v, label]}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="currentColor"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive
                animationDuration={900}
                className={palette.text}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        {Inner}
      </Link>
    );
  }
  return Inner;
}

export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-full rounded-2xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-3 h-12 w-full" />
    </div>
  );
}
