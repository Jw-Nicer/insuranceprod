"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  FileText,
  Calculator,
  Mail,
  ShieldCheck,
  TrendingUp,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRELOADED_SKILLS = [
  {
    name: "Summarize Policy",
    description: "Condense any policy document into a one-page brief.",
    icon: FileText,
    accent: "from-primary to-primary/60",
    ring: "ring-primary/30",
  },
  {
    name: "Premium Estimator",
    description: "Quick premium calc with adjustable factors and limits.",
    icon: Calculator,
    accent: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/30",
  },
  {
    name: "Email Drafter",
    description: "Draft broker / client emails in your firm&apos;s tone.",
    icon: Mail,
    accent: "from-cyan-500 to-blue-500",
    ring: "ring-cyan-500/30",
  },
  {
    name: "Coverage Gap Check",
    description: "Compare a policy against a checklist; flag missing endorsements.",
    icon: ShieldCheck,
    accent: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-500/30",
  },
  {
    name: "Loss Ratio Trend",
    description: "Plot loss ratio across years and call out outliers.",
    icon: TrendingUp,
    accent: "from-amber-500 to-orange-500",
    ring: "ring-amber-500/30",
  },
  {
    name: "Carrier Lookup",
    description: "Pull NAIC, AM Best rating, and recent regulatory actions.",
    icon: Search,
    accent: "from-rose-500 to-pink-500",
    ring: "ring-rose-500/30",
  },
];

export default function SkillsPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Aurora hero */}
        <div className="relative isolate overflow-hidden rounded-3xl border bg-background grain">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="aurora-blob-a absolute -top-32 -left-20 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-violet-500/35 via-primary/20 to-transparent blur-3xl" />
            <div className="aurora-blob-b absolute -top-20 right-0 h-[340px] w-[340px] rounded-full bg-gradient-to-br from-cyan-500/30 via-emerald-400/15 to-transparent blur-3xl" />
            <div className="aurora-blob-c absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-amber-300/20 via-rose-400/10 to-transparent blur-3xl" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-50" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    <Sparkles className="mr-1 h-3 w-3" /> In development
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="text-gradient-primary">Skills Library</span>
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Preloaded, single-purpose skills — drop them into any conversation, agent, or workflow. Like having a toolbelt instead of a single GPT.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to dashboard
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/agents">
                    See Agents <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Skills grid */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Preloaded skills</h2>
              <p className="text-xs text-muted-foreground">
                {PRELOADED_SKILLS.length} skills ready to plug into your workflows
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PRELOADED_SKILLS.map((s) => (
              <div
                key={s.name}
                className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.4)]"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.35]" />
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1",
                      s.accent,
                      s.ring,
                    )}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="rounded-full text-[9px] uppercase tracking-wider">
                    Preview
                  </Badge>
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold tracking-tight">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                <div className="border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Wand2 className="h-3 w-3" />
                    Skill
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notify */}
        <section className="rounded-3xl glass p-6 text-center sm:p-8">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:text-violet-400">
            <Wand2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">Skills are coming soon</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            When we ship Skills, they&apos;ll be invokable from your dashboard, GPTs, and Agents — composable building blocks for every workflow.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
