"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Sheet as SheetIcon,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  ExternalLink,
  Copy as CopyIcon,
  GripVertical,
  Bot,
  Sparkles,
  ArrowUpDown,
  X,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app-shell";
import type { Gpt } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------- */
/* Labels                                                    */
/* -------------------------------------------------------- */
const L = {
  title: "GPT Collection",
  subtitle: "Curated GPTs your team can plug into research, drafting, and analysis.",
  tracker: "Development Tracker",
  add: "Add GPT",
  edit: "Edit GPT",
  addNew: "Add New GPT",
  updateDetails: "Update the details for this GPT.",
  enterDetails: "Enter details for the new GPT you want to add.",
  fields: { name: "Name", description: "Description", url: "URL", recommendedModel: "Recommended Model" },
  placeholders: {
    name: "e.g. Content Summarizer",
    description: "A short description of what it does.",
    url: "https://chatgpt.com/g/...",
    search: "Search by name, description, or model…",
    recommendedModel: "Select a model",
  },
  actions: { cancel: "Cancel", save: "Save", open: "Open GPT", edit: "Edit", delete: "Delete", copyLink: "Copy link" },
  confirmDeleteTitle: "Delete GPT?",
  confirmDeleteDesc: "This action cannot be undone and will remove this GPT from the collection.",
  empty: { title: "No GPTs yet", desc: "Add your first GPT to get started.", cta: "Create GPT" },
  emptyFiltered: { title: "No matching GPTs", desc: "Try a different search term." },
  count: (n: number) => `${n} GPT${n === 1 ? "" : "s"}`,
  copied: "Link copied!",
};

/* -------------------------------------------------------- */
/* Seed data                                                 */
/* -------------------------------------------------------- */
const initialGpts: Gpt[] = [
  { name: "Property", description: "A GPT for property insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f3ba9bf488191888ac2594e45142f-property-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Auto", description: "A GPT for auto insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e083b87088191a91d83422ea615c0-auto-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "General Liability", description: "A GPT for general liability insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f1d81d58c81919f8d51c4b73337b7-general-liability-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Active Assailant", description: "A GPT for active assailant insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e0a3774b48191801fd626744b7ef3-active-assailant-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Cyber", description: "A GPT for cyber insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e02726ee4819188dbb126c478652b-cyber-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Marine", description: "A GPT for marine insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e05b24304819182cdf66796b10461-marine-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Fine Arts", description: "A GPT for fine arts insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682dfb6cf5c0819191ca8a0d3fb0d1a0-fine-arts-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Kidnap and Ransom", description: "A GPT for kidnap and ransom insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e024298508191ab2ce9f6b30e33fa-kidnap-and-ransom-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Pollution", description: "A GPT for pollution insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f3d571f48819193934e0a47eec79d-pollution-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Primary Umbrella", description: "A GPT for primary umbrella insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f43356c84819184355c85069c3c9e-primary-umbrella-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Loss Run", description: "A GPT for loss run analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-2", recommendedModel: "GPT-4o" },
  { name: "GPT 4o", description: "A GPT for GPT 4o analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-3", recommendedModel: "GPT-4o" },
  { name: "GPT 5", description: "A GPT for GPT 5 analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-4", recommendedModel: "GPT-4o" },
  { name: "GPT 5 Thinking", description: "A GPT for GPT 5 Thinking analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-5", recommendedModel: "GPT-4o" },
  { name: "GPT 5 Pro", description: "A GPT for GPT 5 Pro analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-6", recommendedModel: "GPT-4o" },
];

const emptyGpt: Gpt = { name: "", description: "", url: "", recommendedModel: "" };
const recommendedModels = ["GPT-4", "GPT-4o", "GPT-4 Turbo", "GPT-5", "GPT-5 Thinking", "GPT-5 Pro"];

/* -------------------------------------------------------- */
/* Avatar gradient generator (deterministic from name)       */
/* -------------------------------------------------------- */
const AVATAR_PALETTES: Array<{ from: string; to: string; ring: string; shadow: string }> = [
  { from: "from-primary",      to: "to-primary/60",      ring: "ring-primary/30",      shadow: "hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.55)]" },
  { from: "from-violet-500",   to: "to-fuchsia-500",     ring: "ring-violet-500/30",   shadow: "hover:shadow-[0_18px_45px_-22px_hsl(262_83%_58%/0.55)]" },
  { from: "from-cyan-500",     to: "to-blue-500",        ring: "ring-cyan-500/30",     shadow: "hover:shadow-[0_18px_45px_-22px_hsl(190_90%_50%/0.55)]" },
  { from: "from-emerald-500",  to: "to-teal-500",        ring: "ring-emerald-500/30", shadow: "hover:shadow-[0_18px_45px_-22px_hsl(160_84%_45%/0.55)]" },
  { from: "from-amber-500",    to: "to-orange-500",      ring: "ring-amber-500/30",   shadow: "hover:shadow-[0_18px_45px_-22px_hsl(38_92%_50%/0.55)]" },
  { from: "from-rose-500",     to: "to-pink-500",        ring: "ring-rose-500/30",    shadow: "hover:shadow-[0_18px_45px_-22px_hsl(350_84%_60%/0.55)]" },
  { from: "from-indigo-500",   to: "to-purple-500",      ring: "ring-indigo-500/30",  shadow: "hover:shadow-[0_18px_45px_-22px_hsl(245_70%_55%/0.55)]" },
  { from: "from-lime-500",     to: "to-emerald-500",     ring: "ring-lime-500/30",    shadow: "hover:shadow-[0_18px_45px_-22px_hsl(85_70%_50%/0.55)]" },
];

function paletteFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}

