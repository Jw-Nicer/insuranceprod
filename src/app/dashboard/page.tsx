"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BotMessageSquare,
  Newspaper,
  Bookmark as BookmarkIcon,
  ArrowRight,
  Globe2,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Clock,
  Search,
  ChevronRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  FileText,
  Target,
  Bell,
} from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@/components/dashboard/kpi-card";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { TrendInsightCard, DonutInsightCard } from "@/components/dashboard/insight-card";
import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { getDashboardData } from "@/components/dashboard/dashboard-data";

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">{children}</kbd>
);

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
/* Hero                                                      */
/* -------------------------------------------------------- */
const PageHero = () => (
  <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-primary/5 p-6 sm:p-8 lg:p-10">
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden>
      <div className="animate-pulse-slow absolute -top-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="animate-pulse-slower absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:24px_24px] opacity-40" />
    </div>
    <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <Badge variant="secondary" className="rounded-full">
          <Activity className="mr-1 h-3 w-3" /> Live · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back, Paula
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Your command center for analysis, tools, and daily research. Everything you need to move the book forward — at a glance.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DateRangePicker />
        <div className="hidden items-center gap-2 rounded-xl border bg-background/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur lg:inline-flex">
          <Globe2 className="h-3.5 w-3.5" />
          Global-ready · i18n / RTL
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/settings">
            Settings <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button size="sm">
          <Sparkles className="mr-1.5 h-4 w-4" /> New quote
        </Button>
      </div>
    </div>
    <div className="mt-5 inline-flex items-center gap-2 rounded-xl border bg-background/80 p-1 pr-3 text-xs text-muted-foreground backdrop-blur">
      <div className="rounded-lg bg-primary/10 px-2 py-1 text-primary">Pro tip</div>
      Press <Kbd>⌘</Kbd>/<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open the command palette
    </div>
  </div>
);

/* -------------------------------------------------------- */
/* Quick link card                                           */
/* -------------------------------------------------------- */
const QuickLinkCard = ({
  title,
  description,
  href,
  icon: Icon,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  linkText: string;
}) => (
  <Card className="group relative flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <CardHeader className="flex-row items-start gap-4 space-y-0">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <CardTitle className="text-lg leading-tight">{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </CardHeader>
    <CardFooter className="mt-auto">
      <Button asChild variant="ghost" className="w-full justify-between">
        <Link href={href}>
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

const GlobalSearch = () => {
  const [q, setQ] = React.useState("");
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tools, pages, news…"
        className="pl-8 pr-14"
        aria-label="Global search"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground">⌘K</span>
    </div>
  );
};

const AlertsStrip = () => (
  <Card className="border-amber-500/30 bg-amber-500/5">
    <div className="flex items-start gap-3 p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium">{ALERTS.length} items need your attention</div>
        <ul className="space-y-1">
          {ALERTS.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              {a.level === "warn" ? (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-primary" />
              )}
              <Link href={a.href} className="hover:underline">{a.text}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
);

/* -------------------------------------------------------- */
/* KPI + insights, range-aware                               */
/* -------------------------------------------------------- */
const KpiSection = () => {
  const { range, isLoading } = useDashboard();
  const data = React.useMemo(() => getDashboardData(range), [range]);

  return (
    <section aria-label="Key performance indicators">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">At a glance</h2>
          <p className="text-xs text-muted-foreground">For {data.rangeLabel}, vs. previous period</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          <Target className="mr-1 h-3.5 w-3.5" /> Set goals
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              label="Open Quotes"
              value={data.openQuotes.value}
              delta={data.openQuotes.delta}
              series={data.openQuotes.series}
              icon={Sparkles}
              accent="primary"
              href="/quotes?status=open"
            />
            <KpiCard
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
              label="Benchmarks Run"
              value={data.benchmarks.value}
              delta={data.benchmarks.delta}
              series={data.benchmarks.series}
              icon={TrendingUp}
              accent="violet"
              href="/benchmarks"
            />
            <KpiCard
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

const InsightsSection = () => {
  const { range } = useDashboard();
  const data = React.useMemo(() => getDashboardData(range), [range]);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <TrendInsightCard
        className="lg:col-span-2"
        title="Renewals trend"
        description={`Policies renewed across ${data.rangeLabel}`}
        data={data.renewalTrend}
        xKey="label"
        yKey="renewals"
        height={240}
        action={
          <Button asChild size="sm" variant="ghost" className="text-xs">
            <Link href="/policies">View all <ChevronRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        }
      />
      <DonutInsightCard
        title="Claim mix"
        description="Open claims by line of business"
        data={data.claimMix}
        nameKey="type"
        valueKey="count"
        height={240}
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
      <PageHero />

      {/* Utility row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Quick search</div>
              <p className="text-xs text-muted-foreground">Look up portals, GPTs, and recent news in one place.</p>
            </div>
            <div className="min-w-[260px] flex-1 sm:max-w-md">
              <GlobalSearch />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between p-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Compliance status</div>
              <p className="text-xs text-muted-foreground">All systems normal · last check 2m ago</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <KpiSection />
      <InsightsSection />

      {/* Activity + alerts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
              <CardDescription>Across quotes, policies, claims, and benchmarks</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs">
              <Link href="/activity">View all <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={ACTIVITY} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <AlertsStrip />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Today&apos;s focus</CardTitle>
              <CardDescription>Suggested next steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: Sparkles, text: "Follow up on 3 stale quotes", href: "/quotes" },
                { icon: CalendarDays, text: "Renew Acme Corp before May 5", href: "/policies" },
                { icon: TrendingUp, text: "Run benchmark for new SMB segment", href: "/benchmarks" },
              ].map((item) => (
                <Link
                  key={item.text}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5 text-sm transition hover:bg-muted/60"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{item.text}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Tools &amp; resources</h2>
          <p className="text-xs text-muted-foreground">Jump straight into the parts of your workflow you use most.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            title="GPT Collection"
            description="Explore and manage your organization's curated GPTs."
            href="/gpts"
            icon={BotMessageSquare}
            linkText="Go to Collection"
          />
          <QuickLinkCard
            title="Latest News"
            description="Stay updated with headlines from the insurance industry."
            href="/insurance-news"
            icon={Newspaper}
            linkText="View News"
          />
          <QuickLinkCard
            title="Bookmarks & Notes"
            description="Save important links and research notes in one place."
            href="/bookmarks"
            icon={BookmarkIcon}
            linkText="Open Bookmarks"
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">What&apos;s new</CardTitle>
          <CardDescription>Recent additions and improvements.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Benchmarking prototype", d: "Compare loss ratios across segments." },
            { t: "Insurance calculator (alpha)", d: "Premium estimator with adjustable factors." },
            { t: "Loss Run uploader", d: "Drop CSVs, get instant projections." },
          ].map((item, i) => (
            <div key={item.t} className="rounded-xl border bg-muted/30 p-3 text-sm transition hover:bg-muted/50">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(Date.now() - i * 86400000).toLocaleDateString()}
              </div>
              <div className="font-medium">{item.t}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.d}</p>
            </div>
          ))}
        </CardContent>
      </Card>
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
