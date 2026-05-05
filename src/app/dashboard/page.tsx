"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BotMessageSquare,
  Newspaper,
  Bookmark as BookmarkIcon,
  ArrowRight,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Clock,
  Search,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Bell,
  DollarSign,
  Command,
  Plus,
} from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/dashboard/kpi-card";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { TrendInsightCard, DonutInsightCard } from "@/components/dashboard/insight-card";
import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { getDashboardData } from "@/components/dashboard/dashboard-data";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------- */
/* Mock activity + alerts                                    */
/* -------------------------------------------------------- */
const ACTIVITY: ActivityItem[] = [
  { id: "1", kind: "quote", title: "New quote drafted for Acme Corp", description: "GL + Property bundle, $2.4M TIV", timestamp: new Date(Date.now() - 1000 * 60 * 18), actor: "Paula" },
  { id: "2", kind: "claim", title: "Claim #C-10482 escalated", description: "Auto bodily injury, awaiting adjuster review", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), actor: "System" },
  { id: "3", kind: "policy", title: "Policy renewed — Northwind Logistics", description: "12-month term, premium up 4.1%", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), actor: "Paula" },
  { id: "4", kind: "benchmark", title: "Benchmark completed — Manufacturing SMB", description: "Loss ratio 62%, 8th decile", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) },
  { id: "5", kind: "system", title: "Loss-run uploader received 14 new files", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30) },
];

const ALERTS = [
  { id: "a1", level: "warn" as const, text: "3 policies expire in the next 7 days", href: "/policies?expiring=7d" },
  { id: "a2", level: "info" as const, text: "New regulatory bulletin: NAIC Cyber MDL", href: "/insurance-news" },
];

