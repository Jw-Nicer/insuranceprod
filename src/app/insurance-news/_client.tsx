
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Search,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Bookmark,
  BookmarkCheck,
  Copy as CopyIcon,
  Filter,
  CalendarDays,
  Newspaper,
  Globe2,
  Radio,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

/************************************
 * Types
 ************************************/
interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: Record<string, unknown>;
  categories: string[];
}

type EnrichedNews = NewsItem & { _sourceKey: string; _sourceName: string };

interface SourceDef {
  key: string;
  name: string;
  url: string; // RSS feed URL
  region?: string;
  notes?: string;
}

/************************************
 * Labels
 ************************************/
const L = {
  title: "Insurance News",
  subtitle:
    "The latest headlines from the insurance industry, aggregated from multiple trusted sources.",
  search: "Search news…",
  sort: "Sort",
  sortBy: "Sort by",
  newest: "Newest first",
  oldest: "Oldest first",
  az: "A → Z",
  za: "Z → A",
  all: "All",
  sources: "Sources",
  topics: "Topics",
  read: "Read Full Article",
  copy: "Copy link",
  refresh: "Refresh",
  emptyTitle: "No articles match",
  emptyDesc: "Try adjusting your search, filters, sources, or topics.",
  errorTitle: "Error",
  errorDesc: "Could not load the news feeds.",
  loading: "Loading news…",
  saved: "Saved",
  unsaved: "Removed bookmark",
  items: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
};

/************************************
 * Config – Multiple RSS Feeds
 ************************************/
const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const RSS_SOURCES: SourceDef[] = [
  {
    key: "insurancejournal",
    name: "Insurance Journal (US)",
    url: "https://www.insurancejournal.com/news/national/feed/",
    region: "US",
  },
  {
    key: "claimsjournal",
    name: "Claims Journal (US)",
    url: "https://www.claimsjournal.com/rss/news",
    region: "US",
  },
  {
    key: "reinsurancene.ws",
    name: "Reinsurance News (Global)",
    url: "https://www.reinsurancene.ws/feed/",
    region: "Global",
  },
  {
    key: "artemis",
    name: "Artemis – ILS & Reinsurance",
    url: "https://www.artemis.bm/news/feed/",
    region: "Global",
  },
];

/************************************
 * Utils
 ************************************/
const stripHtml = (html: string) => {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

function formatAbsolute(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  // Deterministic on server to avoid hydration mismatch.
  if (typeof window === "undefined") return d.toLocaleDateString("en-CA");
  try {
    return new Intl.DateTimeFormat(navigator?.language || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime()) || typeof window === "undefined") return "";
  const diff = (d.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(navigator?.language || "en-US", {
    numeric: "auto",
  });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, sec] of units) {
    const value = Math.round(diff / sec);
    if (Math.abs(value) >= 1) return rtf.format(value, unit);
  }
  return rtf.format(Math.round(diff), "second");
}

/************************************
 * Keyword helpers
 ************************************/
const LOB_KEYWORDS: Record<string, string[]> = {
  Property: ["property", "homeowner", "homeowners"],
  Auto: ["auto", "automobile", "motor vehicle", "personal auto", "commercial auto"],
  "General Liability": ["general liability", "cgl", "liability coverage"],
  Cyber: ["cyber", "ransomware", "data breach", "phishing"],
  "Workers' Comp": [
    "workers compensation",
    "workers' compensation",
    "workers comp",
    " wc ",
  ],
  "Health/Life": [
    "life insurance",
    "life insurer",
    "health plan",
    "health insurance",
    "medicare",
    "medicaid",
    "benefit",
  ],
  Marine: ["marine", "cargo", "inland marine", "hull"],
  Aviation: ["aviation", "aircraft", "drone"],
  "D&O / E&O / Prof. Liab.": [
    "d&o",
    "directors and officers",
    "e&o",
    "errors and omissions",
    "professional liability",
  ],
  Reinsurance: ["reinsurance", "retrocession", "cat bond", "insurance-linked securities", "ils"],
  Flood: ["flood", "nfip"],
  Parametric: ["parametric"],
};

