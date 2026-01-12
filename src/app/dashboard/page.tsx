
"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BotMessageSquare, Newspaper, Bookmark as BookmarkIcon, ArrowRight, Globe2, CalendarDays, Sparkles, TrendingUp, Clock, Search, ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/************************************
 * Tiny helpers
 ************************************/
const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">{children}</kbd>
);

/************************************
 * Animated gradient header
 ************************************/
const PageHero = () => (
  <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-background to-muted/40 p-6 sm:p-8 lg:p-10">
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden>
      <div className="animate-pulse-slow absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="animate-pulse-slower absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
    </div>
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Insurance Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Your command center for analysis, tools, and daily research.</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border bg-background/80 p-2">
        <Globe2 className="h-4 w-4" />
        <span className="text-xs text-muted-foreground">Global-ready • i18n/RTL</span>
      </div>
    </div>
    <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-2 rounded-xl border bg-background p-1 pr-2 text-sm text-muted-foreground">
        <div className="rounded-lg bg-primary/10 px-2 py-1 text-primary">Pro tip</div>
        Press <Kbd>⌘</Kbd>/<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open the command palette
      </div>
      <Link href="/settings" className="group inline-flex items-center gap-2 text-sm text-primary">
        Quick settings <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  </div>
);

/************************************
 * Quick Link Card (elevated + subtle motion)
 ************************************/
const QuickLinkCard = ({ title, description, href, icon: Icon, linkText }: { title: string; description: string; href: string; icon: React.ElementType; linkText: string }) => (
  <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-lg">
    <CardHeader className="flex-row items-start gap-4 space-y-0">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <CardTitle className="leading-tight">{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </CardHeader>
    <CardFooter className="mt-auto">
      <Button asChild className="w-full">
        <Link href={href}>
          {linkText}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

/************************************
 * KPI strip (dummy values – wire to real data later)
 ************************************/
const KPIs = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {[
      { label: "Open Quotes", value: "12", icon: Sparkles },
      { label: "Expiring Policies", value: "7", icon: CalendarDays },
      { label: "Benchmarks Run", value: "31", icon: TrendingUp },
      { label: "Avg. Response Time", value: "1.2h", icon: Clock },
    ].map((k) => (
      <div key={k.label} className="rounded-xl border bg-background p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <k.icon className="h-3.5 w-3.5" />
          {k.label}
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{k.value}</div>
      </div>
    ))}
  </div>
);

/************************************
 * Search bar (client-only – can be wired to cmd palette)
 ************************************/
const GlobalSearch = ({ onFocusCmd }: { onFocusCmd: () => void }) => {
  const [q, setQ] = React.useState("");
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={onFocusCmd}
        placeholder="Search tools, pages, news…"
        className="pl-8 pr-14"
        aria-label="Global search"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground">⌘K</span>
    </div>
  );
};

/************************************
 * Page
 ************************************/
export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <PageHero />

        {/* Utility row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="col-span-2">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Quick search</div>
                <p className="text-xs text-muted-foreground">Look up portals, GPTs, and recent news in one place.</p>
              </div>
              <div className="min-w-[260px] flex-1 sm:max-w-md">
                <GlobalSearch onFocusCmd={() => { /* can open cmd palette here */ }} />
              </div>
            </div>
          </Card>
          <Card className="">
            <div className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Compliance status</div>
                <p className="text-xs text-muted-foreground">All systems normal</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* KPIs */}
        <KPIs />

        {/* Quick links */}
        <Separator className="my-2" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            title="GPT Collection"
            description="Explore and manage your organization’s curated GPTs."
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

        {/* What’s new */}
        <Card>
          <CardHeader>
            <CardTitle>What’s new</CardTitle>
            <CardDescription>Recent additions and improvements.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Benchmarking prototype", "Insurance calculator (alpha)", "Loss Run uploader" ].map((t, i) => (
              <div key={t} className="rounded-xl border bg-muted/30 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                </div>
                <div className="font-medium">{t}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
