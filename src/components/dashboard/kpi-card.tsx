"use client";

import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, ArrowUpRight as ExternalArrow } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type KpiTrend = "up" | "down" | "flat";

export interface KpiCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  delta?: number;
  trend?: KpiTrend;
  positiveIsGood?: boolean;
  series?: number[];
  icon?: React.ElementType;
  href?: string;
  accent?: "primary" | "emerald" | "amber" | "rose" | "violet" | "cyan";
  /** Featured cards get larger numbers, more emphasis. */
  featured?: boolean;
  className?: string;
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, {
  glow: string;
  text: string;
  bg: string;
  ring: string;
  shadow: string;
}> = {
  primary: { glow: "from-primary/30 via-primary/10 to-transparent", text: "text-primary", bg: "bg-primary/10", ring: "ring-primary/20", shadow: "hover:shadow-[0_20px_50px_-25px_hsl(var(--primary)/0.45)]" },
  emerald: { glow: "from-emerald-500/30 via-emerald-500/10 to-transparent", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20", shadow: "hover:shadow-[0_20px_50px_-25px_hsl(160_84%_45%/0.45)]" },
  amber:   { glow: "from-amber-500/30 via-amber-500/10 to-transparent",     text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   ring: "ring-amber-500/20",   shadow: "hover:shadow-[0_20px_50px_-25px_hsl(38_92%_50%/0.45)]" },
  rose:    { glow: "from-rose-500/30 via-rose-500/10 to-transparent",       text: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-500/10",    ring: "ring-rose-500/20",    shadow: "hover:shadow-[0_20px_50px_-25px_hsl(350_84%_60%/0.45)]" },
  violet:  { glow: "from-violet-500/30 via-violet-500/10 to-transparent",   text: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/10",  ring: "ring-violet-500/20",  shadow: "hover:shadow-[0_20px_50px_-25px_hsl(262_83%_58%/0.45)]" },
  cyan:    { glow: "from-cyan-500/30 via-cyan-500/10 to-transparent",       text: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-500/10",    ring: "ring-cyan-500/20",    shadow: "hover:shadow-[0_20px_50px_-25px_hsl(190_90%_50%/0.45)]" },
};

function AnimatedNumber({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => {
    const isInt = Number.isInteger(value);
    const formatted = isInt ? Math.round(latest).toLocaleString() : latest.toFixed(1);
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
  featured = false,
  className,
}: KpiCardProps) {
  const palette = ACCENTS[accent];
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value));
  const showAnimated = !Number.isNaN(numeric) && typeof value === "number";

  const inferredTrend: KpiTrend = trend ?? (delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat");
  const deltaIsGood = inferredTrend === "flat" ? null : positiveIsGood ? inferredTrend === "up" : inferredTrend === "down";
  const deltaColor =
    deltaIsGood == null
      ? "text-muted-foreground bg-muted/60"
      : deltaIsGood
        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15"
        : "text-rose-700 dark:text-rose-300 bg-rose-500/15";
  const DeltaIcon = inferredTrend === "up" ? ArrowUpRight : inferredTrend === "down" ? ArrowDownRight : Minus;

  const chartData = React.useMemo(() => (series ?? []).map((y, x) => ({ x, y })), [series]);
  const gradientId = React.useId();

  const Inner = (
    <div
      className={cn(
        "group/kpi relative isolate h-full overflow-hidden rounded-3xl glass p-5 transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        palette.shadow,
        className,
      )}
    >
      {/* Accent glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl bg-gradient-to-br opacity-70 transition-opacity duration-500 group-hover/kpi:opacity-100",
          palette.glow,
        )}
      />
      {/* Subtle dot grid backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.4]" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {Icon ? (
            <span className={cn("grid h-8 w-8 place-items-center rounded-xl ring-1", palette.bg, palette.text, palette.ring)}>
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <span className="truncate uppercase tracking-wider text-[10px]">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {delta != null ? (
            <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums", deltaColor)}>
              <DeltaIcon className="h-3 w-3" />
              {Math.abs(delta).toFixed(1)}%
            </span>
          ) : null}
          {href ? (
            <span className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100">
              <ExternalArrow className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("relative mt-3 font-semibold tracking-tight tabular-nums", featured ? "text-5xl" : "text-3xl")}>
        {showAnimated ? (
          <AnimatedNumber value={numeric} prefix={prefix} suffix={suffix} />
        ) : (
          <span>{prefix}{value}{suffix}</span>
        )}
      </div>

      {chartData.length > 1 ? (
        <div className={cn("relative -mx-1 mt-3", featured ? "h-20" : "h-12")}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
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
                strokeWidth={2.25}
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
      <Link href={href} className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {Inner}
      </Link>
    );
  }
  return Inner;
}

export function KpiCardSkeleton({ className, featured }: { className?: string; featured?: boolean }) {
  return (
    <div className={cn("h-full rounded-3xl glass p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className={cn("mt-4 w-24", featured ? "h-12" : "h-8")} />
      <Skeleton className={cn("mt-4 w-full", featured ? "h-20" : "h-12")} />
    </div>
  );
}
