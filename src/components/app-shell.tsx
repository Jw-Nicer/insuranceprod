"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
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
  ChevronRight,
  Globe,
  Bookmark as BookmarkIcon,
  UsersRound,
  Wand2,
  Sun,
  Moon,
  Monitor,
  Settings,
} from "lucide-react";
import { Command as CommandIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTheme } from "next-themes";
import { Logo } from "@/components/logo";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Navigation data ──────────────────────────────────────────────────────────

export const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, status: "live" },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/gpts", label: "GPT Collection", icon: BotMessageSquare, status: "live" },
      { href: "/bookmarks", label: "Bookmarks & Notes", icon: BookmarkIcon, status: "live" },
      { href: "/loss-run", label: "Loss Run", icon: FileText, status: "dev" },
    ],
  },
  {
    title: "Agents",
    items: [
      { href: "/agents", label: "Insurance Agents", icon: UsersRound, status: "dev" },
    ],
  },
  {
    title: "Skills",
    items: [
      { href: "/skills", label: "Skills Library", icon: Wand2, status: "dev" },
    ],
  },
  {
    title: "Insurance News",
    items: [
      { href: "/", label: "Latest News", icon: Newspaper, status: "live" },
    ],
  },
  {
    title: "Pending",
    items: [
      { href: "/benchmarking", label: "Benchmarking", icon: Scale, status: "soon" },
      { href: "/analytics", label: "Analytics", icon: BarChart2, status: "soon" },
      { href: "/viability-assessment", label: "Viability Assessment", icon: ShieldCheck, status: "soon" },
      { href: "/insurance-calculator", label: "Insurance Calculator", icon: Calculator, status: "soon" },
      { href: "/professional-liability", label: "Professional Liability", icon: LifeBuoy, status: "soon" },
      { href: "/health-insurance", label: "Health Insurance", icon: HeartPulse, status: "soon" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ status, className }: { status: "live" | "dev" | "soon"; className?: string }) {
  if (status === "live") {
    return (
      <span className={cn("relative flex h-1.5 w-1.5 shrink-0", className)}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
    );
  }
  if (status === "dev") {
    return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400", className)} />;
  }
  return <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/25", className)} />;
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
}) {
  const active = isActive(pathname, item.href);
  const enabled = item.status === "live" || item.status === "dev";

  const inner = (
    <motion.div
      className={cn(
        "group relative flex items-center rounded-xl select-none",
        collapsed ? "h-10 w-10 justify-center mx-auto" : "h-9 gap-2.5 px-3",
        enabled ? "cursor-pointer" : "cursor-not-allowed opacity-35",
      )}
      whileHover={enabled ? { x: collapsed ? 0 : 3, transition: { type: "spring", stiffness: 500, damping: 30 } } : {}}
    >
      {/* Active background pill */}
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl bg-primary/[0.12] ring-1 ring-inset ring-primary/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Hover background */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-foreground/0 group-hover:bg-foreground/[0.04] transition-colors duration-150"
      />

      {/* Left accent bar — expanded active only */}
      {active && !collapsed && (
        <motion.div
          layoutId="nav-accent-bar"
          className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-gradient-to-b from-primary via-violet-500 to-fuchsia-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Icon container */}
      <span
        className={cn(
          "relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center transition-colors duration-200",
          active
            ? "text-primary"
            : "text-muted-foreground/55 group-hover:text-foreground/80",
        )}
      >
        <item.icon className="h-[17px] w-[17px]" />
        {/* Collapsed status dot on icon corner */}
        {collapsed && item.status && (
          <StatusDot
            status={item.status}
            className="absolute -top-0.5 -right-0.5"
          />
        )}
      </span>

      {/* Label + expanded status dot */}
      {!collapsed && (
        <>
          <span
            className={cn(
              "relative z-10 flex-1 truncate text-[13px] font-medium leading-none transition-colors duration-200",
              active
                ? "text-foreground"
                : "text-muted-foreground/70 group-hover:text-foreground",
            )}
          >
            {item.label}
          </span>
          {item.status && (
            <StatusDot status={item.status} className="relative z-10 mr-0.5" />
          )}
        </>
      )}
    </motion.div>
  );

  const wrapped = enabled ? (
    <Link href={item.href} className="block">{inner}</Link>
  ) : (
    <div>{inner}</div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={6} className="flex items-center gap-2">
          {item.label}
          {item.status && <StatusDot status={item.status} />}
        </TooltipContent>
      </Tooltip>
    );
  }

  return wrapped;
}

// ─── Sidebar (desktop) ────────────────────────────────────────────────────────