function initialsOf(name: string) {
  const cleaned = name.trim().replace(/^GPT\s*/i, "G");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* -------------------------------------------------------- */
/* Sort                                                      */
/* -------------------------------------------------------- */
type SortKey = "manual" | "az" | "za" | "model";
const SORT_LABELS: Record<SortKey, string> = {
  manual: "Manual order",
  az: "Name A → Z",
  za: "Name Z → A",
  model: "By model",
};

/* -------------------------------------------------------- */
/* Dialog                                                    */
/* -------------------------------------------------------- */
const GptDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeGpt: Gpt;
  setActiveGpt: (gpt: Gpt) => void;
  onSave: () => void;
  editingIndex: number | null;
}> = ({ isOpen, onOpenChange, activeGpt, setActiveGpt, onSave, editingIndex }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{editingIndex !== null ? L.edit : L.addNew}</DialogTitle>
        <DialogDescription>
          {editingIndex !== null ? L.updateDetails : L.enterDetails}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">{L.fields.name}</Label>
          <Input id="name" value={activeGpt.name} onChange={(e) => setActiveGpt({ ...activeGpt, name: e.target.value })} placeholder={L.placeholders.name} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">{L.fields.description}</Label>
          <Textarea id="description" value={activeGpt.description} onChange={(e) => setActiveGpt({ ...activeGpt, description: e.target.value })} placeholder={L.placeholders.description} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="url">{L.fields.url}</Label>
          <Input id="url" value={activeGpt.url} onChange={(e) => setActiveGpt({ ...activeGpt, url: e.target.value })} placeholder={L.placeholders.url} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="recommendedModel">{L.fields.recommendedModel}</Label>
          <Select value={activeGpt.recommendedModel || ""} onValueChange={(value) => setActiveGpt({ ...activeGpt, recommendedModel: value })}>
            <SelectTrigger id="recommendedModel">
              <SelectValue placeholder={L.placeholders.recommendedModel} />
            </SelectTrigger>
            <SelectContent>
              {recommendedModels.map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="secondary">{L.actions.cancel}</Button></DialogClose>
        <Button onClick={onSave}>{L.actions.save}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* -------------------------------------------------------- */
/* GPT Card                                                  */
/* -------------------------------------------------------- */
const GptCard: React.FC<{
  gpt: Gpt;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isDraggable: boolean;
}> = ({ gpt, index, onEdit, onDelete, isDraggable }) => {
  const { toast } = useToast();
  const palette = paletteFor(gpt.name);
  const initials = initialsOf(gpt.name);
  const host = hostOf(gpt.url);

  const copyUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(gpt.url);
      toast({ title: L.copied });
    } catch {
      toast({ variant: "destructive", title: "Copy failed", description: "Could not copy the link." });
    }
  };

  return (
    <a
      href={gpt.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${L.actions.open}: ${gpt.name}`}
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-3xl glass p-5 transition-all duration-300",
        "hover:-translate-y-0.5",
        palette.shadow,
      )}
    >
      {/* Subtle dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.35]" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn(
          "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-base font-bold text-white shadow-md ring-1",
          palette.from,
          palette.to,
          palette.ring,
        )}>
          <span className="tracking-tight">{initials}</span>
          <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
        </div>

        <div className="flex items-center gap-1">
          {isDraggable && (
            <span
              className="grid h-7 w-7 cursor-grab place-items-center rounded-full text-muted-foreground/60 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/card:opacity-100 active:cursor-grabbing"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label="More actions"
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(index);
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" /> {L.actions.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyUrl}>
                <CopyIcon className="mr-2 h-3.5 w-3.5" /> {L.actions.copyLink}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(index);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> {L.actions.delete}
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title + description */}
      <div className="mt-4 flex-1 space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight transition-colors group-hover/card:text-primary">
          {gpt.name}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {gpt.description || "No description provided."}
        </p>
      </div>

      {/* Footer chips */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
        <div className="flex items-center gap-1.5">
          {gpt.recommendedModel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
              <Bot className="h-3 w-3" />
              {gpt.recommendedModel}
            </span>
          )}
          {host && (
            <span className="hidden truncate rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
              {host}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-70 transition-opacity group-hover/card:opacity-100">
          {L.actions.open}
          <ExternalLink className="h-3 w-3 transition-transform group-hover/card:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
};

/* -------------------------------------------------------- */
/* Empty state                                               */
/* -------------------------------------------------------- */
const EmptyState: React.FC<{ onAdd: () => void; filtered?: boolean }> = ({ onAdd, filtered }) => (
  <div className="relative isolate overflow-hidden rounded-3xl glass p-12 text-center">
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-30" />
    <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
      <Sparkles className="h-6 w-6" />
    </div>
    <h2 className="relative text-lg font-semibold tracking-tight">
      {filtered ? L.emptyFiltered.title : L.empty.title}
    </h2>
    <p className="relative mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
      {filtered ? L.emptyFiltered.desc : L.empty.desc}
    </p>
    {!filtered && (
      <Button onClick={onAdd} className="relative mt-4 rounded-full">
        <PlusCircle className="mr-1.5 h-4 w-4" /> {L.empty.cta}
      </Button>
    )}
  </div>
);

/* -------------------------------------------------------- */
/* Helpers                                                   */
/* -------------------------------------------------------- */
function moveItem<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [item] = newArray.splice(from, 1);
  newArray.splice(to, 0, item);
  return newArray;
}

/* -------------------------------------------------------- */
/* Page                                                      */
/* -------------------------------------------------------- */
export default function GptsPage() {
  const [gpts, setGpts] = useLocalStorage<Gpt[]>("gpts:list", initialGpts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("manual");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activeGpt, setActiveGpt] = React.useState<Gpt>(emptyGpt);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = React.useState<number | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredGpts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = gpts.filter((g) =>
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      (g.recommendedModel || "").toLowerCase().includes(q)
    );
    switch (sort) {
      case "az":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "model":
        list = [...list].sort((a, b) => (a.recommendedModel || "").localeCompare(b.recommendedModel || ""));
        break;
      case "manual":
      default:
        break;
    }
    return list;
  }, [gpts, searchQuery, sort]);

  const stats = React.useMemo(() => {
    const models = new Set(gpts.map((g) => g.recommendedModel).filter(Boolean));
    return {
      total: gpts.length,
      models: models.size,
      curated: gpts.filter((g) => /hartford/i.test(g.description)).length,
      filtered: filteredGpts.length,
    };
  }, [gpts, filteredGpts.length]);

  const isDraggable = !searchQuery && sort === "manual";

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
  };

  const handleDragEnter = (_e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setIsDragging(false);
      return;
    }
    const reorderedGpts = moveItem(gpts, dragItem.current, dragOverItem.current);
    setGpts(reorderedGpts);
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const openAddDialog = () => {
    setEditingIndex(null);
    setActiveGpt(emptyGpt);
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const gptToEdit = filteredGpts[index];
    const originalIndex = gpts.findIndex((g) => g.name === gptToEdit.name && g.url === gptToEdit.url);
    if (originalIndex !== -1) {
      setEditingIndex(originalIndex);
      setActiveGpt(gpts[originalIndex]);
      setIsDialogOpen(true);
    }
  };

  const handleSaveGpt = () => {
    if (activeGpt.name && activeGpt.url) {
      const updatedGpts = [...gpts];
      if (editingIndex !== null) updatedGpts[editingIndex] = activeGpt;
      else updatedGpts.push(activeGpt);
      setGpts(updatedGpts);
      setIsDialogOpen(false);
    }
  };

  const startDelete = (index: number) => {
    const gptToDelete = filteredGpts[index];
    const originalIndex = gpts.findIndex((g) => g.name === gptToDelete.name && g.url === gptToDelete.url);
    if (originalIndex !== -1) setDeletingIndex(originalIndex);
  };

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      setGpts(gpts.filter((_, i) => i !== deletingIndex));
      setDeletingIndex(null);
    }
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="mx-auto w-full max-w-7xl space-y-6">
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
                      Curated · Live collection
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    <span className="text-gradient-primary">{L.title}</span>
                  </h1>
                  <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                    {L.subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <a
                      href="https://erauk-my.sharepoint.com/:x:/r/personal/jnicer_eragroup_com/Documents/Enhance%20Insurance%20GPTs/Insurance%20GPTs%20Development%20Tracker.xlsx?d=wa227041a57f44de6b5803d6a484ce7e6&csf=1&web=1&e=yBiWLE"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SheetIcon className="mr-1.5 h-3.5 w-3.5" /> {L.tracker}
                    </a>
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={openAddDialog}>
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> {L.add}
                  </Button>
                </div>
              </div>

              {/* Stats strip */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "GPTs", value: stats.total, icon: Bot },
                  { label: "Models in use", value: stats.models, icon: Sparkles },
                  { label: "Curated", value: stats.curated, icon: ShieldCheck },
                  { label: "Showing", value: stats.filtered, icon: Activity },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border bg-background/60 p-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <s.icon className="h-3 w-3" />
                      {s.label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                      {mounted ? s.value.toLocaleString() : 0}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={L.placeholders.search}
                  className="h-9 rounded-full border-border/60 bg-background/60 pl-9 pr-9 text-sm"
                  aria-label="Search GPTs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                  {L.count(filteredGpts.length)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                      {SORT_LABELS[sort]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                      <DropdownMenuItem key={k} onClick={() => setSort(k)}>
                        {SORT_LABELS[k]}
                        {sort === k && <Badge variant="secondary" className="ml-auto">Active</Badge>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {!isDraggable && gpts.length > 1 && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {searchQuery ? "Clear search" : "Switch to Manual order"} to drag and reorder.
              </p>
            )}
          </div>

          {/* Grid */}
          <AlertDialog>
            <AnimatePresence>
              {!mounted ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-3xl glass" />
                  ))}
                </div>
              ) : filteredGpts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState onAdd={openAddDialog} filtered={!!searchQuery && gpts.length > 0} />
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filteredGpts.map((gpt, index) => (
                    <motion.div
                      key={gpt.url}
                      layout
                      draggable={isDraggable}
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                      onDragEnter={(e) => handleDragEnter(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={cn(
                        "min-w-0 transition-opacity duration-300",
                        isDraggable && "cursor-grab active:cursor-grabbing",
                        isDragging ? "opacity-50" : "opacity-100",
                      )}
                    >
                      <GptCard
                        gpt={gpt}
                        index={index}
                        onEdit={openEditDialog}
                        onDelete={startDelete}
                        isDraggable={isDraggable}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{L.confirmDeleteTitle}</AlertDialogTitle>
                <AlertDialogDescription>{L.confirmDeleteDesc}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingIndex(null)}>{L.actions.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>{L.actions.delete}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <GptDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          activeGpt={activeGpt}
          setActiveGpt={setActiveGpt}
          onSave={handleSaveGpt}
          editingIndex={editingIndex}
        />
      </TooltipProvider>
    </AppShell>
  );
}
