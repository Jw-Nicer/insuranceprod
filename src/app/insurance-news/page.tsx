
"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  ExternalLink,
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

/************************************
 * Labels (i18n-ready)
 ************************************/
const L = {
  title: "Insurance News",
  subtitle: "The latest headlines from the insurance industry, updated daily.",
  search: "Search news…",
  sort: "Sort",
  sortBy: "Sort by",
  newest: "Newest first",
  oldest: "Oldest first",
  az: "A → Z",
  za: "Z → A",
  categories: "Categories",
  all: "All",
  read: "Read Full Article",
  copy: "Copy link",
  open: "Opens in a new tab",
  refresh: "Refresh",
  emptyTitle: "No articles match",
  emptyDesc: "Try adjusting your search or filters.",
  errorTitle: "Error",
  errorDesc: "Could not load the news feed.",
  loading: "Loading news…",
  saved: "Saved",
  unsaved: "Removed bookmark",
  items: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
  updated: (d: Date) => `Updated ${formatAbsolute(d)}`,
};

/************************************
 * Config
 ************************************/
const RSS_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.insurancejournal.com/news/national/feed/";

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
    if(isNaN(d.getTime())) return "";
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
  if(isNaN(d.getTime())) return "";
  const diff = (d.getTime() - Date.now()) / 1000; // negative if in past
  const rtf = new Intl.RelativeTimeFormat(navigator?.language || "en-US", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [unit, sec] of units) {
    const value = Math.round(diff / sec);
    if (Math.abs(value) >= 1) return rtf.format(value, unit);
  }
  return rtf.format(Math.round(diff), "second");
}

