"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange as RDPDateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDashboard, presetToRange, type DateRangePreset } from "./dashboard-context";

const PRESETS: Array<{ value: Exclude<DateRangePreset, "custom">; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
];

const PRESET_LABEL: Record<DateRangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
  custom: "Custom range",
};

export function DateRangePicker({ className }: { className?: string }) {
  const { range, setRange, setPreset } = useDashboard();
  const [open, setOpen] = React.useState(false);

  const display =
    range.preset === "custom"
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
      : PRESET_LABEL[range.preset];

  const handleCalendarSelect = (selected: RDPDateRange | undefined) => {
    if (selected?.from && selected?.to) {
      setRange({ from: selected.from, to: selected.to, preset: "custom" });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 justify-between gap-2 font-normal", className)}
        >
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5" />
            {display}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col gap-0 sm:flex-row">
          <div className="flex flex-col gap-1 border-b p-2 sm:border-b-0 sm:border-r">
            {PRESETS.map((p) => (
              <Button
                key={p.value}
                variant={range.preset === p.value ? "secondary" : "ghost"}
                size="sm"
                className="justify-start text-xs"
                onClick={() => {
                  setPreset(p.value);
                }}
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant={range.preset === "custom" ? "secondary" : "ghost"}
              size="sm"
              className="justify-start text-xs"
              onClick={() => setRange({ ...presetToRange("30d"), preset: "custom" })}
            >
              Custom…
            </Button>
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{ from: range.from, to: range.to }}
            onSelect={handleCalendarSelect}
            defaultMonth={range.from}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
