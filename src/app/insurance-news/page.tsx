
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  copied: "Link copied!",
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
  updated: (d: Date) => `Updated ${formatAbsolute(d)} at ${d.toLocaleTimeString()}`,
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

function uniqueCategories(items: NewsItem[]) {
  const set = new Set<string>();
  items.forEach((i) => i.categories?.forEach((c) => set.add(c.trim())));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/************************************
 * Components
 ************************************/

const NewsCard: React.FC<{ item: NewsItem, bookmarked: boolean, onBookmark: (id: string) => void, onCopy: (url: string) => void }> = ({ item, bookmarked, onBookmark, onCopy }) => (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
            <div className="flex justify-between items-start gap-3">
                <CardTitle className="text-base font-semibold leading-snug flex-1">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.title}</a>
                </CardTitle>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={bookmarked ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => onBookmark(item.guid)}
                            >
                                {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{bookmarked ? "Remove bookmark" : "Save for later"}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <CardDescription className="pt-1 flex items-center gap-2 text-xs">
                <CalendarDays className="h-3 w-3" />
                {formatAbsolute(item.pubDate)}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">
                {stripHtml(item.description)}
            </p>
        </CardContent>
        <CardFooter className="flex-col !items-stretch gap-2">
            <div className="flex gap-1.5 flex-wrap">
                {item.categories?.slice(0, 3).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
            </div>
             <Separator className="my-2" />
            <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {L.read} <ExternalLink className="ml-2" />
                    </a>
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onCopy(item.link)}>
                                <CopyIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{L.copy}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </CardFooter>
    </Card>
);

const NewsListItem: React.FC<{ item: NewsItem, bookmarked: boolean, onBookmark: (id: string) => void, onCopy: (url: string) => void }> = ({ item, bookmarked, onBookmark, onCopy }) => (
    <div className="flex items-start gap-4 py-4">
        <div className="flex-1">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                <p className="font-semibold">{item.title}</p>
            </a>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <CalendarDays className="h-3 w-3" />
                {formatAbsolute(item.pubDate)}
            </p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {stripHtml(item.description)}
            </p>
            <div className="flex gap-1.5 flex-wrap mt-2">
                {item.categories?.slice(0, 3).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
            </div>
        </div>
        <div className="flex items-center gap-1">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant={bookmarked ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => onBookmark(item.guid)}
                        >
                            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{bookmarked ? "Remove bookmark" : "Save for later"}</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(item.link)}>
                            <CopyIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{L.copy}</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{L.read}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
);


const EmptyState: React.FC = () => (
     <div className="text-center py-20 col-span-full">
      <h2 className="text-xl font-semibold mb-2">{L.emptyTitle}</h2>
      <p className="text-muted-foreground">{L.emptyDesc}</p>
    </div>
)

/************************************
 * Page
 ************************************/

type SortKey = "newest" | "oldest" | "az" | "za";

type View = "grid" | "list";

export default function InsuranceNewsPage() {
  const { toast } = useToast();

  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [category, setCategory] = React.useState<string>(L.all);
  const [view, setView] = useLocalStorage<View>("news:view", "grid");
  const [bookmarks, setBookmarks] = useLocalStorage<Record<string, boolean>>("news:bookmarks", {});

  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 12;

  const fetchNews = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(RSS_URL, { signal: controller.signal });
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
  }, [fetchNews]);

  const categories = React.useMemo(() => [L.all, ...uniqueCategories(news)], [news]);

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
    setBookmarks((b) => ({ ...b, [id]: !b[id] }));
    toast({ title: bookmarks[id] ? L.unsaved : L.saved });
  };
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: L.copied });
    } catch (err) {
      toast({ variant: "destructive", title: "Copy failed", description: "Could not copy the link." });
    }
  };


  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">{L.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{L.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchNews} disabled={loading}>
                    <RefreshCw className={loading ? "animate-spin" : ""} />
                    {L.refresh}
                </Button>
            </div>
        </header>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={L.search} className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><Filter /> {L.sort}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>{L.sortBy}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSort("newest")}>{L.newest}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSort("oldest")}>{L.oldest}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSort("az")}>{L.az}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSort("za")}>{L.za}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="hidden md:inline-flex"><Filter /> {L.categories}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 max-h-96">
                        <DropdownMenuLabel>{L.categories}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setCategory(L.all)}>{L.all}</DropdownMenuItem>
                        {categories.slice(1).map(c => <DropdownMenuItem key={c} onClick={() => setCategory(c)}>{c}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center rounded-md border p-1 bg-muted">
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')} className="h-8 w-8"><LayoutGrid/></Button>
                        </TooltipTrigger>
                        <TooltipContent>Grid view</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')} className="h-8 w-8"><ListIcon/></Button>
                        </TooltipTrigger>
                        <TooltipContent>List view</TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>

        <Separator className="mb-6" />

        {/* Content */}
        <div className="flex-1">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
                </div>
            ) : error ? (
                 <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle className="text-destructive">{L.errorTitle}</CardTitle>
                        <CardDescription>{L.errorDesc}</CardDescription>
                    </CardHeader>
                    <CardContent><p>{error}</p></CardContent>
                </Card>
            ) : (
                <>
                <div className="flex justify-between items-baseline mb-4">
                    <p className="text-sm text-muted-foreground">{L.items(filtered.length)}</p>
                    {lastUpdated && <p className="text-sm text-muted-foreground">{L.updated(lastUpdated)}</p>}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                         {view === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visible.length > 0 ? visible.map(item => <NewsCard key={item.guid} item={item} bookmarked={!!bookmarks[item.guid]} onBookmark={toggleBookmark} onCopy={copyUrl}/>) : <EmptyState />}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {visible.length > 0 ? visible.map(item => <NewsListItem key={item.guid} item={item} bookmarked={!!bookmarks[item.guid]} onBookmark={toggleBookmark} onCopy={copyUrl}/>) : <EmptyState />}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {hasMore && (
                    <div className="text-center mt-8">
                        <Button onClick={() => setPage(p => p+1)}>Load More</Button>
                    </div>
                )}
                </>
            )}
        </div>
      </div>
    </AppShell>
  );
}


    