function uniqueCategories(items: NewsItem[]) {
  const set = new Set<string>();
  items.forEach((i) => i.categories?.forEach((c) => set.add(c.trim())));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/************************************
 * Page
 ************************************/

type SortKey = "newest" | "oldest" | "az" | "za";

type View = "grid" | "list";

export default function InsuranceNewsPage() {
  const { toast } = useToast();

  // Local state
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [category, setCategory] = React.useState<string>(L.all);
  const [view, setView] = useLocalStorage<View>("news:view", "grid");
  const [bookmarks, setBookmarks] = useLocalStorage<Record<string, boolean>>("news:bookmarks", {});

  const [isMounted, setIsMounted] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 12;

  const fetchNews = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(RSS_URL, { signal: controller.signal, next: { revalidate: 43200 } });
      if (!res.ok) throw new Error("Failed to fetch news feed.");
      const data = await res.json();
      if (data.status !== "ok") throw new Error("Failed to parse news feed.");
      setNews((data.items || []) as NewsItem[]);
      setLastUpdated(new Date());
      setPage(1);
    } catch (err: any) {
      if (err?.name !== "AbortError") setError(err?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    fetchNews();
    setIsMounted(true);
  }, [fetchNews]);

  const categories = React.useMemo(() => [L.all, ...uniqueCategories(news)], [news]);

  // Filtering + sorting
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = news.filter((n) =>
      (!q || n.title.toLowerCase().includes(q) || stripHtml(n.description).toLowerCase().includes(q)) &&
      (category === L.all || n.categories?.includes(category))
    );
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
  }, [news, query, category, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
    toast({ title: bookmarks[id] ? L.unsaved : L.saved });
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Copied", description: "Link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Unable to copy link.", variant: "destructive" });
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{L.title}</h1>
            <p className="text-muted-foreground mt-1">{L.subtitle}</p>
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={fetchNews} aria-label={L.refresh}>
                    <RefreshCw className="mr-2 h-4 w-4" /> {L.refresh}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{lastUpdated ? L.updated(lastUpdated) : ""}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="rounded-full px-2.5 py-1">{L.items(filtered.length)}</Badge>
            <Separator orientation="vertical" className="h-4" />
            {isMounted && lastUpdated && <span className="hidden sm:inline">{L.updated(lastUpdated)}</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
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

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  {L.sort}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{L.sortBy}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSort("newest")}>{L.newest} {sort === "newest" && <Badge className="ml-auto" variant="secondary">Active</Badge>}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("oldest")}>{L.oldest} {sort === "oldest" && <Badge className="ml-auto" variant="secondary">Active</Badge>}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("az")}>{L.az} {sort === "az" && <Badge className="ml-auto" variant="secondary">Active</Badge>}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("za")}>{L.za} {sort === "za" && <Badge className="ml-auto" variant="secondary">Active</Badge>}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View toggle */}
            {!isMounted ? (
                <Skeleton className="h-10 w-[72px] hidden sm:block" />
            ) : (
                <div className="hidden sm:flex rounded-lg border overflow-hidden">
                    <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" aria-label="Grid view" onClick={() => setView("grid")}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" aria-label="List view" onClick={() => setView("list")}>
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2 pb-2">
              {categories.map((c) => (
                <Button key={c} size="sm" variant={category === c ? "secondary" : "outline"} className="rounded-full" onClick={() => setCategory(c)}>
                  {c}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy>
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{L.errorTitle}</CardTitle>
            <CardDescription>{L.errorDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={fetchNews}>{L.refresh}</Button>
          </CardFooter>
        </Card>
      )}

      {/* Grid/List */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {visible.map((item) => (
                <motion.div
                  key={item.guid}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18 }}
                >
                  {view === "grid" ? (
                    <NewsCardGrid item={item} isBookmarked={!!bookmarks[item.guid]} onBookmark={() => toggleBookmark(item.guid)} onCopy={() => copyLink(item.link)} />
                  ) : (
                    <NewsCardList item={item} isBookmarked={!!bookmarks[item.guid]} onBookmark={() => toggleBookmark(item.guid)} onCopy={() => copyLink(item.link)} />
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )
      )}

      {/* Load more */}
      {!loading && !error && hasMore && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>Load more</Button>
        </div>
      )}
    </AppShell>
  );
}

/************************************
 * Presentational components
 ************************************/
function NewsCardGrid({ item, isBookmarked, onBookmark, onCopy }: { item: NewsItem; isBookmarked: boolean; onBookmark: () => void; onCopy: () => void }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg leading-snug line-clamp-2">{item.title}</CardTitle>
            <CardDescription className="mt-1 inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatAbsolute(item.pubDate)} • {formatRelative(item.pubDate)}</span>
            </CardDescription>
          </div>
          <BookmarkButton active={isBookmarked} onClick={onBookmark} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt="thumbnail" className="mb-3 w-full rounded-lg aspect-video object-cover" />
        )}
        <p className="text-sm text-muted-foreground line-clamp-3">{stripHtml(item.description)}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="w-full">
          <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`${L.read}: ${item.title}`}>
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

function NewsCardList({ item, isBookmarked, onBookmark, onCopy }: { item: NewsItem; isBookmarked: boolean; onBookmark: () => void; onCopy: () => void }) {
  return (
    <Card className="hover:shadow-lg transition-all">
      <div className="flex gap-4 p-6">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt="thumbnail" className="w-44 rounded-lg aspect-video object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg leading-snug line-clamp-1">{item.title}</CardTitle>
              <CardDescription className="mt-1 inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{formatAbsolute(item.pubDate)} • {formatRelative(item.pubDate)}</span>
              </CardDescription>
            </div>
            <BookmarkButton active={isBookmarked} onClick={onBookmark} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{stripHtml(item.description)}</p>
          <div className="mt-4 flex items-center gap-2">
            <Button asChild variant="outline">
              <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`${L.read}: ${item.title}`}>
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

function BookmarkButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={active ? "secondary" : "ghost"} size="icon" aria-label={active ? "Bookmarked" : "Bookmark"} onClick={onClick}>
            {active ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
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

    