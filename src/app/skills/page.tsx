"use client";

import * as React from "react";
import Link from "next/link";
import JSZip from "jszip";
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
  Wand2,
  Sparkles,
  ArrowLeft,
  FileText,
  Calculator,
  Mail,
  ShieldCheck,
  TrendingUp,
  Search,
  Paperclip,
  Download,
  X,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderInput,
  Bot,
  BarChart3,
  BookOpen,
  Target,
  Briefcase,
  ScrollText,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillStatus = "for-review" | "stable" | "for-bug-fix" | "proven";

interface AttachedFile {
  name: string;
  size: number;
  data: ArrayBuffer;
  type: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  iconName: string;
  accent: string;
  ring: string;
  status: SkillStatus;
  folderId: string | null;
  createdAt: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: SkillStatus; label: string; badge: string }[] = [
  { value: "for-review",  label: "For Review",  badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-400" },
  { value: "stable",      label: "Stable",      badge: "bg-blue-500/15 text-blue-700 ring-blue-500/25 dark:text-blue-400" },
  { value: "for-bug-fix", label: "For Bug Fix", badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-400" },
  { value: "proven",      label: "Proven",      badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400" },
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
  { name: "FileText",    icon: FileText },
  { name: "Calculator",  icon: Calculator },
  { name: "Mail",        icon: Mail },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "TrendingUp",  icon: TrendingUp },
  { name: "Search",      icon: Search },
  { name: "Bot",         icon: Bot },
  { name: "BarChart3",   icon: BarChart3 },
  { name: "BookOpen",    icon: BookOpen },
  { name: "Target",      icon: Target },
  { name: "Briefcase",   icon: Briefcase },
  { name: "ScrollText",  icon: ScrollText },
  { name: "Wand2",       icon: Wand2 },
];

const DEFAULT_SKILLS: Skill[] = [
  { id: "s1", name: "Summarize Policy",   description: "Condense any policy document into a one-page brief.",              iconName: "FileText",    accent: "from-primary to-primary/60",     ring: "ring-primary/30",     status: "for-review", folderId: null, createdAt: 1 },
  { id: "s2", name: "Premium Estimator",  description: "Quick premium calc with adjustable factors and limits.",           iconName: "Calculator",  accent: "from-emerald-500 to-teal-500",   ring: "ring-emerald-500/30", status: "for-review", folderId: null, createdAt: 2 },
  { id: "s3", name: "Email Drafter",      description: "Draft broker / client emails in your firm's tone.",                iconName: "Mail",        accent: "from-cyan-500 to-blue-500",      ring: "ring-cyan-500/30",    status: "for-review", folderId: null, createdAt: 3 },
  { id: "s4", name: "Coverage Gap Check", description: "Compare a policy against a checklist; flag missing endorsements.", iconName: "ShieldCheck", accent: "from-violet-500 to-fuchsia-500", ring: "ring-violet-500/30",  status: "for-review", folderId: null, createdAt: 4 },
  { id: "s5", name: "Loss Ratio Trend",   description: "Plot loss ratio across years and call out outliers.",              iconName: "TrendingUp",  accent: "from-amber-500 to-orange-500",   ring: "ring-amber-500/30",   status: "for-review", folderId: null, createdAt: 5 },
  { id: "s6", name: "Carrier Lookup",     description: "Pull NAIC, AM Best rating, and recent regulatory actions.",        iconName: "Search",      accent: "from-rose-500 to-pink-500",      ring: "ring-rose-500/30",    status: "for-review", folderId: null, createdAt: 6 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function getIcon(name: string): React.ElementType {
  return ICON_OPTIONS.find((o) => o.name === name)?.icon ?? FileText;
}
function getStatusCfg(status: SkillStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status)!;
}
function getFolderColor(color: string) {
  return FOLDER_COLORS.find((c) => c.label === color) ?? FOLDER_COLORS[0];
}

// ─── Skill Dialog ─────────────────────────────────────────────────────────────

interface SkillFormState {
  name: string; description: string; iconName: string;
  accent: string; ring: string; status: SkillStatus; folderId: string | null;
}

function SkillDialog({ open, onClose, onSave, initial, folders }: {
  open: boolean; onClose: () => void;
  onSave: (data: SkillFormState) => void;
  initial?: Skill; folders: Folder[];
}) {
  const blank: SkillFormState = { name: "", description: "", iconName: "FileText", accent: ACCENT_OPTIONS[0].accent, ring: ACCENT_OPTIONS[0].ring, status: "for-review", folderId: null };
  const [form, setForm] = React.useState<SkillFormState>(blank);

  React.useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name, description: initial.description, iconName: initial.iconName, accent: initial.accent, ring: initial.ring, status: initial.status, folderId: initial.folderId }
        : blank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const IconComp = getIcon(form.iconName);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit skill" : "New skill"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="e.g. Coverage Gap Check" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea placeholder="What does this skill do?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="resize-none" />
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
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as SkillStatus }))}>
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
            {initial ? "Save changes" : "Add skill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Folder Dialog ────────────────────────────────────────────────────────────

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
            <Input placeholder="e.g. ERA Wave 1" value={name} onChange={(e) => setName(e.target.value)}
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

// ─── Move to Folder Dialog ────────────────────────────────────────────────────

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

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({ skill, files, folders, onStatusChange, onFilesAdd, onFileRemove, onEdit, onDelete, onMove }: {
  skill: Skill; files: AttachedFile[]; folders: Folder[];
  onStatusChange: (id: string, status: SkillStatus) => void;
  onFilesAdd: (id: string, files: FileList) => void;
  onFileRemove: (id: string, index: number) => void;
  onEdit: (s: Skill) => void; onDelete: (s: Skill) => void; onMove: (s: Skill) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const statusCfg = getStatusCfg(skill.status);
  const IconComp = getIcon(skill.iconName);

  async function handleDownloadZip() {
    if (!files.length) return;
    const zip = new JSZip();
    const folder = zip.folder(skill.name) as JSZip;
    for (const f of files) folder.file(f.name, f.data);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${skill.name}.zip`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="group relative flex h-full flex-col gap-0 overflow-hidden rounded-3xl glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.4)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.35]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1", skill.accent, skill.ring)}>
          <IconComp className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset transition-opacity hover:opacity-80", statusCfg.badge)}>
                {statusCfg.label}<ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(skill.id, opt.value)} className={cn("text-xs font-medium", skill.status === opt.value && "font-semibold")}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
              <DropdownMenuItem onClick={() => onEdit(skill)} className="gap-2 text-sm"><Pencil className="h-3.5 w-3.5" /> Edit skill</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(skill)} className="gap-2 text-sm"><FolderInput className="h-3.5 w-3.5" /> Move to folder</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(skill)} className="gap-2 text-sm text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-1 px-5 pb-3">
        <h3 className="text-sm font-semibold tracking-tight">{skill.name}</h3>
        <p className="text-xs text-muted-foreground">{skill.description}</p>
      </div>

      {/* Files */}
      {files.length > 0 && (
        <div className="mx-5 mb-3 space-y-1 rounded-xl bg-muted/50 p-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted">
              <FileText className="h-3 w-3 shrink-0 text-primary/60" />
              <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
              <span className="shrink-0 opacity-60">{formatBytes(f.size)}</span>
              <button onClick={() => onFileRemove(skill.id, i)} className="shrink-0 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border/40 px-5 py-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Wand2 className="h-3 w-3" /> Skill</span>
        <div className="ml-auto flex items-center gap-1.5">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && onFilesAdd(skill.id, e.target.files)} />
          <Button variant="ghost" size="sm" className="h-7 rounded-full px-2.5 text-[11px]" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="mr-1 h-3 w-3" /> Attach
          </Button>
          <Button variant="ghost" size="sm" className="h-7 rounded-full px-2.5 text-[11px]" disabled={!files.length} onClick={handleDownloadZip}>
            <Download className="mr-1 h-3 w-3" /> ZIP {files.length > 0 && `(${files.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Folder Section ───────────────────────────────────────────────────────────

function FolderSection({ folder, skills, filesBySkillId, folders, expanded, onToggle, onRename, onDelete, onStatusChange, onFilesAdd, onFileRemove, onEditSkill, onDeleteSkill, onMoveSkill }: {
  folder: Folder; skills: Skill[]; filesBySkillId: Record<string, AttachedFile[]>;
  folders: Folder[]; expanded: boolean; onToggle: () => void;
  onRename: () => void; onDelete: () => void;
  onStatusChange: (id: string, status: SkillStatus) => void;
  onFilesAdd: (id: string, files: FileList) => void;
  onFileRemove: (id: string, index: number) => void;
  onEditSkill: (s: Skill) => void; onDeleteSkill: (s: Skill) => void; onMoveSkill: (s: Skill) => void;
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
          {skills.length} skill{skills.length !== 1 ? "s" : ""}
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
          {skills.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No skills here yet — use the ··· menu on a skill card to move it here.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((s) => (
                <SkillCard key={s.id} skill={s} files={filesBySkillId[s.id] ?? []} folders={folders}
                  onStatusChange={onStatusChange} onFilesAdd={onFilesAdd} onFileRemove={onFileRemove}
                  onEdit={onEditSkill} onDelete={onDeleteSkill} onMove={onMoveSkill}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [skills, setSkills] = React.useState<Skill[]>(DEFAULT_SKILLS);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [filesBySkillId, setFilesBySkillId] = React.useState<Record<string, AttachedFile[]>>({});
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [mounted, setMounted] = React.useState(false);

  // Dialog state
  const [skillDialogOpen, setSkillDialogOpen] = React.useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
  const [editingSkill, setEditingSkill] = React.useState<Skill | undefined>();
  const [editingFolder, setEditingFolder] = React.useState<Folder | undefined>();
  const [movingSkill, setMovingSkill] = React.useState<Skill | undefined>();
  const [deletingSkill, setDeletingSkill] = React.useState<Skill | undefined>();
  const [deletingFolder, setDeletingFolder] = React.useState<Folder | undefined>();

  // Load from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem("skills-library:skills");
      if (s) setSkills(JSON.parse(s));
      const f = localStorage.getItem("skills-library:folders");
      if (f) setFolders(JSON.parse(f));
    } catch {}
  }, []);

  // Persist skills
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("skills-library:skills", JSON.stringify(skills)); } catch {}
  }, [skills, mounted]);

  // Persist folders
  React.useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("skills-library:folders", JSON.stringify(folders)); } catch {}
  }, [folders, mounted]);

  // ── Skill handlers ──
  function handleSaveSkill(data: SkillFormState) {
    if (editingSkill) {
      setSkills((prev) => prev.map((s) => s.id === editingSkill.id ? { ...s, ...data } : s));
    } else {
      setSkills((prev) => [...prev, { id: uid(), createdAt: Date.now(), ...data }]);
    }
    setSkillDialogOpen(false);
    setEditingSkill(undefined);
  }

  function handleDeleteSkill() {
    if (!deletingSkill) return;
    setSkills((prev) => prev.filter((s) => s.id !== deletingSkill.id));
    setFilesBySkillId((prev) => { const n = { ...prev }; delete n[deletingSkill.id]; return n; });
    setDeletingSkill(undefined);
  }

  function handleMoveSkill(folderId: string | null) {
    if (!movingSkill) return;
    setSkills((prev) => prev.map((s) => s.id === movingSkill.id ? { ...s, folderId } : s));
  }

  function handleStatusChange(id: string, status: SkillStatus) {
    setSkills((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  }

  async function handleFilesAdd(id: string, fileList: FileList) {
    const newFiles: AttachedFile[] = await Promise.all(
      Array.from(fileList).map(async (f) => ({ name: f.name, size: f.size, type: f.type, data: await f.arrayBuffer() }))
    );
    setFilesBySkillId((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), ...newFiles] }));
  }

  function handleFileRemove(id: string, index: number) {
    setFilesBySkillId((prev) => ({ ...prev, [id]: (prev[id] ?? []).filter((_, i) => i !== index) }));
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
    setSkills((prev) => prev.map((s) => s.folderId === deletingFolder.id ? { ...s, folderId: null } : s));
    setDeletingFolder(undefined);
  }

  function toggleFolder(id: string) {
    setExpandedFolders((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const unfiledSkills = skills.filter((s) => !s.folderId || !folders.find((f) => f.id === s.folderId));
  const totalFiles = Object.values(filesBySkillId).reduce((a, f) => a + f.length, 0);

  // Shared card props
  const cardHandlers = {
    onStatusChange: handleStatusChange,
    onFilesAdd: handleFilesAdd,
    onFileRemove: handleFileRemove,
    onEdit: (s: Skill) => { setEditingSkill(s); setSkillDialogOpen(true); },
    onDelete: (s: Skill) => setDeletingSkill(s),
    onMove: (s: Skill) => { setMovingSkill(s); setMoveDialogOpen(true); },
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* Hero */}
        <div className="relative isolate overflow-hidden rounded-3xl border bg-background grain">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="aurora-blob-a absolute -top-32 -left-20 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-violet-500/35 via-primary/20 to-transparent blur-3xl" />
            <div className="aurora-blob-b absolute -top-20 right-0 h-[340px] w-[340px] rounded-full bg-gradient-to-br from-cyan-500/30 via-emerald-400/15 to-transparent blur-3xl" />
            <div className="aurora-blob-c absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-amber-300/20 via-rose-400/10 to-transparent blur-3xl" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-50" />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    <Sparkles className="mr-1 h-3 w-3" /> Skill Library
                  </Badge>
                  {totalFiles > 0 && (
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {totalFiles} file{totalFiles !== 1 ? "s" : ""} attached
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="text-gradient-primary">Skills Library</span>
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {skills.length} skill{skills.length !== 1 ? "s" : ""} · {folders.length} folder{folders.length !== 1 ? "s" : ""}. Tag, organise, attach files, and download as ZIP.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setEditingFolder(undefined); setFolderDialogOpen(true); }}>
                  <FolderPlus className="mr-1.5 h-3.5 w-3.5" /> New folder
                </Button>
                <Button size="sm" className="rounded-full" onClick={() => { setEditingSkill(undefined); setSkillDialogOpen(true); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add skill
                </Button>
              </div>
            </div>
            {/* Status legend */}
            <div className="mt-5 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <span key={opt.value} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset", opt.badge)}>
                  {opt.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight">Folders</h2>
            {folders.map((folder) => (
              <FolderSection key={folder.id} folder={folder}
                skills={skills.filter((s) => s.folderId === folder.id)}
                filesBySkillId={filesBySkillId} folders={folders}
                expanded={expandedFolders.has(folder.id)}
                onToggle={() => toggleFolder(folder.id)}
                onRename={() => { setEditingFolder(folder); setFolderDialogOpen(true); }}
                onDelete={() => setDeletingFolder(folder)}
                onStatusChange={handleStatusChange} onFilesAdd={handleFilesAdd} onFileRemove={handleFileRemove}
                onEditSkill={cardHandlers.onEdit} onDeleteSkill={cardHandlers.onDelete} onMoveSkill={cardHandlers.onMove}
              />
            ))}
          </section>
        )}

        {/* Unfiled skills */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{folders.length > 0 ? "Unfiled skills" : "All skills"}</h2>
            <p className="text-xs text-muted-foreground">{unfiledSkills.length} skill{unfiledSkills.length !== 1 ? "s" : ""}</p>
          </div>
          {unfiledSkills.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl glass py-12 text-center">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.3]" />
              <Wand2 className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">All skills are in folders</p>
              <Button size="sm" className="mt-4 rounded-full" onClick={() => { setEditingSkill(undefined); setSkillDialogOpen(true); }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add skill
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unfiledSkills.map((s) => (
                <SkillCard key={s.id} skill={s} files={filesBySkillId[s.id] ?? []} folders={folders} {...cardHandlers} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Dialogs */}
      <SkillDialog open={skillDialogOpen} onClose={() => { setSkillDialogOpen(false); setEditingSkill(undefined); }}
        onSave={handleSaveSkill} initial={editingSkill} folders={folders} />

      <FolderDialog open={folderDialogOpen} onClose={() => { setFolderDialogOpen(false); setEditingFolder(undefined); }}
        onSave={handleSaveFolder} initial={editingFolder} />

      <MoveToFolderDialog open={moveDialogOpen} onClose={() => { setMoveDialogOpen(false); setMovingSkill(undefined); }}
        onMove={handleMoveSkill} folders={folders} currentFolderId={movingSkill?.folderId ?? null} />

      {/* Delete skill */}
      <AlertDialog open={!!deletingSkill} onOpenChange={(v) => !v && setDeletingSkill(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deletingSkill?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>This skill and all its attached files will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSkill} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete folder */}
      <AlertDialog open={!!deletingFolder} onOpenChange={(v) => !v && setDeletingFolder(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder &quot;{deletingFolder?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Skills inside will become unfiled — they won&apos;t be deleted.</AlertDialogDescription>
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

// Expose SkillFormState for the save handler
type SkillFormState = {
  name: string; description: string; iconName: string;
  accent: string; ring: string; status: SkillStatus; folderId: string | null;
};
