"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UsersRound,
  Sparkles,
  ArrowLeft,
  Bot,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderInput,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Workflow,
  ShieldCheck,
  Search,
  FileText,
  ExternalLink,
  X,
  TrendingUp,
  Mail,
  Calculator,
  Briefcase,
  Target,
  ScrollText,
  HeartPulse,
  Globe,
} from "lucide-react";
import { cn, normalizeUrl } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

type AgentStatus = "planned" | "in-development" | "active" | "paused";

interface Agent {
  id: string;
  name: string;
  description: string;
  link: string;
  iconName: string;
  accent: string;
  ring: string;
  status: AgentStatus;
  folderId: string | null;
  createdAt: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

// ─── Constants ───────────────────────────────────────────────────

const STATUS_OPTIONS: { value: AgentStatus; label: string; badge: string }[] = [
  { value: "planned",        label: "Planned",        badge: "bg-gray-500/15 text-gray-700 ring-gray-500/25 dark:text-gray-300" },
  { value: "in-development", label: "In Development", badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-400" },
  { value: "active",         label: "Active",         badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400" },
  { value: "paused",         label: "Paused",         badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-400" },
];

const ACCENT_OPTIONS = [
  { label: "Blue",    accent: "from-primary to-primary/60",     ring: "ring-primary/30" },
  { label: "Emerald", accent: "from-emerald-500 to-teal-500",   ring: "ring-emerald-500/30" },
  { label: "Cyan",    accent: "from-cyan-500 to-blue-500",      ring: "ring-cyan-500/30" },
  { label: "Violet",  accent: "from-violet-500 to-fuchsia-500", ring: "ring-violet-500/30" },
  { label: "Amber",   accent: "from-amber-500 to-orange-500",   ring: "ring-amber-500/30" },
  { label: "Rose",    accent: "from-rose-500 to-pink-500",      ring: "ring-rose-500/30" },
];

const FOLDER_COLORS = [
  { label: "Blue",    dot: "bg-blue-500",    text: "text-blue-600 dark:text-blue-400",    badge: "text-blue-600 bg-blue-500/10 ring-blue-500/20 dark:text-blue-400" },
  { label: "Emerald", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20 dark:text-emerald-400" },
  { label: "Amber",   dot: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400",  badge: "text-amber-600 bg-amber-500/10 ring-amber-500/20 dark:text-amber-400" },
  { label: "Violet",  dot: "bg-violet-500",  text: "text-violet-600 dark:text-violet-400", badge: "text-violet-600 bg-violet-500/10 ring-violet-500/20 dark:text-violet-400" },
  { label: "Rose",    dot: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400",    badge: "text-rose-600 bg-rose-500/10 ring-rose-500/20 dark:text-rose-400" },
  { label: "Cyan",    dot: "bg-cyan-500",    text: "text-cyan-600 dark:text-cyan-400",    badge: "text-cyan-600 bg-cyan-500/10 ring-cyan-500/20 dark:text-cyan-400" },
];

const ICON_OPTIONS: { name: string; icon: React.ElementType }[] = [
  { name: "Bot",         icon: Bot },
  { name: "Workflow",    icon: Workflow },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Search",      icon: Search },
  { name: "FileText",    icon: FileText },
  { name: "TrendingUp",  icon: TrendingUp },
  { name: "Mail",        icon: Mail },
  { name: "Calculator",  icon: Calculator },
  { name: "Briefcase",   icon: Briefcase },
  { name: "Target",      icon: Target },
  { name: "ScrollText",  icon: ScrollText },
  { name: "HeartPulse",  icon: HeartPulse },
  { name: "Globe",       icon: Globe },
  { name: "UsersRound",  icon: UsersRound },
];

const DEFAULT_AGENTS: Agent[] = [
  { id: "a1", name: "Underwriting Co-Pilot", description: "Triages submissions, pulls Hartford appetite, drafts the first quote.",   link: "", iconName: "Bot",         accent: "from-primary to-primary/60",     ring: "ring-primary/30",     status: "planned", folderId: null, createdAt: 1 },
  { id: "a2", name: "Claims Triage",         description: "Routes new FNOL into the right queue and auto-flags fast-track items.",   link: "", iconName: "Workflow",    accent: "from-rose-500 to-pink-500",      ring: "ring-rose-500/30",    status: "planned", folderId: null, createdAt: 2 },
  { id: "a3", name: "Renewal Watcher",       description: "Monitors expiring policies, surfaces blockers, and prepares quotes.",     link: "", iconName: "TrendingUp",  accent: "from-amber-500 to-orange-500",   ring: "ring-amber-500/30",   status: "planned", folderId: null, createdAt: 3 },
  { id: "a4", name: "Loss-Run Analyst",      description: "Reads multi-year loss runs and explains trends in plain language.",       link: "", iconName: "FileText",    accent: "from-violet-500 to-fuchsia-500", ring: "ring-violet-500/30",  status: "planned", folderId: null, createdAt: 4 },
  { id: "a5", name: "Compliance Sentinel",   description: "Cross-checks documents against state requirements before binding.",       link: "", iconName: "ShieldCheck", accent: "from-emerald-500 to-teal-500",   ring: "ring-emerald-500/30", status: "planned", folderId: null, createdAt: 5 },
  { id: "a6", name: "Broker Concierge",      description: "Handles common broker questions across multiple lines of business.",      link: "", iconName: "UsersRound",  accent: "from-cyan-500 to-blue-500",      ring: "ring-cyan-500/30",    status: "planned", folderId: null, createdAt: 6 },
];

// ─── Helpers ─────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }
function getIcon(name: string): React.ElementType {
  return ICON_OPTIONS.find((o) => o.name === name)?.icon ?? Bot;
}
function getStatusCfg(status: AgentStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status)!;
}
function getFolderColor(color: string) {
  return FOLDER_COLORS.find((c) => c.label === color) ?? FOLDER_COLORS[0];
}

// ─── Agent Dialog ────────────────────────────────────────────────

interface AgentFormState {
  name: string; description: string; link: string; iconName: string;
  accent: string; ring: string; status: AgentStatus; folderId: string | null;
}

function AgentDialog({ open, onClose, onSave, initial, folders }: {
  open: boolean; onClose: () => void;
  onSave: (data: AgentFormState) => void;
  initial?: Agent; folders: Folder[];
}) {
  const blank: AgentFormState = { name: "", description: "", link: "", iconName: "Bot", accent: ACCENT_OPTIONS[0].accent, ring: ACCENT_OPTIONS[0].ring, status: "planned", folderId: null };
  const [form, setForm] = React.useState<AgentFormState>(blank);

  React.useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name, description: initial.description, link: initial.link ?? "", iconName: initial.iconName, accent: initial.accent, ring: initial.ring, status: initial.status, folderId: initial.folderId }
        : blank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const IconComp = getIcon(form.iconName);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit agent" : "New agent"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="e.g. Underwriting Co-Pilot" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="What does this agent do?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Link (optional)</Label>
            <Input type="url" placeholder="https://chat.openai.com/g/..." value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((opt) => {
                const IC = opt.icon;
                return (
                  <button key={opt.name} onClick={() => setForm((f) => ({ ...f, iconName: opt.name }))}
                    className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                      form.iconName === opt.name ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )} title={opt.name}
                  >
                    <IC className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_OPTIONS.map((opt) => (
                <button key={opt.label} onClick={() => setForm((f) => ({ ...f, accent: opt.accent, ring: opt.ring }))} title={opt.label}
                  className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br text-white ring-2 transition-all", opt.accent,
                    form.accent === opt.accent ? "ring-foreground scale-110" : "ring-transparent hover:scale-105"
                  )}
                >
                  {form.accent === opt.accent && <IconComp className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as AgentStatus }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value} className="text-sm">{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Folder</Label>
              <Select value={form.folderId ?? "none"} onValueChange={(v) => setForm((f) => ({ ...f, folderId: v === "none" ? null : v }))}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm">None</SelectItem>
                  {folders.map((folder) => <SelectItem key={folder.id} value={folder.id} className="text-sm">{folder.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim()}>
            {initial ? "Save changes" : "Add agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Folder Dialog ─────────────────────────────────────────────────

function FolderDialog({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (name: string, color: string) => void;
  initial?: Folder;
}) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("Blue");

  React.useEffect(() => {
    if (open) { setName(initial?.name ?? ""); setColor(initial?.color ?? "Blue"); }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{initial ? "Rename folder" : "New folder"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Folder name</Label>
            <Input placeholder="e.g. Underwriting Squad" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name.trim(), color)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((c) => (
                <button key={c.label} onClick={() => setColor(c.label)} title={c.label}
                  className={cn("h-6 w-6 rounded-full transition-all", c.dot,
                    color === c.label ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => name.trim() && onSave(name.trim(), color)} disabled={!name.trim()}>
            {initial ? "Rename" : "Create folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Move to Folder Dialog ──────────────────────────────────────────────

function MoveToFolderDialog({ open, onClose, onMove, folders, currentFolderId }: {
  open: boolean; onClose: () => void;
  onMove: (folderId: string | null) => void;
  folders: Folder[]; currentFolderId: string | null;
}) {
  const [selected, setSelected] = React.useState("none");
  React.useEffect(() => { if (open) setSelected(currentFolderId ?? "none"); }, [open, currentFolderId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader><DialogTitle>Move to folder</DialogTitle></DialogHeader>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No folder (unfiled)</SelectItem>
            {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onMove(selected === "none" ? null : selected); onClose(); }}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Agent Card ────────────────────────────────────────────────────

function AgentCard({ agent, onStatusChange, onEdit, onDelete, onMove }: {
  agent: Agent;
  onStatusChange: (id: string, status: AgentStatus) => void;
  onEdit: (a: Agent) => void; onDelete: (a: Agent) => void; onMove: (a: Agent) => void;
}) {
  const statusCfg = getStatusCfg(agent.status);
  const IconComp = getIcon(agent.iconName);

  return (
    <div className="group relative flex h-full flex-col gap-0 overflow-hidden rounded-3xl glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.4)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.35]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1", agent.accent, agent.ring)}>
          <IconComp className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset transition-opacity hover:opacity-80", statusCfg.badge)}>
                {statusCfg.label}<ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(agent.id, opt.value)} className={cn("text-xs font-medium", agent.status === opt.value && "font-semibold")}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              <DropdownMenuItem onClick={() => onEdit(agent)} className="gap-2 text-sm"><Pencil className="h-3.5 w-3.5" /> Edit agent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(agent)} className="gap-2 text-sm"><FolderInput className="h-3.5 w-3.5" /> Move to folder</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(agent)} className="gap-2 text-sm text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-1 px-5 pb-3">
        <h3 className="text-base font-semibold tracking-tight">{agent.name}</h3>
        <p className="text-xs text-muted-foreground">{agent.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border/40 px-5 py-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><UsersRound className="h-3 w-3" /> Insurance Agent</span>
        {agent.link && (
          <a
            href={agent.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Folder Section ─────────────────────────────────────────────────

function FolderSection({ folder, agents, expanded, onToggle, onRename, onDelete, onStatusChange, onEditAgent, onDeleteAgent, onMoveAgent }: {
  folder: Folder; agents: Agent[];
  expanded: boolean; onToggle: () => void;
  onRename: () => void; onDelete: () => void;
  onStatusChange: (id: string, status: AgentStatus) => void;
  onEditAgent: (a: Agent) => void; onDeleteAgent: (a: Agent) => void; onMoveAgent: (a: Agent) => void;
}) {
  const colorCfg = getFolderColor(folder.color);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 text-left">
        {expanded
          ? <FolderOpen className={cn("h-4 w-4 shrink-0", colorCfg.text)} />
          : <Folder className={cn("h-4 w-4 shrink-0", colorCfg.text)} />
        }
        <span className="flex-1 text-sm font-semibold tracking-tight">{folder.name}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", colorCfg.badge)}>
          {agents.length} agent{agents.length !== 1 ? "s" : ""}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span role="button" onClick={(e) => e.stopPropagation()}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px]">
            <DropdownMenuItem onClick={onRename} className="gap-2 text-sm"><Pencil className="h-3.5 w-3.5" /> Rename folder</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-sm text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete folder</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChevronRight className={cn("h-4 w-4 text-muted-foreground/50 transition-transform duration-200 shrink-0", expanded && "rotate-90")} />
      </button>

      {expanded && (
        <div className="border-t border-border/40 px-4 py-4">
          {agents.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No agents here yet — use the ··· menu on an agent card to move it here.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((a) => (
                <AgentCard key={a.id} agent={a}
                  onStatusChange={onStatusChange}
                  onEdit={onEditAgent} onDelete={onDeleteAgent} onMove={onMoveAgent}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<Agent[]>(DEFAULT_AGENTS);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<AgentStatus | "all">("all");

  // Dialog state
  const [agentDialogOpen, setAgentDialogOpen] = React.useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<Agent | undefined>();
  const [editingFolder, setEditingFolder] = React.useState<Folder | undefined>();
  const [movingAgent, setMovingAgent] = React.useState<Agent | undefined>();
  const [deletingAgent, setDeletingAgent] = React.useState<Agent | undefined>();
  const [deletingFolder, setDeletingFolder] = React.useState<Folder | undefined>();

  // Load from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    try {
      const a = localStorage.getItem("agents-library:agents");
      if (a) setAgents(JSON.parse(a));
      const f = localStorage.getItem("agents-library:folders");
      if (f) setFolders(JSON.parse(f));
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("agents-library:agents", JSON.stringify(agents)); } catch {}
  }, [agents, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("agents-library:folders", JSON.stringify(folders)); } catch {}
  }, [folders, mounted]);

  // ── Agent handlers ──
  function handleSaveAgent(data: AgentFormState) {
    const clean = { ...data, link: normalizeUrl(data.link) };
    if (editingAgent) {
      setAgents((prev) => prev.map((a) => a.id === editingAgent.id ? { ...a, ...clean } : a));
    } else {
      setAgents((prev) => [...prev, { id: uid(), createdAt: Date.now(), ...clean }]);
    }
    setAgentDialogOpen(false);
    setEditingAgent(undefined);
  }

  function handleDeleteAgent() {
    if (!deletingAgent) return;
    setAgents((prev) => prev.filter((a) => a.id !== deletingAgent.id));
    setDeletingAgent(undefined);
  }

  function handleMoveAgent(folderId: string | null) {
    if (!movingAgent) return;
    setAgents((prev) => prev.map((a) => a.id === movingAgent.id ? { ...a, folderId } : a));
  }

  function handleStatusChange(id: string, status: AgentStatus) {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  }

  // ── Folder handlers ──
  function handleSaveFolder(name: string, color: string) {
    if (editingFolder) {
      setFolders((prev) => prev.map((f) => f.id === editingFolder.id ? { ...f, name, color } : f));
    } else {
      const newFolder = { id: uid(), name, color, createdAt: Date.now() };
      setFolders((prev) => [...prev, newFolder]);
      setExpandedFolders((prev) => new Set([...prev, newFolder.id]));
    }
    setFolderDialogOpen(false);
    setEditingFolder(undefined);
  }

  function handleDeleteFolder() {
    if (!deletingFolder) return;
    setFolders((prev) => prev.filter((f) => f.id !== deletingFolder.id));
    setAgents((prev) => prev.map((a) => a.folderId === deletingFolder.id ? { ...a, folderId: null } : a));
    setDeletingFolder(undefined);
  }

  function toggleFolder(id: string) {
    setExpandedFolders((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const q = query.trim().toLowerCase();
  const matchesFilter = (a: Agent) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
  };
  const filteredAgents = agents.filter(matchesFilter);
  const unfiledAgents = filteredAgents.filter((a) => !a.folderId || !folders.find((f) => f.id === a.folderId));
  const isFiltering = !!q || statusFilter !== "all";
  const visibleFolders = isFiltering
    ? folders.filter((f) => filteredAgents.some((a) => a.folderId === f.id))
    : folders;

  const cardHandlers = {
    onStatusChange: handleStatusChange,
    onEdit: (a: Agent) => { setEditingAgent(a); setAgentDialogOpen(true); },
    onDelete: (a: Agent) => setDeletingAgent(a),
    onMove: (a: Agent) => { setMovingAgent(a); setMoveDialogOpen(true); },
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* Hero */}
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
                  <Badge variant="secondary" className="rounded-full">
                    <Sparkles className="mr-1 h-3 w-3" /> Agents
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="text-gradient-primary">Insurance Agents</span>
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {agents.length} agent{agents.length !== 1 ? "s" : ""} · {folders.length} folder{folders.length !== 1 ? "s" : ""}. Add, organise, and tag your team of AI agents.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setEditingFolder(undefined); setFolderDialogOpen(true); }}>
                  <FolderPlus className="mr-1.5 h-3.5 w-3.5" /> New folder
                </Button>
                <Button size="sm" className="rounded-full" onClick={() => { setEditingAgent(undefined); setAgentDialogOpen(true); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add agent
                </Button>
              </div>
            </div>
            {/* Search + status filters */}
            <div className="mt-5 space-y-3">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents…"
                  className="h-9 rounded-full pl-9 pr-9 text-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset transition-colors",
                    statusFilter === "all"
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-muted/50 text-muted-foreground ring-border hover:text-foreground"
                  )}
                >
                  All · {agents.length}
                </button>
                {STATUS_OPTIONS.map((opt) => {
                  const count = agents.filter((a) => a.status === opt.value).length;
                  const active = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(active ? "all" : opt.value)}
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset transition-all",
                        opt.badge,
                        active ? "scale-105 shadow-sm" : "opacity-70 hover:opacity-100"
                      )}
                    >
                      {opt.label} · {count}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Folders */}
        {visibleFolders.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight">Folders</h2>
            {visibleFolders.map((folder) => (
              <FolderSection key={folder.id} folder={folder}
                agents={filteredAgents.filter((a) => a.folderId === folder.id)}
                expanded={expandedFolders.has(folder.id) || isFiltering}
                onToggle={() => toggleFolder(folder.id)}
                onRename={() => { setEditingFolder(folder); setFolderDialogOpen(true); }}
                onDelete={() => setDeletingFolder(folder)}
                onStatusChange={handleStatusChange}
                onEditAgent={cardHandlers.onEdit} onDeleteAgent={cardHandlers.onDelete} onMoveAgent={cardHandlers.onMove}
              />
            ))}
          </section>
        )}

        {/* Unfiled agents */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{folders.length > 0 ? "Unfiled agents" : "All agents"}</h2>
            <p className="text-xs text-muted-foreground">{unfiledAgents.length} agent{unfiledAgents.length !== 1 ? "s" : ""}</p>
          </div>
          {unfiledAgents.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl glass py-12 text-center">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.3]" />
              <Bot className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {isFiltering ? "No agents match your filters" : "All agents are in folders"}
              </p>
              {isFiltering ? (
                <Button size="sm" variant="outline" className="mt-4 rounded-full" onClick={() => { setQuery(""); setStatusFilter("all"); }}>
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" className="mt-4 rounded-full" onClick={() => { setEditingAgent(undefined); setAgentDialogOpen(true); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add agent
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unfiledAgents.map((a) => (
                <AgentCard key={a.id} agent={a} {...cardHandlers} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Dialogs */}
      <AgentDialog open={agentDialogOpen} onClose={() => { setAgentDialogOpen(false); setEditingAgent(undefined); }}
        onSave={handleSaveAgent} initial={editingAgent} folders={folders} />

      <FolderDialog open={folderDialogOpen} onClose={() => { setFolderDialogOpen(false); setEditingFolder(undefined); }}
        onSave={handleSaveFolder} initial={editingFolder} />

      <MoveToFolderDialog open={moveDialogOpen} onClose={() => { setMoveDialogOpen(false); setMovingAgent(undefined); }}
        onMove={handleMoveAgent} folders={folders} currentFolderId={movingAgent?.folderId ?? null} />

      {/* Delete agent */}
      <AlertDialog open={!!deletingAgent} onOpenChange={(v) => !v && setDeletingAgent(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deletingAgent?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>This agent will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAgent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete folder */}
      <AlertDialog open={!!deletingFolder} onOpenChange={(v) => !v && setDeletingFolder(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder &quot;{deletingFolder?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Agents inside will become unfiled — they won&apos;t be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete folder</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