function Sidebar({ pathname }: { pathname: string }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("sidebar:collapsed");
      if (saved !== null) setCollapsed(saved === "true");
    } catch {}
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("sidebar:collapsed", String(next)); } catch {}
  };

  const isCollapsed = mounted && collapsed;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 244 }}
      initial={false}
      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
      className={cn(
        "relative hidden sm:flex flex-col overflow-hidden",
        "border-r border-white/[0.06] dark:border-white/[0.06] border-black/[0.06]",
        "bg-[hsl(var(--card))]",
      )}
      aria-label="Primary navigation"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--card)/0.97) 0%, hsl(var(--card)) 100%)",
      }}
    >
      {/* Grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Aurora top glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/25 via-violet-500/12 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -top-8 right-0 h-32 w-32 rounded-full bg-gradient-to-bl from-cyan-400/15 to-transparent blur-2xl"
        />
      </div>

      {/* Right edge glow line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-px"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, hsl(var(--primary)/0.2) 30%, hsl(var(--primary)/0.08) 70%, transparent 100%)",
        }}
      />

      {/* ── Brand header ── */}
      <div className="relative z-10 flex h-14 shrink-0 items-center justify-between px-3">
        <AnimatePresence mode="wait" initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="brand-expanded"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2.5 min-w-0"
            >
              {/* Gradient mark */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
                <Logo className="h-4 w-4" />
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-white/10" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold tracking-tight text-gradient-primary">
                  InsuranceAssist
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="brand-collapsed"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className="mx-auto"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-600 shadow-lg shadow-primary/30 ring-1 ring-white/15">
                <Logo className="h-4 w-4" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-white/10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse button — visible in expanded state */}
        {!isCollapsed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={toggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Collapse sidebar"
          >
            {/* Double chevron pointing left */}
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3L4 8l5 5M12 3L7 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Expand orb — visible when collapsed */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: -4, scale: 0.7 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={toggle}
            className="absolute -right-3 top-[18px] z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background shadow-md text-muted-foreground hover:border-primary/50 hover:text-primary hover:shadow-primary/20 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <ScrollArea className="relative z-10 flex-1 py-2">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col px-2">
            {navigation.map((group, gi) => (
              <div key={group.title} className={cn(gi > 0 && "mt-3")}>
                {/* Group header */}
                <AnimatePresence initial={false}>
                  {!isCollapsed ? (
                    <motion.div
                      key="header"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mb-1 flex items-center gap-2 px-3"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/35 whitespace-nowrap">
                        {group.title}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                    </motion.div>
                  ) : (
                    gi > 0 && (
                      <motion.div
                        key="divider"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-auto mb-2 mt-1 h-px w-8 bg-border/40"
                      />
                    )
                  )}
                </AnimatePresence>

                {/* Items */}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      collapsed={isCollapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* ── User card (pinned bottom) ── */}
      <div className="relative z-10 shrink-0">
        {/* Top separator with fade */}
        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mx-3" />

        <div className="p-2">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "flex items-center rounded-xl p-2 cursor-pointer",
              "hover:bg-primary/[0.07] transition-colors duration-200",
              isCollapsed ? "justify-center" : "gap-2.5",
            )}
          >
            {/* Avatar */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white text-[11px] font-bold shadow-md shadow-primary/20 ring-1 ring-white/10">
              P
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-background">
                <span className="h-1 w-1 rounded-full bg-white" />
              </span>
            </div>

            {/* Info + settings */}
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold leading-tight">Paula</div>
                  <div className="truncate text-[10px] leading-tight text-muted-foreground/55">
                    Insurance Pro
                  </div>
                </div>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground/35 hover:text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Mobile sidebar ───────────────────────────────────────────────────────────

function MobileSidebar({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground sm:hidden hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 border-r border-border/50">
        {/* Mobile brand header */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-600 shadow-md shadow-primary/25 ring-1 ring-white/15">
            <Logo className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-tight text-gradient-primary">InsuranceAssist</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">Pro</div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] py-2">
          <TooltipProvider>
            <nav className="flex flex-col px-2">
              {navigation.map((group, gi) => (
                <div key={group.title} className={cn(gi > 0 && "mt-3")}>
                  <div className="mb-1 flex items-center gap-2 px-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/35">
                      {group.title}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <NavLink key={item.href} item={item} pathname={pathname} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </TooltipProvider>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function ThemeIcon() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <Monitor className="h-4 w-4" />;
  if (resolvedTheme === "light") return <Sun className="h-4 w-4" />;
  if (resolvedTheme === "dark") return <Moon className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function Topbar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const { setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/75 px-4 backdrop-blur-xl">
      <MobileSidebar pathname={pathname} />

      {/* Search pill — opens command palette */}
      <motion.button
        onClick={onOpenCommand}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="group flex flex-1 max-w-sm items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-muted/50 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
      >
        <Search className="h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-primary" />
        <span className="flex-1 text-left text-[13px]">Search anything…</span>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 sm:inline-flex">
          ⌘K
        </kbd>
      </motion.button>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
              <ThemeIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 text-sm">
              <Sun className="h-3.5 w-3.5" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 text-sm">
              <Moon className="h-3.5 w-3.5" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 text-sm">
              <Monitor className="h-3.5 w-3.5" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User pill */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-1 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/25 py-1.5 pl-2 pr-3 transition-colors hover:bg-muted/60"
            >
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white text-[10px] font-bold">
                P
              </div>
              <span className="hidden text-[13px] font-medium md:block">Paula</span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="font-semibold">Paula</div>
              <div className="text-xs font-normal text-muted-foreground">Insurance Pro</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-sm">
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-destructive focus:text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ─── Command palette ──────────────────────────────────────────────────────────

function CommandPalette({
  open,
  setOpen,
  pathname,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  pathname: string;
}) {
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
      <CommandInput placeholder="Search pages, tools, skills…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navigation.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => {
              const enabled = item.status === "live" || item.status === "dev";
              return (
                <CommandItem
                  key={item.href}
                  disabled={!enabled}
                  onSelect={() => {
                    window.location.href = item.href;
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item.label}</span>
                  {isActive(pathname, item.href) && (
                    <span className="ml-auto text-[10px] text-muted-foreground">Current</span>
                  )}
                  {item.status && (
                    <StatusDot status={item.status} className="ml-auto" />
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openCommand, setOpenCommand] = React.useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden" data-testid="app-shell">
        <Sidebar pathname={pathname} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onOpenCommand={() => setOpenCommand(true)} />

          <div className="flex-1 overflow-auto">
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            <footer className="border-t border-border/40 bg-muted/10">
              <div className="mx-auto w-full max-w-7xl px-4 py-3 text-[11px] text-muted-foreground/50">
                © {new Date().getFullYear()} InsuranceAssist
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
