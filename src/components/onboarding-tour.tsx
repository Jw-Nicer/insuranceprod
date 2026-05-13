"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BotMessageSquare,
  Bot,
  Wand2,
  Newspaper,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOUR_KEY = "tour-completed-v1";

type Step = {
  icon: React.ElementType;
  iconAccent: string;
  iconRing: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
  blobs: { a: string; b: string; c: string };
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    iconAccent: "from-primary to-cyan-500",
    iconRing: "ring-primary/30",
    eyebrow: "Welcome",
    title: "Welcome to your insurance command center.",
    description:
      "Everything you need — AI tools, agents, skills, and news — laid out in one place. Let's take a quick 60-second look around.",
    blobs: {
      a: "from-primary/40 via-cyan-400/25 to-transparent",
      b: "from-violet-500/35 via-fuchsia-400/20 to-transparent",
      c: "from-emerald-400/25 via-amber-300/15 to-transparent",
    },
  },
  {
    icon: BotMessageSquare,
    iconAccent: "from-primary to-cyan-500",
    iconRing: "ring-primary/30",
    eyebrow: "Tools",
    title: "Daily tools, always one click away.",
    description:
      "GPTs purpose-built for insurance, a Bookmarks & Notes vault, and the Loss Run analyser. Open any tool right from the dashboard.",
    highlights: [
      "GPT Collection — curated AI assistants",
      "Bookmarks & Notes — save links and research",
      "Loss Run — upload multi-year reports",
    ],
    blobs: {
      a: "from-primary/40 via-cyan-400/25 to-transparent",
      b: "from-cyan-500/30 via-blue-400/15 to-transparent",
      c: "from-primary/30 via-cyan-400/15 to-transparent",
    },
  },
  {
    icon: Bot,
    iconAccent: "from-rose-500 to-pink-500",
    iconRing: "ring-rose-500/30",
    eyebrow: "Agents",
    title: "AI agents that take action.",
    description:
      "Underwriting, claims triage, renewals — each agent triages, drafts, and follows up across your tools. Add your own, link them to live URLs, and organise them in folders.",
    highlights: [
      "Add or edit any agent in seconds",
      "Attach a link — Open launches the agent",
      "Group agents into colored folders",
    ],
    blobs: {
      a: "from-rose-500/35 via-pink-400/20 to-transparent",
      b: "from-amber-500/30 via-orange-400/15 to-transparent",
      c: "from-rose-400/25 via-pink-400/15 to-transparent",
    },
  },
  {
    icon: Wand2,
    iconAccent: "from-violet-500 to-fuchsia-500",
    iconRing: "ring-violet-500/30",
    eyebrow: "Skills",
    title: "Tag, attach, and download your skill library.",
    description:
      "Single-purpose skills for everyday tasks. Tag them as Stable, For Review, or Proven; attach reference files; and download everything as a ZIP whenever you need it.",
    highlights: [
      "Status tags — For Review, Stable, Bug Fix, Proven",
      "Attach files (saved across reloads)",
      "Search and filter as your library grows",
    ],
    blobs: {
      a: "from-violet-500/35 via-fuchsia-400/20 to-transparent",
      b: "from-primary/30 via-cyan-400/15 to-transparent",
      c: "from-emerald-400/25 via-teal-300/15 to-transparent",
    },
  },
  {
    icon: Newspaper,
    iconAccent: "from-cyan-500 to-blue-600",
    iconRing: "ring-cyan-500/30",
    eyebrow: "News",
    title: "Stay current without leaving the dashboard.",
    description:
      "Curated headlines covering P&C, health, cyber, regulatory filings, and market trends — refreshed throughout the day.",
    blobs: {
      a: "from-cyan-500/35 via-blue-400/20 to-transparent",
      b: "from-primary/30 via-cyan-400/15 to-transparent",
      c: "from-blue-500/25 via-cyan-400/15 to-transparent",
    },
  },
  {
    icon: CheckCircle2,
    iconAccent: "from-emerald-500 to-teal-500",
    iconRing: "ring-emerald-500/30",
    eyebrow: "You're set",
    title: "Ready when you are.",
    description:
      "That's the whirlwind tour. You can replay it any time from the dashboard. Now go make some quotes happen.",
    blobs: {
      a: "from-emerald-500/35 via-teal-400/20 to-transparent",
      b: "from-primary/30 via-cyan-400/15 to-transparent",
      c: "from-amber-400/25 via-orange-300/15 to-transparent",
    },
  },
];

export function shouldShowTour(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TOUR_KEY) !== "true";
  } catch {
    return false;
  }
}

export function markTourCompleted() {
  try {
    localStorage.setItem(TOUR_KEY, "true");
  } catch {
    // ignore
  }
}

export function resetTour() {
  try {
    localStorage.removeItem(TOUR_KEY);
  } catch {
    // ignore
  }
}

export function OnboardingTour({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  function finish() {
    markTourCompleted();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent
        className="overflow-hidden border-0 p-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{current.title}</DialogTitle>

        {/* Aurora background */}
        <div className="relative isolate overflow-hidden rounded-lg bg-background grain">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className={cn("aurora-blob-a absolute -top-24 -left-16 h-[320px] w-[320px] rounded-full bg-gradient-to-br blur-3xl", current.blobs.a)} />
            <div className={cn("aurora-blob-b absolute -top-16 right-0 h-[280px] w-[280px] rounded-full bg-gradient-to-br blur-3xl", current.blobs.b)} />
            <div className={cn("aurora-blob-c absolute -bottom-24 left-1/3 h-[320px] w-[320px] rounded-full bg-gradient-to-br blur-3xl", current.blobs.c)} />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-40" />

          <div className="relative px-6 py-7 sm:px-8 sm:py-8">
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step
                      ? "w-8 bg-primary"
                      : i < step
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted",
                  )}
                />
              ))}
              <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>

            {/* Icon */}
            <div
              className={cn(
                "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1",
                current.iconAccent,
                current.iconRing,
              )}
            >
              <Icon className="h-7 w-7" />
            </div>

            {/* Copy */}
            <div className="mt-5 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {current.eyebrow}
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-[26px]">
                <span className="text-gradient-primary">{current.title}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{current.description}</p>
            </div>

            {/* Highlights */}
            {current.highlights && (
              <ul className="mt-5 space-y-2">
                {current.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Controls */}
            <div className="mt-7 flex items-center justify-between gap-3">
              {!isFirst ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs text-muted-foreground hover:text-foreground"
                  onClick={finish}
                >
                  Skip tour
                </Button>
              )}

              <Button
                size="sm"
                className="rounded-full"
                onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              >
                {isLast ? (
                  <>Get started <ArrowRight className="ml-1 h-3.5 w-3.5" /></>
                ) : (
                  <>Next <ArrowRight className="ml-1 h-3.5 w-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
