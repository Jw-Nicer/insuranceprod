"use client";

import * as React from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";

export type DateRangePreset = "7d" | "30d" | "90d" | "ytd" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: DateRangePreset;
}

export function presetToRange(preset: Exclude<DateRangePreset, "custom">): DateRange {
  const to = endOfDay(new Date());
  switch (preset) {
    case "7d":
      return { from: startOfDay(subDays(to, 6)), to, preset };
    case "30d":
      return { from: startOfDay(subDays(to, 29)), to, preset };
    case "90d":
      return { from: startOfDay(subDays(to, 89)), to, preset };
    case "ytd":
      return { from: startOfDay(new Date(new Date().getFullYear(), 0, 1)), to, preset };
  }
}

interface DashboardContextValue {
  range: DateRange;
  setRange: (r: DateRange) => void;
  setPreset: (p: Exclude<DateRangePreset, "custom">) => void;
  isLoading: boolean;
}

const DashboardContext = React.createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = React.useState<DateRange>(() => presetToRange("7d"));
  const [isLoading, setIsLoading] = React.useState(false);

  const setPreset = React.useCallback((p: Exclude<DateRangePreset, "custom">) => {
    setRange(presetToRange(p));
  }, []);

  // Simulate refetch latency on range change so skeletons get a chance to show.
  React.useEffect(() => {
    setIsLoading(true);
    const t = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(t);
  }, [range.from.getTime(), range.to.getTime()]);

  const value = React.useMemo(() => ({ range, setRange, setPreset, isLoading }), [range, setPreset, isLoading]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const ctx = React.useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}
