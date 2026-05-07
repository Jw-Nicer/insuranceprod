"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BotMessageSquare,
  Newspaper,
  Bookmark as BookmarkIcon,
  ArrowRight,
  UsersRound,
  Wand2,
  FileText,
  Bot,
  Calculator,
  Mail,
  ShieldCheck,
  TrendingUp,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Real data referenced from each section ───────────────────────────────────

const TOOLS = [
  {
    href: "/gpts",
    icon: BotMessageSquare,
    label: "GPT Collection",
    description: "Curated AI assistants purpose-built for insurance workflows.",
    accent: "from-primary/80 to-cyan-500",
    ring: "ring-primary/30",
    status: "live" as const,
  },
  {
    href: "/bookmarks",
    icon: BookmarkIcon,
    label: "Bookmarks & Notes",
    description: "Save links, research, and annotated sources in one place.",
    accent: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-500/30",
    status: "live" as const,
  },
  {
    href: "/loss-run",
    icon: FileText,
    label: "Loss Run",
    description: "Upload and analyse multi-year loss run reports.",
    accent: "from-amber-500 to-orange-500",
    ring: "ring-amber-500/30",
    status: "dev" as const,
  },
];

const AGENT_PREVIEWS = [
  { name: "Underwriting Co-Pilot", description: "Triages submissions, pulls appetite, drafts the first quote.", accent: "from-primary to-primary/60" },
  { name: "Claims Triage", description: "Routes new FNOL into the right queue and auto-flags fast-track items.", accent: "from-rose-500 to-pink-500" },
  { name: "Renewal Watcher", description: "Monitors expiring policies, surfaces blockers, and prepares quotes.", accent: "from-amber-500 to-orange-500" },
  { name: "Loss-Run Analyst", description: "Reads multi-year loss runs and explains trends in plain language.", accent: "from-violet-500 to-fuchsia-500" },
  { name: "Compliance Sentinel", description: "Cross-checks documents against state requirements before binding.", accent: "from-emerald-500 to-teal-500" },
  { name: "Broker Concierge", description: "Handles common broker questions across multiple lines of business.", accent: "from-cyan-500 to-blue-500" },
];

const SKILL_PREVIEWS = [
  { name: "Summarize Policy", description: "Condense any policy document into a one-page brief.", icon: FileText, accent: "from-primary to-primary/60" },
  { name: "Premium Estimator", description: "Quick premium calc with adjustable factors and limits.", icon: Calculator, accent: "from-emerald-500 to-teal-500" },
  { name: "Email Drafter", description: "Draft broker / client emails in your firm's tone.", icon: Mail, accent: "from-cyan-500 to-blue-500" },
  { name: "Coverage Gap Check", description: "Compare a policy against a checklist; flag missing endorsements.", icon: ShieldCheck, accent: "from-violet-500 to-fuchsia-500" },
  { name: "Loss Ratio Trend", description: "Plot loss ratio across years and call out outliers.", icon: TrendingUp, accent: "from-amber-500 to-orange-500" },
  { name: "Carrier Lookup", description: "Pull NAIC, AM Best rating, and recent regulatory actions.", icon: Search, accent: "from-rose-500 to-pink-500" },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
  href,
  count,
  status,
}: {
  title: string;
  description: string;
  href: string;
  count?: number;
  status?: "live" | "dev" | "soon";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {count !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
          {status === "dev" && (
            <Badge variant="outline" className="rounded-full border-amber-500/40 bg-amber-500/8 text-[10px] text-amber-600 dark:text-amber-400">
              In development
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full text-xs">
        <Link href={href}>
          View all <ChevronRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}

// ─── Tools section ────────────────────────────────────────────────────────────

function ToolsSection() {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Tools"
        description="AI-powered tools for your daily insurance workflows."
        href="/gpts"
        count={TOOLS.length}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col overflow-hidden rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.35)]"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.3]" />
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1",
                  tool.accent,
                  tool.ring,
                )}
              >
                <tool.icon className="h-5 w-5" />
              </div>
              {tool.status === "dev" && (
                <Badge variant="outline" className="rounded-full border-amber-500/40 bg-amber-500/8 text-[9px] text-amber-600 dark:text-amber-400">
                  Dev
                </Badge>
              )}
            </div>
            <div className="mt-3 flex-1 space-y-1">
              <h3 className="text-sm font-semibold tracking-tight">{tool.label}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
            <div className="mt-4 flex items-center text-[11px] font-medium text-primary/70 group-hover:text-primary transition-colors">
              Open <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Agents section ───────────────────────────────────────────────────────────