const THEME_KEYWORDS: Record<string, string[]> = {
  "Catastrophes & Weather": [
    "hurricane",
    "tropical",
    "wildfire",
    "earthquake",
    "storm",
    "tornado",
    "hail",
    "heatwave",
    "flood",
    "windstorm",
    "convective",
  ],
  "Regulation & Policy": [
    "naic",
    "commissioner",
    "department of insurance",
    "rulemaking",
    "regulation",
    "statute",
    "bill",
    "legislation",
    "law",
    "compliance",
  ],
  "Rates & Pricing": [
    "rate hike",
    "rate increase",
    "rate filing",
    "rates approved",
    "pricing",
    "premium up",
    "premium down",
    "renewal rate",
  ],
  "Claims & Litigation": [
    "claim",
    "lawsuit",
    "litigation",
    "settlement",
    "verdict",
    "jury",
    "class action",
  ],
  "Technology & AI": [
    "artificial intelligence",
    " ai ",
    "genai",
    "machine learning",
    "insurtech",
    "platform",
    "cloud",
    "cybersecurity",
  ],
  "M&A & Partnerships": [
    "acquire",
    "acquisition",
    "merger",
    "buy ",
    "sell ",
    "spinoff",
    "spin off",
    "partnership",
    "joint venture",
  ],
  "Financials & Earnings": [
    "earnings",
    "quarter",
    "guidance",
    "revenue",
    "net income",
    "combined ratio",
    "underwriting profit",
    "loss ratio",
    " q1 ",
    " q2 ",
    " q3 ",
    " q4 ",
  ],
  "Distribution & Brokers": [
    "broker",
    "agency",
    "wholesale",
    "retail agent",
    "producer",
    "mga",
  ],
  "Fraud & Crime": ["fraud", "indicted", "indictment", "arrest", "scheme"],
  "Product & Underwriting": [
    "launch",
    "introduce",
    "program",
    "coverage",
    "capacity",
    "underwriting appetite",
  ],
  "Reserving & Losses": ["reserve", "loss reserve", "adverse development"],
  "ESG & Climate": [
    "climate",
    "esg",
    "sustainability",
    "transition risk",
    "net-zero",
    "net zero",
  ],
};

const REGION_KEYWORDS: Record<string, string[]> = {
  "US - California": ["california"],
  "US - Florida": ["florida"],
  "US - Texas": ["texas"],
  "US - New York": ["new york"],
  "US - National": ["united states", "u.s.", " us "],
  Canada: ["canada", "canadian"],
  Europe: [
    "europe",
    "european union",
    "eu ",
    "united kingdom",
    " uk ",
    "britain",
    "england",
    "france",
    "germany",
    "italy",
    "spain",
    "netherlands",
  ],
  Asia: ["asia", "china", "japan", "india", "singapore", "hong kong", "korea"],
  "Latin America": ["latin america", "mexico", "brazil", "argentina", "chile", "colombia"],
  Global: ["global", "worldwide", "international"],
};

function lower(s: string) {
  return s.toLowerCase();
}
function anyIncludes(text: string, keywords: string[]) {
  const t = lower(text);
  return keywords.some((k) => t.includes(lower(k)));
}
function matchFromKeywords(map: Record<string, string[]>, text: string) {
  const hits: string[] = [];
  for (const [label, words] of Object.entries(map)) {
    if (anyIncludes(text, words)) hits.push(label);
  }
  return hits;
}
function deriveMeta(item: NewsItem) {
  const text = `${item.title} ${stripHtml(item.description || "")} ${(
    item.categories || []
  ).join(" ")}`;
  const lobs = matchFromKeywords(LOB_KEYWORDS, text);
  const themes = matchFromKeywords(THEME_KEYWORDS, text);
  const regions = matchFromKeywords(REGION_KEYWORDS, text);
  const topics = [...lobs, ...themes, ...regions];
  const primary = lobs[0] || themes[0] || regions[0] || "General";
  return { lobs, themes, regions, topics, primary };
}
function buildTopicIndex(items: EnrichedNews[]) {
  const counts = new Map<string, number>();
  for (const it of items) {
    const uniq = new Set(deriveMeta(it).topics);
    for (const t of uniq) counts.set(t, (counts.get(t) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));
}
function buildSourceIndex(items: EnrichedNews[]) {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it._sourceName, (counts.get(it._sourceName) || 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count }));
}

