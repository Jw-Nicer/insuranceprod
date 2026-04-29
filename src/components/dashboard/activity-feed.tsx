"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ActivityKind = "quote" | "policy" | "claim" | "benchmark" | "system";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description?: string;
  timestamp: Date | string;
  actor?: string;
}

const KIND_STYLE: Record<ActivityKind, { dot: string; label: string }> = {
  quote: { dot: "bg-primary", label: "Quote" },
  policy: { dot: "bg-emerald-500", label: "Policy" },
  claim: { dot: "bg-rose-500", label: "Claim" },
  benchmark: { dot: "bg-violet-500", label: "Benchmark" },
  system: { dot: "bg-muted-foreground", label: "System" },
};

export function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </div>
    );
  }

  return (
    <ol className={cn("relative space-y-4 border-l border-border pl-5", className)}>
      {items.map((item, i) => {
        const style = KIND_STYLE[item.kind];
        const ts = typeof item.timestamp === "string" ? new Date(item.timestamp) : item.timestamp;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="relative"
          >
            <span
              aria-hidden
              className={cn(
                "absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ring-4 ring-background",
                style.dot,
              )}
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {style.label}
              </span>
              <span className="text-sm font-medium">{item.title}</span>
              <time className="ml-auto text-xs text-muted-foreground" dateTime={ts.toISOString()}>
                {formatDistanceToNow(ts, { addSuffix: true })}
              </time>
            </div>
            {item.description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            ) : null}
            {item.actor ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground/80">by {item.actor}</p>
            ) : null}
          </motion.li>
        );
      })}
    </ol>
  );
}