/* -------------------------------------------------------- */
/* Aurora hero                                               */
/* -------------------------------------------------------- */
const AuroraHero = () => {
  const today = new Date();
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border bg-background grain">
      {/* Mesh gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob-a absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/40 via-cyan-400/25 to-transparent blur-3xl" />
        <div className="aurora-blob-b absolute -top-24 right-0 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-violet-500/35 via-fuchsia-400/20 to-transparent blur-3xl" />
        <div className="aurora-blob-c absolute -bottom-32 left-1/3 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-emerald-400/25 via-amber-300/15 to-transparent blur-3xl" />
      </div>
      {/* Grid overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-50" />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 live-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Live · {today.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-primary">Welcome back, Paula.</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Your command center for analysis, tools, and daily research. Here&apos;s what&apos;s moving across your book today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker />
            <Button size="sm" variant="outline" className="rounded-full">
              <Command className="mr-1.5 h-3.5 w-3.5" /> Command
              <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </Button>
            <Button size="sm" className="rounded-full">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------- */
/* Quick search bar                                          */
/* -------------------------------------------------------- */
const GlobalSearch = () => {
  const [q, setQ] = React.useState("");
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search portals, claims, GPTs, news…"
        className="h-10 rounded-full border-border/60 bg-background/60 pl-9 pr-16 backdrop-blur"
        aria-label="Global search"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">⌘K</span>
    </div>
  );
};

/* -------------------------------------------------------- */
/* Bento side cards                                          */
/* -------------------------------------------------------- */
const ComplianceBlock = () => (
  <div className="relative overflow-hidden rounded-3xl glass p-5">
    <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-semibold">Compliance — All clear</div>
        <p className="text-xs text-muted-foreground">Last system check 2 minutes ago</p>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-1.5">
      {["KYC", "AML", "GDPR", "SOC2"].map((t) => (
        <Badge key={t} variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
          {t} ✓
        </Badge>
      ))}
    </div>
  </div>
);

const AlertsBlock = () => (
  <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5">
    <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-400/30 blur-3xl" />
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300">
        <Bell className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-semibold">{ALERTS.length} need your attention</div>
        <p className="text-xs text-muted-foreground">Time-sensitive items</p>
      </div>
    </div>
    <ul className="mt-3 space-y-1.5">
      {ALERTS.map((a) => (
        <li key={a.id}>
          <Link href={a.href} className="flex items-center gap-2 rounded-lg p-1.5 text-xs text-muted-foreground transition hover:bg-amber-500/10 hover:text-foreground">
            {a.level === "warn" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> : <FileText className="h-3.5 w-3.5 text-primary" />}
            <span className="flex-1">{a.text}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const FocusBlock = () => (
  <div className="relative overflow-hidden rounded-3xl glass p-5">
    <div className="mb-3 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold tracking-tight">Today&apos;s focus</div>
        <p className="text-xs text-muted-foreground">3 suggested next steps</p>
      </div>
      <Sparkles className="h-4 w-4 text-primary" />
    </div>
    <div className="space-y-2">
      {[
        { icon: Sparkles, text: "Follow up on 3 stale quotes", href: "/quotes", accent: "bg-primary/10 text-primary" },
        { icon: CalendarDays, text: "Renew Acme Corp before May 5", href: "/policies", accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
        { icon: TrendingUp, text: "Run benchmark — SMB segment", href: "/benchmarks", accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
      ].map((item) => (
        <Link
          key={item.text}
          href={item.href}
          className="group flex items-center gap-3 rounded-2xl border border-transparent bg-muted/30 p-2.5 text-sm transition hover:border-border/60 hover:bg-muted/60"
        >
          <span className={cn("grid h-8 w-8 place-items-center rounded-xl", item.accent)}>
            <item.icon className="h-4 w-4" />
          </span>
          <span className="flex-1">{item.text}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  </div>
);

const QuickLinkBento = ({
  title,
  description,
  href,
  icon: Icon,
  accent,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <Link
    href={href}
    className={cn(
      "group relative flex flex-col overflow-hidden rounded-3xl glass p-5 transition-all duration-300",
      "hover:-translate-y-0.5 hover:shadow-lg",
    )}
  >
    <div aria-hidden className={cn("pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100", accent)} />
    <div className="relative flex items-start gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-background/80 ring-1 ring-border">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-base font-semibold tracking-tight">{title}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </div>
  </Link>
);

/* -------------------------------------------------------- */
/* KPI section — bento with featured                         */
/* -------------------------------------------------------- */
const KpiSection = () => {
  const { range, isLoading } = useDashboard();
  const data = React.useMemo(() => getDashboardData(range), [range]);

  // Derive a "featured" premium-bound figure from open quotes.
  const premiumBound = (data.openQuotes.value * 184_500) / 1000; // → thousands
  const premiumBoundFormatted = Math.round(premiumBound);

  return (
    <section aria-label="Key performance indicators" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">At a glance</h2>
          <p className="text-xs text-muted-foreground">For {data.rangeLabel} · vs. previous period</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {isLoading ? (
          <>
            <KpiCardSkeleton featured className="xl:col-span-3" />
            <KpiCardSkeleton className="xl:col-span-3 sm:col-span-2" />
            <KpiCardSkeleton className="xl:col-span-2" />
            <KpiCardSkeleton className="xl:col-span-2" />
            <KpiCardSkeleton className="xl:col-span-2" />
          </>
        ) : (
          <>
            <KpiCard
              className="xl:col-span-3"
              featured
              label="Premium bound"
              value={premiumBoundFormatted}
              prefix="$"
              suffix="K"
              delta={data.openQuotes.delta}
              series={data.openQuotes.series.map((v) => v * 184)}
              icon={DollarSign}
              accent="primary"
              href="/quotes?status=bound"
            />
            <KpiCard
              className="xl:col-span-3 sm:col-span-2"
              featured
              label="Open Quotes"
              value={data.openQuotes.value}
              delta={data.openQuotes.delta}
              series={data.openQuotes.series}
              icon={Sparkles}
              accent="cyan"
              href="/quotes?status=open"
            />
            <KpiCard
              className="xl:col-span-2"
              label="Expiring Policies"
              value={data.expiringPolicies.value}
              delta={data.expiringPolicies.delta}
              positiveIsGood={false}
              series={data.expiringPolicies.series}
              icon={CalendarDays}
              accent="amber"
              href="/policies?expiring=30d"
            />
            <KpiCard
              className="xl:col-span-2"
              label="Benchmarks Run"
              value={data.benchmarks.value}
              delta={data.benchmarks.delta}
              series={data.benchmarks.series}
              icon={TrendingUp}
              accent="violet"
              href="/benchmarks"
            />
            <KpiCard
              className="xl:col-span-2"
              label="Avg. Response Time"
              value={data.responseTime.value}
              suffix="h"
              delta={data.responseTime.delta}
              positiveIsGood={false}
              series={data.responseTime.series}
              icon={Clock}
              accent="emerald"
            />
          </>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------- */
/* Insights row                                              */
/* -------------------------------------------------------- */
const InsightsSection = () => {
  const { range } = useDashboard();
  const data = React.useMemo(() => getDashboardData(range), [range]);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <TrendInsightCard
        className="lg:col-span-8"
        title="Renewals trend"
        description={`Policies renewed across ${data.rangeLabel}`}
        data={data.renewalTrend}
        xKey="label"
        yKey="renewals"
        height={280}
        action={
          <Button asChild size="sm" variant="ghost" className="rounded-full text-xs">
            <Link href="/policies">View all <ChevronRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        }
      />
      <DonutInsightCard
        className="lg:col-span-4"
        title="Claim mix"
        description="By line of business"
        data={data.claimMix}
        nameKey="type"
        valueKey="count"
        height={280}
      />
    </section>
  );
};

/* -------------------------------------------------------- */
/* Page                                                       */
/* -------------------------------------------------------- */
function DashboardContent() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <AuroraHero />

      {/* Utility row — search + side cards */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-3xl glass p-5 lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold tracking-tight">Quick search</div>
              <p className="text-xs text-muted-foreground">Portals, GPTs, claims, news — all from one bar.</p>
            </div>
            <div className="min-w-[260px] flex-1 sm:max-w-md">
              <GlobalSearch />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <ComplianceBlock />
        </div>
      </section>

      {/* KPIs */}
      <KpiSection />

      {/* Insights */}
      <InsightsSection />

      {/* Activity + alerts + focus — bento */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-3xl glass lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">Recent activity</CardTitle>
              <CardDescription>Across quotes, policies, claims, and benchmarks</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost" className="rounded-full text-xs">
              <Link href="/activity">View all <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={ACTIVITY} />
          </CardContent>
        </div>
        <div className="space-y-4 lg:col-span-5">
          <AlertsBlock />
          <FocusBlock />
        </div>
      </section>

      {/* Tools — bento links */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Tools &amp; resources</h2>
          <p className="text-xs text-muted-foreground">Jump into the parts of your workflow you use most.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkBento
            title="GPT Collection"
            description="Curated GPTs for your team."
            href="/gpts"
            icon={BotMessageSquare}
            accent="bg-primary/30"
          />
          <QuickLinkBento
            title="Latest News"
            description="Insurance-industry headlines."
            href="/insurance-news"
            icon={Newspaper}
            accent="bg-cyan-400/30"
          />
          <QuickLinkBento
            title="Bookmarks & Notes"
            description="Save links and research."
            href="/bookmarks"
            icon={BookmarkIcon}
            accent="bg-violet-500/30"
          />
        </div>
      </section>

      {/* What's new */}
      <section className="rounded-3xl glass p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">What&apos;s new</h3>
            <p className="text-xs text-muted-foreground">Recent additions and improvements.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Benchmarking prototype", d: "Compare loss ratios across segments." },
            { t: "Insurance calculator (alpha)", d: "Premium estimator with adjustable factors." },
            { t: "Loss Run uploader", d: "Drop CSVs, get instant projections." },
          ].map((item, i) => (
            <div key={item.t} className="rounded-2xl border bg-background/60 p-3 text-sm transition hover:bg-background/90">
              <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {new Date(Date.now() - i * 86400000).toLocaleDateString()}
              </div>
              <div className="font-semibold tracking-tight">{item.t}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </AppShell>
  );
}
