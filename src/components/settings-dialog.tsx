"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Palette,
  Sparkles,
  Database,
  Info,
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  Trash2,
  PlayCircle,
  Check,
  ExternalLink,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, initials } from "@/lib/profile";
import { resetTour } from "@/components/onboarding-tour";

const STORAGE_KEYS = [
  "skills-library:skills",
  "skills-library:folders",
  "agents-library:agents",
  "agents-library:folders",
  "user-profile",
  "tour-completed-v1",
];

// Hide the GitHub Source link in production builds. Dev/preview still show it.
const SHOW_SOURCE = process.env.NODE_ENV !== "production";

function exportLibrary() {
  const data: Record<string, unknown> = {};
  for (const key of STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    } catch {
      // skip malformed entries
    }
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `insuranceassist-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importLibrary(file: File): Promise<{ ok: boolean; message: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed?.data || typeof parsed.data !== "object") {
      return { ok: false, message: "Not a valid backup file." };
    }
    let restored = 0;
    for (const [key, value] of Object.entries(parsed.data)) {
      if (!STORAGE_KEYS.includes(key)) continue;
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      restored++;
    }
    return { ok: true, message: `Restored ${restored} item${restored === 1 ? "" : "s"}.` };
  } catch {
    return { ok: false, message: "Could not parse the file." };
  }
}

function clearAllData() {
  for (const key of STORAGE_KEYS) {
    try { localStorage.removeItem(key); } catch {}
  }
  // best-effort: drop the IndexedDB file store too
  try {
    indexedDB.deleteDatabase("insuranceprod");
  } catch {
    // ignore
  }
}

export function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [profile, setProfile] = useProfile();
  const { theme, setTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [draftName, setDraftName] = React.useState(profile.name);
  const [draftRole, setDraftRole] = React.useState(profile.role);
  const [savedFlash, setSavedFlash] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<string | null>(null);
  const [confirmClear, setConfirmClear] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDraftName(profile.name);
      setDraftRole(profile.role);
      setImportStatus(null);
      setSavedFlash(false);
    }
  }, [open, profile.name, profile.role]);

  function saveProfile() {
    const next = {
      name: draftName.trim() || profile.name,
      role: draftRole.trim() || profile.role,
    };
    setProfile(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  }

  function handleReplayTour() {
    resetTour();
    onClose();
    if (typeof window !== "undefined" && window.location.pathname !== "/dashboard") {
      window.location.href = "/dashboard";
    } else {
      window.location.reload();
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await importLibrary(file);
    setImportStatus(result.message);
    if (result.ok) {
      setTimeout(() => window.location.reload(), 900);
    }
  }

  function handleConfirmClear() {
    clearAllData();
    setConfirmClear(false);
    setTimeout(() => window.location.reload(), 200);
  }

  const themeOptions = [
    { value: "light",  label: "Light",  icon: Sun },
    { value: "dark",   label: "Dark",   icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl">Settings</DialogTitle>
            <DialogDescription>
              Manage your profile, appearance, and library data.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="px-6 pb-6 pt-2">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile"    className="gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1.5"><Palette className="h-3.5 w-3.5" /> Appearance</TabsTrigger>
              <TabsTrigger value="tour"       className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Tour</TabsTrigger>
              <TabsTrigger value="data"       className="gap-1.5"><Database className="h-3.5 w-3.5" /> Data</TabsTrigger>
              <TabsTrigger value="about"      className="gap-1.5"><Info className="h-3.5 w-3.5" /> About</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-5 space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white text-sm font-bold shadow-md ring-1 ring-white/10">
                  {initials(draftName || profile.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{draftName || profile.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{draftRole || profile.role}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-name">Display name</Label>
                <Input
                  id="set-name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-role">Role / title</Label>
                <Input
                  id="set-role"
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  placeholder="e.g. Insurance Pro"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={saveProfile}>Save profile</Button>
                {savedFlash && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-5 space-y-4">
              <div>
                <Label className="text-sm">Theme</Label>
                <p className="mb-3 text-xs text-muted-foreground">Choose a colour mode for the app.</p>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                          active
                            ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{opt.label}</span>
                        {active && <Check className="h-3 w-3 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tour" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 text-white shadow-md ring-1 ring-primary/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-semibold">Onboarding tour</div>
                    <p className="text-xs text-muted-foreground">
                      A 6-step walkthrough of Tools, Agents, Skills, and News. Auto-launches on the first visit.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full"
                  onClick={handleReplayTour}
                >
                  <PlayCircle className="mr-1.5 h-3.5 w-3.5" /> Replay tour
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-5 space-y-3">
              <p className="text-xs text-muted-foreground">
                Back up or restore your skills, agents, folders, and profile. File attachments stored in IndexedDB are not included in the JSON.
              </p>

              <div className="rounded-2xl border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">Export library</div>
                    <p className="text-xs text-muted-foreground">Download all your data as a single JSON file.</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={exportLibrary}>
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">Import library</div>
                    <p className="text-xs text-muted-foreground">Restore from a JSON backup. Page will reload.</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => fileInputRef.current?.click()}>
                    Import…
                  </Button>
                </div>
                {importStatus && (
                  <p className="mt-2 text-xs text-muted-foreground">{importStatus}</p>
                )}
              </div>

              <div className="rounded-2xl border border-destructive/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">Clear all data</div>
                    <p className="text-xs text-muted-foreground">Wipe skills, agents, folders, profile, and attachments.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirmClear(true)}
                  >
                    Clear…
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-5 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-600 text-white shadow-md ring-1 ring-white/15">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="mt-3 text-base font-bold tracking-tight">InsuranceAssist</div>
                <div className="text-xs text-muted-foreground">Your insurance command center</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
                  v1.0.0
                </div>
              </div>
              <div className={cn("grid gap-2", SHOW_SOURCE ? "grid-cols-2" : "grid-cols-1")}>
                {SHOW_SOURCE && (
                  <a
                    href="https://github.com/jw-nicer/insuranceprod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Github className="h-3.5 w-3.5" /> Source
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Close
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your skills, agents, folders, profile, and attached files from this browser. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