/************************************
 * Page state/types
 ************************************/

type SortKey = "newest" | "oldest" | "az" | "za";

type View = "grid" | "list";

// Stable defaults for useLocalStorage to avoid re-initialization
const LS_DEFAULT_VIEW: View = "grid";
const LS_DEFAULT_BOOKMARKS: Record<string, boolean> = {};
const LS_DEFAULT_SOURCES: string[] = RSS_SOURCES.map((s) => s.key);

// Pure helper outside component so it never changes identity
const idFor = (item: NewsItem) =>
  (item.guid || item.link || item.title).replace(/https?:\/\//, "").toLowerCase();

export default function InsuranceNewsClient() {
  const { toast } = useToast();

  // Local state
  const [news, setNews] = React.useState<EnrichedNews[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [selectedTopic, setSelectedTopic] = React.useState<string>(L.all);
  const [selectedSource, setSelectedSource] = React.useState<string>(L.all);
  const [view, setView] = useLocalStorage<View>("news:view", LS_DEFAULT_VIEW);
  const [bookmarks, setBookmarks] = useLocalStorage<Record<string, boolean>>(
    "news:bookmarks",
    LS_DEFAULT_BOOKMARKS
  );
  const [activeSourceKeys, setActiveSourceKeys] = useLocalStorage<string[]>(
    "news:activeSources",
    LS_DEFAULT_SOURCES
  );

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [reload, setReload] = React.useState(0);
  const [page, setPage] = React.useState(1);

  const PAGE_SIZE = 12;
  const proxyUrl = (url: string) => `${RSS2JSON}${encodeURIComponent(url)}`;

  // Fetch once on mount + when sources or reload changes
  React.useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const tsStart = Date.now();

      const active = RSS_SOURCES.filter((s) => activeSourceKeys.includes(s.key));

      try {
        const results = await Promise.allSettled(
          active.map(async (src) => {
            const res = await fetch(proxyUrl(src.url), {
              next: { revalidate: 21600 },
              signal: controller.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.status !== "ok") throw new Error("Bad feed response");
            const items: EnrichedNews[] = (data.items || []).map((it: NewsItem) => ({
              ...it,
              _sourceKey: src.key,
              _sourceName: src.name,
            }));
            return items;
          })
        );

        const all: EnrichedNews[] = [];
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          if (r.status === "fulfilled") all.push(...r.value);
        }

        // Deduplicate
        const seen = new Set<string>();
        const deduped = all.filter((it) => {
          const k = idFor(it);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        if (!cancelled) {
          setNews(deduped);
          setLastUpdated(new Date(tsStart));
          setPage(1);
          setSelectedTopic(L.all);
          setSelectedSource(L.all);
        }
      } catch (err: any) {
        if (!cancelled && err?.name !== "AbortError")
          setError(err?.message || "An unknown error occurred.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeSourceKeys.join("|"), reload]);

  const topicChips = React.useMemo(() => {
    const idx = buildTopicIndex(news);
    const top = idx.filter((t) => t.count > 0).slice(0, 12);
    return [{ topic: L.all, count: news.length }, ...top];
  }, [news]);

  const sourceChips = React.useMemo(() => {
    const idx = buildSourceIndex(news);
    const mapped = idx.map(({ source, count }) => ({ source, count }));
    return [{ source: L.all, count: news.length }, ...mapped];
  }, [news]);

  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let list = news.filter((n) => {
      const meta = deriveMeta(n);
      const textMatch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        stripHtml(n.description).toLowerCase().includes(q);
      const topicMatch = selectedTopic === L.all || meta.topics.includes(selectedTopic);
      const sourceMatch = selectedSource === L.all || n._sourceName === selectedSource;
      return textMatch && topicMatch && sourceMatch;
    });
    switch (sort) {
      case "newest":
        list = list.sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
        break;
      case "oldest":
        list = list.sort((a, b) => +new Date(a.pubDate) - +new Date(b.pubDate));
        break;
      case "az":
        list = list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        list = list.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return list;
  }, [news, deferredQuery, sort, selectedTopic, selectedSource]);

  const visible = React.useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  const toggleBookmark = React.useCallback(
    (id: string) => {
      const uniqueId = id.replace(/https?:\/\//, "").toLowerCase();
      setBookmarks((prev) => {
        const nextActive = !prev[uniqueId];
        const next = { ...prev, [uniqueId]: nextActive };
        toast({ title: nextActive ? L.saved : L.unsaved });
        return next;
      });
    },
    [setBookmarks, toast]
  );

  const copyLink = React.useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Copied", description: "Link copied to clipboard." });
      } catch {
        toast({
          title: "Copy failed",
          description: "Unable to copy link.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const toggleActiveSource = React.useCallback(
    (key: string) => {
      setActiveSourceKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    },
    [setActiveSourceKeys]
  );

  return (
    <div className="max-w-full overflow-x-hidden space-y-6">
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
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 live-dot" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {mounted && lastUpdated
                      ? `Updated ${formatRelative(lastUpdated)}`
                      : "Live · Insurance industry feed"}
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="text-gradient-primary">{L.title}</span>
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base break-words">
                  {L.subtitle}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Radio className="mr-1.5 h-3.5 w-3.5" />
                      {L.sources}
                      <Badge variant="secondary" className="ml-2 rounded-full px-1.5 text-[10px]">
                        {activeSourceKeys.length}/{RSS_SOURCES.length}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 max-w-[90vw]">
                    <DropdownMenuLabel>Active feeds</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {RSS_SOURCES.map((s) => (
                      <DropdownMenuCheckboxItem
                        key={s.key}
                        checked={activeSourceKeys.includes(s.key)}
                        onCheckedChange={() => toggleActiveSource(s.key)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm">{s.name}</span>
                          <span className="text-[11px] text-muted-foreground">{s.region || ""}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setReload((r) => r + 1)}
                  aria-label={L.refresh}
                >
                  <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
                  {L.refresh}
                </Button>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Articles", value: filtered.length, icon: Newspaper },
                { label: "Sources active", value: activeSourceKeys.length, icon: Radio },
                { label: "Topics", value: Math.max(0, topicChips.length - 1), icon: Sparkles },
                { label: "Bookmarked", value: Object.values(bookmarks).filter(Boolean).length, icon: BookmarkCheck },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-background/60 p-3 backdrop-blur">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <s.icon className="h-3 w-3" />
                    {s.label}
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                    {s.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl glass p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={L.search}
                className="h-9 rounded-full border-border/60 bg-background/60 pl-9 pr-9 text-sm"
                aria-label="Search news"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                {L.items(filtered.length)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Filter className="mr-1.5 h-3.5 w-3.5" />
                    {L.sort}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-w-[90vw]">
                  <DropdownMenuLabel>{L.sortBy}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    { k: "newest", label: L.newest },
                    { k: "oldest", label: L.oldest },
                    { k: "az", label: L.az },
                    { k: "za", label: L.za },
                  ].map((o) => (
                    <DropdownMenuItem key={o.k} onClick={() => setSort(o.k as SortKey)}>
                      {o.label}
                      {sort === o.k && (
                        <Badge className="ml-auto" variant="secondary">
                          Active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden overflow-hidden rounded-full border border-border/60 bg-background/60 sm:flex">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={cn(
                    "grid h-8 w-9 place-items-center transition-colors",
                    view === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={cn(
                    "grid h-8 w-9 place-items-center transition-colors",
                    view === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <ListIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Source chips */}
          <div className="mt-3">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">Sources</div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex min-w-0 items-center gap-1.5 pb-2">
                {sourceChips.map(({ source, count }) => {
                  const active = selectedSource === source;
                  return (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                        active
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {source}
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums", active ? "bg-primary/20" : "bg-muted")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Topic chips */}
          <div className="mt-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">Topics</div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex min-w-0 items-center gap-1.5 pb-2">
                {topicChips.map(({ topic, count }) => {
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                        active
                          ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                          : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {topic}
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums", active ? "bg-violet-500/20" : "bg-muted")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div aria-busy>
            <div className="rounded-3xl glass overflow-hidden">
              <Skeleton className="h-72 w-full rounded-none" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl glass overflow-hidden">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl glass border-destructive/30 p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <X className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold tracking-tight text-destructive">{L.errorTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{L.errorDesc}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">{error}</p>
                <Button onClick={() => setReload((r) => r + 1)} size="sm" className="mt-3 rounded-full">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> {L.refresh}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Featured + grid/list */}
        {!loading && !error && (filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {view === "grid" ? (
              <div className="space-y-5">
                {visible[0] && (
                  <motion.div
                    key={`featured-${idFor(visible[0])}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FeaturedArticle
                      item={visible[0]}
                      isBookmarked={!!bookmarks[idFor(visible[0])]}
                      onBookmark={() => toggleBookmark(idFor(visible[0]))}
                      onCopy={() => copyLink(visible[0].link)}
                      mounted={mounted}
                    />
                  </motion.div>
                )}
                {visible.length > 1 && (
                  <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {visible.slice(1).map((item) => (
                      <motion.div
                        key={idFor(item)}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="min-w-0"
                      >
                        <NewsCardGrid
                          item={item}
                          isBookmarked={!!bookmarks[idFor(item)]}
                          onBookmark={() => toggleBookmark(idFor(item))}
                          onCopy={() => copyLink(item.link)}
                          mounted={mounted}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((item) => (
                  <motion.div
                    key={idFor(item)}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="min-w-0"
                  >
                    <NewsCardList
                      item={item}
                      isBookmarked={!!bookmarks[idFor(item)]}
                      onBookmark={() => toggleBookmark(idFor(item))}
                      onCopy={() => copyLink(item.link)}
                      mounted={mounted}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        ))}

        {/* Load more */}
        {!loading && !error && hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} className="rounded-full">
              Load more <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        )}
    </div>
  );
}

/************************************
 * Presentational components
 ************************************/
function TopicChips({ meta, max = 3, dense = false }: { meta: ReturnType<typeof deriveMeta>; max?: number; dense?: boolean }) {
  const chips = [
    ...meta.lobs.slice(0, 1),
    ...meta.themes.slice(0, 1),
    ...meta.regions.slice(0, 1),
  ].slice(0, max);
  if (chips.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", dense ? "" : "mt-2")} aria-label="Tags">
      {chips.map((t, i) => (
        <span
          key={t}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide",
            i === 0 ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-background/60 text-muted-foreground",
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function SourceTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      <Radio className="h-2.5 w-2.5" />
      {name}
    </span>
  );
}

/* Featured (hero) article — image-as-background banner */
function FeaturedArticle({
  item,
  isBookmarked,
  onBookmark,
  onCopy,
  mounted,
}: {
  item: EnrichedNews;
  isBookmarked: boolean;
  onBookmark: () => void;
  onCopy: () => void;
  mounted: boolean;
}) {
  const meta = deriveMeta(item);
  return (
    <article className="group relative isolate overflow-hidden rounded-3xl border bg-card">
      {/* Background image */}
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/30 via-violet-500/20 to-cyan-400/20" />
      )}
      {/* Gradient veil */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      <div className="relative grid min-h-[300px] gap-4 p-6 sm:min-h-[360px] sm:p-8 lg:min-h-[400px] lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
            <Sparkles className="h-3 w-3" /> Featured
          </span>
          <SourceTag name={item._sourceName} />
        </div>
        <div className="mt-auto max-w-3xl space-y-3">
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {item.title}
          </h2>
          <p className="line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-base">
            {stripHtml(item.description)}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <TopicChips meta={meta} max={3} dense />
            <span className="inline-flex items-center gap-1 text-[11px] text-white/70">
              <CalendarDays className="h-3 w-3" />
              {mounted ? formatRelative(item.pubDate) : formatAbsolute(item.pubDate)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button asChild className="rounded-full">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {L.read}
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
            <Button onClick={onBookmark} variant="secondary" size="icon" className="h-9 w-9 rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={isBookmarked ? "Bookmarked" : "Bookmark"}>
              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            <Button onClick={onCopy} variant="secondary" size="icon" className="h-9 w-9 rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={L.copy}>
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function NewsCardGrid({
  item,
  isBookmarked,
  onBookmark,
  onCopy,
  mounted,
}: {
  item: EnrichedNews;
  isBookmarked: boolean;
  onBookmark: () => void;
  onCopy: () => void;
  mounted: boolean;
}) {
  const meta = deriveMeta(item);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-3xl glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_hsl(var(--primary)/0.4)]"
      aria-label={`${L.read}: ${item.title}`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            data-ai-hint="news article"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary/15 via-violet-500/10 to-cyan-400/15">
            <Newspaper className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {/* Bookmark button — on image */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBookmark();
          }}
          aria-label={isBookmarked ? "Bookmarked" : "Bookmark"}
          className={cn(
            "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border backdrop-blur transition",
            isBookmarked
              ? "border-primary/30 bg-primary/90 text-primary-foreground"
              : "border-white/20 bg-black/40 text-white hover:bg-black/60",
          )}
        >
          {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <SourceTag name={item._sourceName} />
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {mounted ? formatRelative(item.pubDate) : formatAbsolute(item.pubDate)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {stripHtml(item.description)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <TopicChips meta={meta} max={2} dense />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCopy();
            }}
            aria-label={L.copy}
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <CopyIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </a>
  );
}

function NewsCardList({
  item,
  isBookmarked,
  onBookmark,
  onCopy,
  mounted,
}: {
  item: EnrichedNews;
  isBookmarked: boolean;
  onBookmark: () => void;
  onCopy: () => void;
  mounted: boolean;
}) {
  const meta = deriveMeta(item);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 overflow-hidden rounded-2xl glass p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_hsl(var(--primary)/0.4)] sm:p-4"
      aria-label={`${L.read}: ${item.title}`}
    >
      <div className="relative aspect-[16/10] w-32 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            data-ai-hint="news article"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary/15 via-violet-500/10 to-cyan-400/15">
            <Newspaper className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <SourceTag name={item._sourceName} />
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {mounted ? formatRelative(item.pubDate) : formatAbsolute(item.pubDate)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        <p className="line-clamp-2 hidden text-xs text-muted-foreground sm:block">
          {stripHtml(item.description)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <TopicChips meta={meta} max={2} dense />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onBookmark();
              }}
              aria-label={isBookmarked ? "Bookmarked" : "Bookmark"}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors",
                isBookmarked ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onCopy();
              }}
              aria-label={L.copy}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CopyIcon className="h-3.5 w-3.5" />
            </button>
            <span className="hidden h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary sm:inline-flex">
              {L.read}
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function EmptyState() {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl glass p-12 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-30" />
      <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Filter className="h-6 w-6" />
      </div>
      <h3 className="relative text-lg font-semibold tracking-tight">{L.emptyTitle}</h3>
      <p className="relative mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{L.emptyDesc}</p>
    </div>
  );
}

    