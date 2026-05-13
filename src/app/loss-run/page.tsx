"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LossRunInstructions } from "@/components/loss-run-instructions";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, Sparkles } from "lucide-react";

export default function LossRunPage() {
  return (
    <AppShell>
      <LossRunInstructions />

      <div className="mt-8">
        <div className="relative isolate overflow-hidden rounded-3xl border bg-background grain">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="aurora-blob-a absolute -top-24 -left-16 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-violet-500/35 via-fuchsia-400/20 to-transparent blur-3xl" />
            <div className="aurora-blob-b absolute -bottom-24 right-0 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 via-cyan-400/15 to-transparent blur-3xl" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 dot-grid opacity-40" />

          <div className="relative flex flex-col items-center gap-5 p-8 text-center sm:p-12">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md ring-1 ring-violet-500/30">
              <Bot className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary ring-1 ring-primary/20">
                <Sparkles className="h-3 w-3" /> Powered by AI
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="text-gradient-primary">Use the Loss-Run Analyst agent</span>
              </h2>
              <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                Skip the CSV juggling. The Loss-Run Analyst reads multi-year loss runs, explains the trends in plain language, and flags outliers — all from the Insurance Agents page.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/agents?q=loss-run">
                Open Loss-Run Analyst
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-[11px] text-muted-foreground/70">
              Tip: paste the agent&apos;s URL in its Link field to launch it directly from the card.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
