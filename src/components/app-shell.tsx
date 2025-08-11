"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BotMessageSquare,
  Calculator,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  Newspaper,
  Scale,
  ShieldCheck,
  BarChart2,
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe,
  CircleDot,
  Bookmark as BookmarkIcon,
} from "lucide-react";
import { Command as CommandIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTheme } from "next-themes";
import { Logo } from "@/components/logo";

/************************************
 * Types
 ************************************/
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  status?: 'live' | 'dev' | 'soon';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/************************************
 * Data (i18n-ready): swap labels per locale
 ************************************/
export const navigation: NavGroup[] = [
  {
    title: "Analysis",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, status: 'live' },
      { href: "/benchmarking", label: "Benchmarking", icon: Scale, status: 'soon' },
      { href: "/analytics", label: "Analytics", icon: BarChart2, status: 'soon' },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/loss-run", label: "Loss Run", icon: FileText, status: 'dev' },
      { href: "/bookmarks", label: "Bookmarks & Notes", icon: BookmarkIcon, status: 'dev' },
      { href: "/viability-assessment", label: "Viability Assessment", icon: ShieldCheck, status: 'soon' },
      { href: "/insurance-calculator", label: "Insurance Calculator", icon: Calculator, status: 'soon' },
      { href: "/gpts", label: "GPT Collection", icon: BotMessageSquare, status: 'live' },
      { href: "/professional-liability", label: "Professional Liability", icon: LifeBuoy, status: 'soon' },
      { href: "/health-insurance", label: "Health Insurance", icon: HeartPulse, status: 'soon' },
    ],
  },
  {
    title: "Insurance News",
    items: [
      { href: "/", label: "Latest News", icon: Newspaper, status: 'live' },
    ],
  },
];

/************************************
 * Helpers
 ************************************/
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/************************************
 * NavLink
 ************************************/