function AgentsSection() {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Insurance Agents"
        description="Purpose-built AI agents that take action across your tools."
        href="/agents"
        count={AGENT_PREVIEWS.length}
        status="dev"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AGENT_PREVIEWS.map((agent) => (
          <div
            key={agent.name}
            className="group relative flex items-start gap-3 overflow-hidden rounded-2xl glass p-4 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.25]" />
            <div
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/10",
                agent.accent,
              )}
            >
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold tracking-tight leading-snug">{agent.name}</div>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{agent.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button asChild size="sm" className="rounded-full">
          <Link href="/agents">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> See Agents
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ─── Skills section ───────────────────────────────────────────────────────────

function SkillsSection() {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Skills Library"
        description="Single-purpose skills — attach files and manage their status."
        href="/skills"
        count={SKILL_PREVIEWS.length}
        status="dev"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_PREVIEWS.map((skill) => (
          <div
            key={skill.name}
            className="group relative flex items-start gap-3 overflow-hidden rounded-2xl glass p-4 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.25]" />
            <div
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/10",
                skill.accent,
              )}
            >
              <skill.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold tracking-tight leading-snug">{skill.name}</div>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{skill.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link href="/skills">
            <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Open Skills Library
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ─── Insurance news section ───────────────────────────────────────────────────

function InsuranceNewsSection() {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Insurance News"
        description="Stay current with industry headlines, regulatory updates, and market moves."
        href="/"
        count={undefined}
      />
      <Link
        href="/"
        className="group relative flex items-center overflow-hidden rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.3)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="aurora-blob-b absolute -top-16 right-0 h-40 w-40 rounded-full bg-gradient-to-bl from-cyan-500/20 via-primary/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-[0.25]" />
        </div>
        <div className="flex flex-1 items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md ring-1 ring-cyan-500/30">
            <Newspaper className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="text-sm font-semibold tracking-tight">Latest Insurance News</div>
            <p className="text-xs text-muted-foreground">
              Curated headlines covering P&amp;C, health, cyber, regulatory filings, and market trends — updated throughout the day.
            </p>
          </div>
        </div>
        <div className="ml-4 flex items-center gap-1 text-[12px] font-medium text-primary/70 group-hover:text-primary transition-colors shrink-0">
          Read now <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </div>
      </Link>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-8">

        {/* Aurora hero */}
        <div className="relative isolate overflow-hidden rounded-3xl border bg-background grain">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="aurora-blob-a absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/40 via-cyan-400/25 to-transparent blur-3xl" />
            <div className="aurora-blob-b absolute -top-24 right-0 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-violet-500/35 via-fuchsia-400/20 to-transparent blur-3xl" />
            <div className="aurora-blob-c absolute -bottom-32 left-1/3 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-emerald-400/25 via-amber-300/15 to-transparent blur-3xl" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-50" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 live-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-primary">Welcome back, Paula.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Your insurance command center. Jump to your tools, review your agents and skills, or catch up on the latest news.
            </p>
          </div>
        </div>

        {/* The four real sections */}
        <ToolsSection />
        <AgentsSection />
        <SkillsSection />
        <InsuranceNewsSection />

      </div>
    </AppShell>
  );
}
