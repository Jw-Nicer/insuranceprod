"use client";

import * as React from "react";
import Link from "next/link";
import JSZip from "jszip";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillStatus = "for-review" | "stable" | "for-bug-fix" | "proven";

interface AttachedFile {
  name: string;
  size: number;
  data: ArrayBuffer;
  type: string;
}

interface SkillState {
  status: SkillStatus;
  files: AttachedFile[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: SkillStatus; label: string; badge: string }[] = [
  {
    value: "for-review",
    label: "For Review",
    badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-400",
  },
  {
    value: "stable",
    label: "Stable",
    badge: "bg-blue-500/15 text-blue-700 ring-blue-500/25 dark:text-blue-400",
  },
  {
    value: "for-bug-fix",
    label: "For Bug Fix",
    badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-400",
  },
  {
    value: "proven",
    label: "Proven",
    badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400",
  },
];

function getStatusConfig(status: SkillStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status)!;
}

// ─── Skill definitions ────────────────────────────────────────────────────────

const SKILLS = [
  {
    id: "summarize-policy",
    name: "Summarize Policy",
    description: "Condense any policy document into a one-page brief.",
    icon: FileText,
    accent: "from-primary to-primary/60",
    ring: "ring-primary/30",
  },
  {
    id: "premium-estimator",
    name: "Premium Estimator",
    description: "Quick premium calc with adjustable factors and limits.",
    icon: Calculator,
    accent: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/30",
  },
  {
    id: "email-drafter",
    name: "Email Drafter",
    description: "Draft broker / client emails in your firm's tone.",
    icon: Mail,
    accent: "from-cyan-500 to-blue-500",
    ring: "ring-cyan-500/30",
  },
  {
    id: "coverage-gap-check",
    name: "Coverage Gap Check",
    description: "Compare a policy against a checklist; flag missing endorsements.",
    icon: ShieldCheck,
    accent: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-500/30",
  },
  {
    id: "loss-ratio-trend",
    name: "Loss Ratio Trend",
    description: "Plot loss ratio across years and call out outliers.",
    icon: TrendingUp,
    accent: "from-amber-500 to-orange-500",
    ring: "ring-amber-500/30",
  },
  {
    id: "carrier-lookup",
    name: "Carrier Lookup",
    description: "Pull NAIC, AM Best rating, and recent regulatory actions.",
    icon: Search,
    accent: "from-rose-500 to-pink-500",
    ring: "ring-rose-500/30",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  state,
  onStatusChange,
  onFilesAdd,
  onFileRemove,
}: {
  skill: (typeof SKILLS)[number];
  state: SkillState;
  onStatusChange: (id: string, status: SkillStatus) => void;
  onFilesAdd: (id: string, files: FileList) => void;
  onFileRemove: (id: string, index: number) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const statusCfg = getStatusConfig(state.status);

  async function handleDownloadZip() {
    if (state.files.length === 0) return;
    const zip = new JSZip();
    const folder = zip.folder(skill.id) as JSZip;
    for (const f of state.files) {
      folder.file(f.name, f.data);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.id}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="group relative flex h-full flex-col gap-0 overflow-hidden rounded-3xl glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.4)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-[0.35]" />

      {/* Card header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1",
            skill.accent,
            skill.ring,
          )}
        >
          <skill.icon className="h-5 w-5" />
        </div>

        {/* Status tag dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset transition-opacity hover:opacity-80",
                statusCfg.badge,
              )}
            >
              {statusCfg.label}
              <ChevronDown className="h-2.5 w-2.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onStatusChange(skill.id, opt.value)}
                className={cn(
                  "text-xs font-medium",
                  state.status === opt.value && "font-semibold",
                )}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Skill info */}
      <div className="flex-1 space-y-1 px-5 pb-4">
        <h3 className="text-base font-semibold tracking-tight">{skill.name}</h3>
        <p className="text-xs text-muted-foreground">{skill.description}</p>
      </div>

      {/* Attached files list */}
      {state.files.length > 0 && (
        <div className="mx-5 mb-3 space-y-1 rounded-xl bg-muted/50 p-2">
          {state.files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
            >
              <FileText className="h-3 w-3 shrink-0 text-primary/60" />
              <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
              <span className="shrink-0 opacity-60">{formatBytes(f.size)}</span>
              <button
                onClick={() => onFileRemove(skill.id, i)}
                className="shrink-0 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-border/40 px-5 py-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Wand2 className="h-3 w-3" />
          Skill
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Attach files */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && onFilesAdd(skill.id, e.target.files)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-2.5 text-[11px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="mr-1 h-3 w-3" />
            Attach
          </Button>

          {/* Download ZIP */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-2.5 text-[11px]"
            disabled={state.files.length === 0}
            onClick={handleDownloadZip}
            title={state.files.length === 0 ? "Attach files first" : `Download ${state.files.length} file(s) as ZIP`}
          >
            <Download className="mr-1 h-3 w-3" />
            ZIP {state.files.length > 0 && `(${state.files.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DEFAULT_STATE: SkillState = { status: "for-review", files: [] };

export default function SkillsPage() {
  const [skillStates, setSkillStates] = React.useState<Record<string, SkillState>>(() =>
    Object.fromEntries(SKILLS.map((s) => [s.id, { ...DEFAULT_STATE }])),
  );

  function handleStatusChange(id: string, status: SkillStatus) {
    setSkillStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], status },
    }));
  }

  async function handleFilesAdd(id: string, fileList: FileList) {
    const newFiles: AttachedFile[] = await Promise.all(
      Array.from(fileList).map(async (f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        data: await f.arrayBuffer(),
      })),
    );
    setSkillStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], files: [...prev[id].files, ...newFiles] },
    }));
  }

  function handleFileRemove(id: string, index: number) {
    setSkillStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], files: prev[id].files.filter((_, i) => i !== index) },
    }));
  }

  const totalFiles = Object.values(skillStates).reduce((acc, s) => acc + s.files.length, 0);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Aurora hero */}
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
                  Tag each skill with its current status, attach reference files, and download them as a ZIP for any engagement.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to dashboard
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/agents">
                    See Agents <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Status legend */}
            <div className="mt-6 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <span
                  key={opt.value}
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
                    opt.badge,
                  )}
                >
                  {opt.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills grid */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Skills</h2>
              <p className="text-xs text-muted-foreground">
                {SKILLS.length} skills — click a tag to change its status
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <SkillCard
                key={s.id}
                skill={s}
                state={skillStates[s.id]}
                onStatusChange={handleStatusChange}
                onFilesAdd={handleFilesAdd}
                onFileRemove={handleFileRemove}
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
