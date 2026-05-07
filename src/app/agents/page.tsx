"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersRound,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Search,
  Workflow,
  Bot,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLANNED_AGENTS = [
  {
    name: "Underwriting Co-Pilot",
    description: "Triages submissions, pulls Hartford appetite, drafts the first quote.",
    accent: "from-primary to-primary/60",
    ring: "ring-primary/30",
  },
  {
    name: "Claims Triage",
    description: "Routes new FNOL into the right queue and auto-flags fast-track items.",
    accent: "from-rose-500 to-pink-500",
    ring: "ring-rose-500/30",
  },
  {
    name: "Renewal Watcher",
    description: "Monitors expiring policies, surfaces blockers, and prepares quotes.",
    accent: "from-amber-500 to-orange-500",
    ring: "ring-amber-500/30",
  },
  {
    name: "Loss-Run Analyst",
    description: "Reads multi-year loss runs and explains trends in plain language.",
    accent: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-500/30",
  },
  {
    name: "Compliance Sentinel",
    description: "Cross-checks documents against state requirements before binding.",
    accent: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/30",
  },
  {
    name: "Broker Concierge",
    description: "Handles common broker questions across multiple lines of business.",
    accent: "from-cyan-500 to-blue-500",
    ring: "ring-cyan-500/30",
  },
];

export default function AgentsPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Aurora hero */}
        <div className="relative isolate overflow-hidden rounded-3xl border bg-background grain">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="aurora-blob-a absolute -top-32 -left-20 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-primary/35 via-cyan-400/20 to-transparent blur-3xl" />
            <div className="aurora-blob-b absolute -top-20 right-0 h-[340px] w-[340px] rounded-full bg-gradient-to-br from-violet-500/30 via-fuchsia-400/15 to-transparent blur-3xl" />
            <div className="aurora-blob-c absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-400/20 via-amber-300/10 to-transparent blur-3xl" />
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
                  <span className="text-gradient-primary">Insurance Agents</span>
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  ChatGPT Agents purpose-built for insurance workflows. Unlike GPTs, Agents take action — they triage, draft, and follow up across your tools.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to dashboard
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/gpts">
                    Browse GPTs <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* What's coming strip */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Search, title: "Triage submissions", desc: "Auto-route by appetite" },
                { icon: Workflow, title: "Multi-step workflows", desc: "Chain quote → bind → invoice" },
                { icon: ShieldCheck, title: "Guardrails", desc: "Compliance & approvals" },
              ].map((p) => (
                <div key={p.title} className="rounded-2xl border bg-background/60 p-3 backdrop-blur">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <p.icon className="h-3 w-3" />
                    {p.title}
                  </div>
                  <div className="mt-1 text-sm font-medium tracking-tight">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Planned agents preview */}
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Coming to your team</h2>
            <p className="text-xs text-muted-foreground">
              Six insurance-specific Agents we&apos;re building next.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLANNED_AGENTS.map((a) => (
              <div
                key={a.name}
                className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.4)]"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.35]" />
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1",
                      a.accent,
                      a.ring,
                    )}
                  >
                    <Bot className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="rounded-full text-[9px] uppercase tracking-wider">
                    Planned
                  </Badge>
                </div>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold tracking-tight">{a.name}</h3>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
                <div className="border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <UsersRound className="h-3 w-3" />
                    Insurance Agent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notify card */}
        <section className="rounded-3xl glass p-6 text-center sm:p-8">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">We&apos;re wiring this up</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Once Agents are live, you&apos;ll launch them right from this page — same flow as GPT Collection, but they execute, not just chat.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
