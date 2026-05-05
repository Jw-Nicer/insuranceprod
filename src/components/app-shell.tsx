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
  Bookmark as BookmarkIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  Sparkles,
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
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTheme } from "next-themes";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  status?: "live" | "dev" | "soon";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    title: "Analysis",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, status: "live" },
      { href: "/benchmarking", label: "Benchmarking", icon: Scale, status: "soon" },
      { href: "/analytics", label: "Analytics", icon: BarChart2, status: "soon" },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/loss-run", label: "Loss Run", icon: FileText, status: "dev" },
      { href: "/bookmarks", label: "Bookmarks & Notes", icon: BookmarkIcon, status: "live" },
      { href: "/viability-assessment", label: "Viability Assessment", icon: ShieldCheck, status: "soon" },
      { href: "/insurance-calculator", label: "Insurance Calculator", icon: Calculator, status: "soon" },
      { href: "/gpts", label: "GPT Collection", icon: BotMessageSquare, status: "live" },
      { href: "/professional-liability", label: "Professional Liability", icon: LifeBuoy, status: "soon" },
      { href: "/health-insurance", label: "Health Insurance", icon: HeartPulse, status: "soon" },
    ],
  },
  {
    title: "Insurance News",
    items: [
      { href: "/", label: "Latest News", icon: Newspaper, status: "live" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* -------------------------------------------------------- */
/* NavLink — modern pill style with active gradient          */
/* -------------------------------------------------------- */
const NavLink: React.FC<{ item: NavItem; pathname: string; collapsed?: boolean }> = ({ item, pathname, collapsed }) => {
  const active = isActive(pathname, item.href);
  const isEnabled = item.status === "live" || item.status === "dev";

  const StatusBadge = () => {
    if (!item.status) return null;
    if (item.status === "live") return <Badge variant="secondary" className="rounded-full bg-emerald-500/15 px-1.5 py-0 text-[9px] font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">LIVE</Badge>;
    if (item.status === "dev") return <Badge variant="outline" className="rounded-full border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[9px] font-semibold text-amber-600 dark:text-amber-400">DEV</Badge>;
    return <Badge variant="outline" className="rounded-full bg-muted/40 px-1.5 py-0 text-[9px] font-semibold text-muted-foreground">SOON</Badge>;
  };

  const content = (
    <div
      className={cn(
        "group/nav relative flex w-full items-center gap-3 rounded-xl text-sm transition-all",
        collapsed ? "h-10 w-10 justify-center px-0" : "px-2.5 py-2",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        !isEnabled && "cursor-not-allowed opacity-60",
      )}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
    >
      {/* Active background — animated layout pill */}
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {/* Hover background */}
      {!active && isEnabled && (
        <span className="absolute inset-0 -z-10 rounded-xl bg-muted/0 transition-colors group-hover/nav:bg-muted/60" />
      )}

      <span className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors",
        active ? "bg-primary/15 text-primary ring-1 ring-primary/25" : "bg-muted/40 text-muted-foreground group-hover/nav:text-foreground",
      )}>
        <item.icon className="h-3.5 w-3.5" />
      </span>

      {!collapsed && (
        <>
          <span className={cn("flex-1 truncate text-left", active && "font-medium text-foreground")}>{item.label}</span>
          <StatusBadge />
        </>
      )}
    </div>
  );

  const wrapper = isEnabled ? (
    <Link href={item.href} className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      {content}
    </Link>
  ) : (
    <div className="cursor-not-allowed" aria-disabled>
      {content}
    </div>
  );

  if (!collapsed) return wrapper;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{wrapper}</TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        {item.label}
        {item.status === "soon" && <Badge variant="outline" className="text-[9px]">SOON</Badge>}
      </TooltipContent>
    </Tooltip>
  );
};