const NavLink: React.FC<{ item: NavItem; pathname: string; collapsed?: boolean }> = ({ item, pathname, collapsed }) => {
  const active = isActive(pathname, item.href);
  const isEnabled = item.status === 'live' || item.status === 'dev';

  const content = (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 group transition-all",
        collapsed ? "px-2" : "px-3"
      )}
      disabled={!isEnabled}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
    >
      <span className={cn("relative")}> 
        <item.icon className={cn("h-5 w-5 shrink-0", active ? "" : "opacity-80 group-hover:opacity-100")}/>
        {/* Active dot */}
        <AnimatePresence>
          {active && (
            <motion.span
              layoutId="active-dot"
              className="absolute -right-2 -top-1"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <CircleDot className="h-2 w-2 text-primary" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {!collapsed && (
        <span className="flex-1 text-left truncate">
          {item.label}
        </span>
      )}

      {!collapsed && item.status && (
        <span className="ml-auto" aria-hidden>
          {item.status === 'live' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded-full">Live</Badge>}
          {item.status === 'dev' && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-full border-yellow-500/50 text-yellow-600 bg-yellow-500/10">Under Development</Badge>}
          {item.status === 'soon' && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-full">Soon</Badge>}
        </span>
      )}
    </Button>
  );

  if (!isEnabled) {
    const disabledNode = (
      <div className="cursor-not-allowed" title="Coming soon" aria-disabled>
        {content}
      </div>
    );
    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          {disabledNode}
        </TooltipTrigger>
        <TooltipContent side="right">Coming soon</TooltipContent>
      </Tooltip>
    ) : (
      disabledNode
    );
  }

  const linkNode = <Link href={item.href} className="w-full">{content}</Link>;
  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{linkNode}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  ) : (
    linkNode
  );
};

/************************************
 * Sidebar (desktop)
 ************************************/
const Sidebar: React.FC<{ pathname: string }> = ({ pathname }) => {
  // 1. Initialize state to the server-rendered default (false).
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // 2. After mount on the client, read from localStorage.
  React.useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("sidebar:collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // It's fine to ignore this, we'll just use the default.
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    try {
      localStorage.setItem("sidebar:collapsed", String(nextState));
    } catch {
      // It's fine to ignore this.
    }
  };

  // 3. Conditionally apply classes, but the initial render on client and server will match.
  const isActuallyCollapsed = isMounted && collapsed;

  return (
    <aside
      className={cn(
        "relative hidden sm:flex flex-col border-r bg-card text-card-foreground transition-[width] duration-300",
        isActuallyCollapsed ? "w-[80px]" : "w-64"
      )}
      aria-label="Primary"
    >
      {/* Header */}
      <div className={cn("flex items-center h-14", isActuallyCollapsed ? "justify-center" : "justify-between p-3")}
        style={{
          background: "radial-gradient(120px 60px at 10% 0%, hsl(var(--primary)/0.12), transparent)",
        }}
      >
        <div className={cn("flex items-center gap-3", isActuallyCollapsed && "justify-center")}
          aria-label="Brand"
        >
          <Logo className="h-8 w-8" />
          {!isActuallyCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold tracking-tight">
              InsuranceAssist
            </motion.span>
          )}
        </div>
        {!isActuallyCollapsed && (
           <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
           >
            <Button variant="ghost" size="icon" aria-label="Collapse sidebar" onClick={toggleSidebar}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
           </motion.div>
        )}
      </div>

      <AnimatePresence>
      {isActuallyCollapsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute right-[-14px] top-4 z-10"
        >
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Expand sidebar" onClick={toggleSidebar}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        </motion.div>
      )}
      </AnimatePresence>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <TooltipProvider delayDuration={100}>
          <nav className="flex flex-col gap-4">
            {navigation.map((group) => (
              <div key={group.title}>
                {!isActuallyCollapsed && (
                  <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {group.title}
                  </h3>
                )}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} collapsed={isActuallyCollapsed} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Gradient foot + locale hint */}
      <div className={cn("p-3 mt-auto")}
        style={{ background: "linear-gradient(180deg, transparent, hsl(var(--muted)/0.3))" }}
      >
        {!isActuallyCollapsed ? (
          <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-3.5 w-3.5" />
              <span className="font-medium">Global-ready</span>
            </div>
            <p>Built with accessibility, RTL, and i18n in mind.</p>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mx-auto w-9 h-9 rounded-lg border bg-muted/30 grid place-items-center">
                  <Globe className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Global-ready</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
};


/************************************
 * Mobile Sidebar
 ************************************/
const MobileSidebar: React.FC<{ pathname: string }> = ({ pathname }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="px-4 py-3 h-14">
          <SheetTitle className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span>InsuranceAssist</span>
          </SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2 py-3">
          <nav className="flex flex-col gap-4">
            {navigation.map((group) => (
              <div key={group.title}>
                <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

/************************************
 * Topbar
 ************************************/
const Topbar: React.FC<{ onOpenCommand: () => void }> = ({ onOpenCommand }) => {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = React.useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-2 px-3">
        <MobileSidebar pathname={usePathname()} />

        {/* Search */}
        <div className="relative ml-1 flex-1 max-w-xl">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onOpenCommand}
            placeholder="Search…"
            className="pl-8 pr-12"
            aria-label="Global search"
          />
          <button onClick={onOpenCommand} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] select-none border rounded px-1.5 py-0.5 hover:bg-muted transition-colors">
            ⌘K
          </button>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOpenCommand} aria-label="Open command">
            <CommandIcon className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme">
                <Sparkles className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-1" aria-label="Account menu">
                <div className="h-6 w-6 rounded-full bg-gradient-to-b from-primary/40 to-primary/80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-medium">Your account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

/************************************
 * Command Palette (⌘K)
 ************************************/
const CommandPalette: React.FC<{ open: boolean; setOpen: (v: boolean) => void; pathname: string }> = ({ open, setOpen, pathname }) => {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navigation.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => (
              <CommandItem key={item.href} disabled={!(item.status === 'live' || item.status === 'dev')} onSelect={() => {
                window.location.href = item.href;
                setOpen(false);
              }}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {isActive(pathname, item.href) && <Badge variant="secondary" className="ml-auto">Current</Badge>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

/************************************
 * AppShell
 ************************************/
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openCommand, setOpenCommand] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full" data-testid="app-shell">
      {/* Desktop sidebar */}
      <Sidebar pathname={pathname} />

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <Topbar onOpenCommand={() => setOpenCommand(true)} />

        {/* Page container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/20">
          <div className="mx-auto w-full max-w-7xl p-3 sm:p-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>© {new Date().getFullYear()} InsuranceAssist</span>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      <CommandPalette open={openCommand} setOpen={setOpenCommand} pathname={pathname} />
    </div>
  );
}

export default AppShell;
