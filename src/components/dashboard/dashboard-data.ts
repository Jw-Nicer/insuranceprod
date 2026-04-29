import { differenceInCalendarDays, format, addDays } from "date-fns";
import type { DateRange } from "./dashboard-context";

/**
 * Deterministic mock data generator. Same range → same numbers, but values
 * scale with the range length so the dashboard visibly responds to filters.
 * Replace with real Firestore / API queries later.
 */

function seededRandom(seed: number) {
  // Mulberry32
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface KpiDatum {
  value: number;
  delta: number;
  series: number[];
}

export interface DashboardData {
  openQuotes: KpiDatum;
  expiringPolicies: KpiDatum;
  benchmarks: KpiDatum;
  responseTime: KpiDatum;
  renewalTrend: Array<{ label: string; renewals: number }>;
  claimMix: Array<{ type: string; count: number }>;
  rangeLabel: string;
}

const CLAIM_TYPES = ["Property", "Auto", "Liability", "Workers' Comp", "Other"];

export function getDashboardData(range: DateRange): DashboardData {
  const days = Math.max(1, differenceInCalendarDays(range.to, range.from) + 1);
  const seed = Math.floor(range.from.getTime() / 86400000) ^ days;
  const rng = seededRandom(seed);

  const scale = Math.sqrt(days / 7); // 7d ≈ 1x, 30d ≈ 2x, 90d ≈ 3.6x

  const buildSeries = (base: number, volatility = 0.25, length = 7) => {
    let v = base * (0.7 + rng() * 0.4);
    return Array.from({ length }, () => {
      v += (rng() - 0.5) * base * volatility;
      return Math.max(0, Math.round(v * 10) / 10);
    });
  };

  const buildKpi = (base: number, volatility = 0.25, deltaRange = 30): KpiDatum => {
    const value = Math.round(base * scale * (0.85 + rng() * 0.3));
    const delta = Math.round((rng() - 0.45) * deltaRange * 10) / 10;
    return { value, delta, series: buildSeries(base * scale, volatility) };
  };

  const responseHours = Math.round((0.8 + rng() * 1.4) * 10) / 10;

  // Renewal trend buckets — adapt count to range length.
  const buckets = days <= 14 ? 7 : days <= 60 ? 6 : 8;
  const step = Math.max(1, Math.floor(days / buckets));
  const renewalTrend = Array.from({ length: buckets }, (_, i) => {
    const d = addDays(range.from, i * step);
    return {
      label: days <= 14 ? format(d, "EEE") : days <= 90 ? format(d, "MMM d") : format(d, "MMM"),
      renewals: Math.round(8 + rng() * 30 * scale),
    };
  });

  const claimMix = CLAIM_TYPES.map((type) => ({
    type,
    count: Math.round(5 + rng() * 40 * scale),
  }));

  const rangeLabel =
    range.preset === "custom"
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : `the ${range.preset === "ytd" ? "year so far" : `last ${days} days`}`;

  return {
    openQuotes: buildKpi(12, 0.3),
    expiringPolicies: buildKpi(7, 0.2, 20),
    benchmarks: buildKpi(31, 0.35, 40),
    responseTime: {
      value: responseHours,
      delta: Math.round((rng() - 0.55) * 25 * 10) / 10,
      series: buildSeries(responseHours, 0.15),
    },
    renewalTrend,
    claimMix,
    rangeLabel,
  };
}