/* -------------------------------------------------------- */
/* Sidebar (desktop)                                         */
/* -------------------------------------------------------- */
const Sidebar: React.FC<{ pathname: string }> = ({ pathname }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("sidebar:collapsed");
      if (saved !== null) setCollapsed(saved === "true");
    } catch {}
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("sidebar:collapsed", String(next));
    } catch {}
  };

  const isActuallyCollapsed = isMounted && collapsed;

  return (
    <aside
      className={cn(
        "relative hidden flex-col border-r border-border/60 bg-background/80 text-foreground backdrop-blur-xl transition-[width] duration-300 sm:flex",
        isActuallyCollapsed ? "w-[72px]" : "w-64",
      )}
      aria-label="Primary"
    >
      {/* Aurora glow at the top of the sidebar */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      {/* Brand header */}
      <div className={cn("flex h-16 items-center", isActuallyCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href="/dashboard" className={cn("group flex items-center gap-2.5", isActuallyCollapsed && "justify-center")} aria-label="InsuranceAssist home">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-[0_8px_20px_-10px_hsl(var(--primary)/0.6)] ring-1 ring-primary/30">
            <Logo className="h-5 w-5" />
          </div>
          {!isActuallyCollapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">InsuranceAssist</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pro</span>
            </motion.div>
          )}
        </Link>
        {!isActuallyCollapsed && (
          <Button variant="ghost" size="icon" aria-label="Collapse sidebar" onClick={toggleSidebar} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Floating expand button when collapsed */}
      <AnimatePresence>
        {isActuallyCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-[-12px] top-5 z-10"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full border-border/80 bg-background shadow-sm" aria-label="Expand sidebar" onClick={toggleSidebar}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2">
        <TooltipProvider delayDuration={100}>
          <nav className="flex flex-col gap-5">
            {navigation.map((group) => (
              <div key={group.title}>
                {!isActuallyCollapsed && (
                  <h3 className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                    {group.title}
                  </h3>
                )}
                {isActuallyCollapsed && <div className="mx-auto mb-1.5 h-px w-6 bg-border/60" />}
                <div className={cn("flex flex-col gap-0.5", isActuallyCollapsed && "items-center")}>
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} collapsed={isActuallyCollapsed} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* Footer — upgrade CTA */}
      {!isActuallyCollapsed && (
        <div className="m-3 mt-2">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent p-3">
            <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex items-start gap-2">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold tracking-tight">What&apos;s new</div>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">Bento dashboard, aurora hero & glass surfaces.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

/* -------------------------------------------------------- */
/* Mobile sidebar                                            */
/* -------------------------------------------------------- */
const MobileSidebar: React.FC<{ pathname: string }> = ({ pathname }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl sm:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-border/60 bg-background/95 p-0 backdrop-blur-xl">
        <SheetHeader className="h-16 px-4">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground ring-1 ring-primary/30">
              <Logo className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold tracking-tight">InsuranceAssist</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] px-2 py-3">
          <nav className="flex flex-col gap-5">
            {navigation.map((group) => (
              <div key={group.title}>
                <h3 className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-0.5">
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

/* -------------------------------------------------------- */
/* Topbar                                                    */
/* -------------------------------------------------------- */
const Topbar: React.FC<{ onOpenCommand: () => void }> = ({ onOpenCommand }) => {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = React.useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <MobileSidebar pathname={usePathname()} />

        {/* Search — pill */}
        <div className="relative ml-1 max-w-xl flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onOpenCommand}
            placeholder="Search anything…"
            className="h-9 rounded-full border-border/60 bg-muted/40 pl-9 pr-14 text-sm focus-visible:bg-background"
            aria-label="Global search"
          />
          <button
            onClick={onOpenCommand}
            className="absolute right-2 top-1/2 -translate-y-1/2 select-none rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted"
          >
            ⌘K
          </button>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOpenCommand} aria-label="Open command palette" className="h-9 w-9 rounded-xl">
            <CommandIcon className="h-4 w-4" />
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="h-9 w-9 rounded-xl">
                <span className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme" className="h-9 w-9 rounded-xl">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("system")}><Monitor className="mr-2 h-3.5 w-3.5" />System</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}><Sun className="mr-2 h-3.5 w-3.5" />Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}><Moon className="mr-2 h-3.5 w-3.5" />Dark</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-1 h-9 gap-2 rounded-full px-1 pr-3" aria-label="Account menu">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-[11px] font-semibold text-white">P</span>
                <span className="hidden text-xs font-medium md:inline">Paula</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Paula</span>
                  <span className="text-[11px] text-muted-foreground">paula@insuranceassist.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
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

/* -------------------------------------------------------- */
/* Command palette                                           */
/* -------------------------------------------------------- */
const CommandPalette: React.FC<{ open: boolean; setOpen: (v: boolean) => void; pathname: string }> = ({ open, setOpen, pathname }) => {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
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
              <CommandItem
                key={item.href}
                disabled={!(item.status === "live" || item.status === "dev")}
                onSelect={() => {
                  window.location.href = item.href;
                  setOpen(false);
                }}
              >
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

/* -------------------------------------------------------- */
/* AppShell                                                  */
/* -------------------------------------------------------- */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openCommand, setOpenCommand] = React.useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen w-full bg-background" data-testid="app-shell">
        <Sidebar pathname={pathname} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onOpenCommand={() => setOpenCommand(true)} />

          <div className="flex-1 overflow-auto">
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>

            <footer className="border-t border-border/60 bg-muted/10">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-3 text-[11px] text-muted-foreground sm:p-4">
                <span>© {new Date().getFullYear()} InsuranceAssist</span>
                <span className="hidden sm:inline">Built for Paula · v0.2</span>
              </div>
            </footer>
          </div>
        </div>

        <CommandPalette open={openCommand} setOpen={setOpenCommand} pathname={pathname} />
      </div>
    </TooltipProvider>
  );
}

export default AppShell;
