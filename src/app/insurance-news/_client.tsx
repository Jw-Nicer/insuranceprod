
"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

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
    <div className="max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight break-words">{L.title}</h1>
              <p className="text-muted-foreground mt-1 break-words">{L.subtitle}</p>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="whitespace-nowrap">
                    {L.sources}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-w-[90vw]">
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
                        <span className="text-[11px] text-muted-foreground">
                          {s.region || ""}
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setReload((r) => r + 1)}
                      aria-label={L.refresh}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> {L.refresh}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 p-2">
                      {mounted && lastUpdated && (
                        <div className="text-xs font-semibold">
                          Updated {formatRelative(lastUpdated)}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                {L.items(filtered.length)}
              </Badge>
              <Separator orientation="vertical" className="h-4" />
              {mounted && lastUpdated && (
                <span className="hidden sm:inline">
                  Updated {formatRelative(lastUpdated)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={L.search}
                  className="pl-8"
                  aria-label="Search news"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="whitespace-nowrap">
                    {L.sort}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-w-[90vw]">
                  <DropdownMenuLabel>{L.sortBy}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSort("newest")}>
                    {L.newest}{" "}
                    {sort === "newest" && (
                      <Badge className="ml-auto" variant="secondary">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("oldest")}>
                    {L.oldest}{" "}
                    {sort === "oldest" && (
                      <Badge className="ml-auto" variant="secondary">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("az")}>
                    {L.az}{" "}
                    {sort === "az" && (
                      <Badge className="ml-auto" variant="secondary">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("za")}>
                    {L.za}{" "}
                    {sort === "za" && (
                      <Badge className="ml-auto" variant="secondary">
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden sm:flex rounded-lg border overflow-hidden">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon"
                  aria-label="List view"
                  onClick={() => setView("list")}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Source chips */}
          <div className="mt-3">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="min-w-0 flex items-center gap-2 pb-2">
                {sourceChips.map(({ source, count }) => (
                  <Button
                    key={source}
                    size="sm"
                    variant={selectedSource === source ? "secondary" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedSource(source)}
                  >
                    {source}
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-full px-1.5 text-[10px]"
                    >
                      {count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Smart Topic chips */}
          <div className="mt-1">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="min-w-0 flex items-center gap-2 pb-2">
                {topicChips.map(({ topic, count }) => (
                  <Button
                    key={topic}
                    size="sm"
                    variant={selectedTopic === topic ? "secondary" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-full px-1.5 text-[10px]"
                    >
                      {count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6"
            aria-busy
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="max-w-full">
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-36 w-full rounded-lg" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-destructive">{L.errorTitle}</CardTitle>
              <CardDescription>{L.errorDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setReload((r) => r + 1)}>{L.refresh}</Button>
            </CardFooter>
          </Card>
        )}

        {/* Grid/List */}
        {!loading && !error && (filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            <div
              className={`mt-6 ${
                view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-4 sm:space-y-6"
              }`}
            >
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
                  {view === "grid" ? (
                    <NewsCardGrid
                      item={item}
                      isBookmarked={!!bookmarks[idFor(item)]}
                      onBookmark={() => toggleBookmark(idFor(item))}
                      onCopy={() => copyLink(item.link)}
                      mounted={mounted}
                    />
                  ) : (
                    <NewsCardList
                      item={item}
                      isBookmarked={!!bookmarks[idFor(item)]}
                      onBookmark={() => toggleBookmark(idFor(item))}
                      onCopy={() => copyLink(item.link)}
                      mounted={mounted}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ))}

        {/* Load more */}
        {!loading && !error && hasMore && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Load more
            </Button>
          </div>
        )}
    </div>
  );
}

/************************************
 * Presentational components
 ************************************/
function TopicBadges({ meta }: { meta: ReturnType<typeof deriveMeta> }) {
  const chips = [
    ...meta.lobs.slice(0, 1),
    ...meta.themes.slice(0, 1),
    ...meta.regions.slice(0, 1),
  ];
  if (chips.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Tags">
      {chips.map((t) => (
        <Badge key={t} variant="outline" className="rounded-full text-[10px] px-2 py-0.5">
          {t}
        </Badge>
      ))}
    </div>
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
    <Card className="flex h-full flex-col hover:shadow-lg transition-all overflow-hidden break-words max-w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg leading-snug line-clamp-2 break-words">
              {item.title}
            </CardTitle>
            <CardDescription className="mt-1 inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {formatAbsolute(item.pubDate)} {mounted && `• ${formatRelative(item.pubDate)}`}
              </span>
            </CardDescription>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {item._sourceName}
            </div>
            <TopicBadges meta={meta} />
          </div>
          <BookmarkButton active={isBookmarked} onClick={onBookmark} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            data-ai-hint="news article"
            className="w-full aspect-video object-cover rounded-lg"
          />
        )}
        <p className="text-sm text-muted-foreground line-clamp-3 break-words">
          {stripHtml(item.description)}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="w-full">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${L.read}: ${item.title}`}
          >
            {L.read}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={L.copy} onClick={onCopy}>
                <CopyIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{L.copy}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
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
    <Card className="hover:shadow-lg transition-all overflow-hidden break-words max-w-full">
      <div className="flex gap-4 p-4 sm:p-6">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            data-ai-hint="news article"
            className="w-full aspect-video object-cover rounded-lg sm:w-36"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg leading-snug line-clamp-1 break-words">
                {item.title}
              </CardTitle>
              <CardDescription className="mt-1 inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>
                  {formatAbsolute(item.pubDate)} {mounted && `• ${formatRelative(item.pubDate)}`}
                </span>
              </CardDescription>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {item._sourceName}
              </div>
              <TopicBadges meta={meta} />
            </div>
            <BookmarkButton active={isBookmarked} onClick={onBookmark} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 break-words">
            {stripHtml(item.description)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button asChild variant="outline">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${L.read}: ${item.title}`}
              >
                {L.read}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={L.copy} onClick={onCopy}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{L.copy}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BookmarkButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon"
            aria-label={active ? "Bookmarked" : "Bookmark"}
            onClick={onClick}
          >
            {active ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{active ? "Bookmarked" : "Bookmark"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10">
          <Filter className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">{L.emptyTitle}</h3>
        <p className="text-muted-foreground mt-1">{L.emptyDesc}</p>
      </CardContent>
    </Card>
  );
}

    