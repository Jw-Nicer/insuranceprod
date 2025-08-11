
"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Bookmark as BookmarkIcon, StickyNote, PlusCircle, Save, Trash2, Star, StarOff, Tag, Folder, ExternalLink, CalendarClock, RefreshCcw, Search as SearchIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";

/************************************
 * Minimal primitives (no external UI deps)
 ************************************/
const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", children, type = "button", ...props }) => (
  <button type={type} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 border shadow-sm hover:shadow transition text-sm ${className}`} {...props}>
    {children}
  </button>
);
const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...p }) => <input className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${className}`} {...p} />;
const Txt: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = "", ...p }) => <textarea className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${className}`} {...p} />;
const Chip: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${className}`}>{children}</span>;
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => <div className={`rounded-2xl border bg-background shadow-sm ${className}`}>{children}</div>;
const Section: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between p-4">
    <div>
      <div className="text-base sm:text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
    {right && <div className="ml-4">{right}</div>}
  </div>
);

/************************************
 * Limits (perf guardrails)
 ************************************/
const MAX_BOOKMARKS = 300;
const MAX_NOTES = 400;
const MAX_NOTE_LENGTH = 20000;

/************************************
 * Types
 ************************************/
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  folder?: string;
  favorite?: boolean;
  expiresAt?: string; // YYYY-MM-DD
  lastChecked?: string; // ISO
}
interface Note {
  id: string;
  content: string;
  createdAt: string;
  tags?: string[];
  linkedBookmarkIds?: string[];
}

/************************************
 * SSR‑safe localStorage hook
 ************************************/
function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

/************************************
 * Utils
 ************************************/
const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");
const toTags = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const isValidISODate = (s?: string) => {
  if (!s) return true;
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d.getTime()) && s === d.toISOString().slice(0, 10);
};
const normalizeUrl = (u: string) => {
  try {
    const url = new URL(u);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return u.trim();
  }
};

/************************************
 * Main Component
 ************************************/
export default function Page() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("app:bookmarks", []);
  const [notes, setNotes] = useLocalStorage<Note[]>("app:notes", []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);

  const [bm, setBm] = useState<Partial<Bookmark>>({ title: "", url: "", folder: "General", description: "", tags: [], expiresAt: "" });
  const [note, setNote] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [noteLinks, setNoteLinks] = useState<string[]>([]);

  // Derived (pure)
  const filtered = useMemo(() => {
    if (!dq.trim()) return bookmarks;
    const t = dq.toLowerCase();
    return bookmarks.filter((b) => [b.title, b.url, b.description ?? "", b.folder ?? "", b.tags.join(" ")].join(" ").toLowerCase().includes(t));
  }, [bookmarks, dq]);

  const expiring = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 21);
    return bookmarks.filter((b) => b.expiresAt && new Date(b.expiresAt) <= horizon);
  }, [bookmarks]);

  const capBms = useCallback((arr: Bookmark[]) => arr.slice(0, MAX_BOOKMARKS), []);
  const capNotes = useCallback((arr: Note[]) => arr.slice(0, MAX_NOTES), []);

  // Handlers (memoized to avoid re-creating fns each render)
  const onAddBookmark = useCallback(() => {
    const title = (bm.title || "").trim();
    let url = (bm.url || "").trim();
    if (!title || !url) return alert("Title and URL are required.");
    if (!/^https?:\/\//i.test(url)) return alert("URL must start with http(s)://");
    if (!isValidISODate(bm.expiresAt)) return alert("Invalid expiry date. Use YYYY-MM-DD.");
    url = normalizeUrl(url);
    if (bookmarks.some((x) => normalizeUrl(x.url) === url)) return alert("This URL is already saved.");

    const entry: Bookmark = { id: crypto.randomUUID(), title, url, description: (bm.description || "").trim(), folder: (bm.folder || "General").trim(), tags: bm.tags || [], favorite: false, lastChecked: new Date().toISOString(), expiresAt: bm.expiresAt || undefined };
    setBookmarks((prev) => capBms([entry, ...prev]));
    setBm({ title: "", url: "", folder: "General", description: "", tags: [], expiresAt: "" });
  }, [bm, bookmarks, capBms, setBookmarks]);

  const onDeleteBookmark = useCallback((id: string) => setBookmarks((p) => p.filter((b) => b.id !== id)), [setBookmarks]);
  const onToggleFav = useCallback((id: string) => setBookmarks((p) => p.map((b) => (b.id === id ? { ...b, favorite: !b.favorite } : b))), [setBookmarks]);
  const onMarkChecked = useCallback((id: string) => setBookmarks((p) => p.map((b) => (b.id === id ? { ...b, lastChecked: new Date().toISOString() } : b))), [setBookmarks]);

  const onAddNote = useCallback(() => {
    const content = note.trim();
    if (!content) return alert("Cannot save an empty note.");
    if (content.length > MAX_NOTE_LENGTH) return alert(`Note too long (max ${MAX_NOTE_LENGTH}).`);
    const entry: Note = { id: crypto.randomUUID(), content, createdAt: new Date().toISOString(), tags: toTags(noteTags), linkedBookmarkIds: noteLinks };
    setNotes((prev) => capNotes([entry, ...prev]));
    setNote("");
    setNoteTags("");
    setNoteLinks([]);
  }, [note, noteTags, noteLinks, setNotes, capNotes]);

  const onDeleteNote = useCallback((id: string) => setNotes((p) => p.filter((n) => n.id !== id)), [setNotes]);

  /*************** Render ***************/
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bookmarks */}
          <Card className="lg:col-span-2">
            <Section title="Bookmarks" subtitle="Tags, folders, expiry reminders, favorites." />
            <div className="p-4">
              {!mounted ? (
                <p className="py-12 text-center text-gray-500">Loading bookmarks...</p>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-gray-500">No bookmarks yet. Add one on the right.</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((b) => (
                    <div key={b.id} className="rounded-xl border bg-muted/30 p-3">
                      <div className="flex items-start gap-3">
                        <Btn onClick={() => onToggleFav(b.id)} className="mt-1 text-muted-foreground hover:text-foreground">
                          {b.favorite ? <Star className="h-5 w-5" /> : <StarOff className="h-5 w-5" />}
                        </Btn>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <a href={b.url} target="_blank" rel="noopener noreferrer" className="truncate font-medium hover:underline" title={b.title}>
                              {b.title}
                            </a>
                            <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" aria-label="Open link">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          {b.description && <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {b.folder && (
                              <Chip>
                                <Folder className="h-3 w-3" /> {b.folder}
                              </Chip>
                            )}
                            {b.tags.map((t) => (
                              <Chip key={t} className="bg-secondary text-secondary-foreground">
                                <Tag className="h-3 w-3" /> {t}
                              </Chip>
                            ))}
                            {b.expiresAt && (
                              <Chip className="border-red-200 bg-red-50 text-red-700">
                                <CalendarClock className="h-3 w-3" /> Expires {b.expiresAt}
                              </Chip>
                            )}
                            {b.lastChecked && (
                              <Chip className="border-dashed">
                                <RefreshCcw className="h-3 w-3" /> Checked {fmt(b.lastChecked)}
                              </Chip>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Btn className="bg-background" onClick={() => onMarkChecked(b.id)}>
                            <RefreshCcw className="h-3 w-3" /> Mark checked
                          </Btn>
                          <Btn className="text-muted-foreground hover:text-destructive" onClick={() => onDeleteBookmark(b.id)} aria-label="Delete bookmark">
                            <Trash2 className="h-4 w-4" />
                          </Btn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Quick add + Expiring */}
          <div className="space-y-6">
            <Card>
              <Section title={<div className="flex items-center gap-2"><PlusCircle className="h-5 w-5"/> Quick Add Bookmark</div>} subtitle="Minimal fields now—edit later if needed." />
              <div className="space-y-3 p-4">
                <Inp placeholder="Title" value={bm.title || ""} onChange={(e) => setBm((s) => ({ ...s, title: e.target.value }))} />
                <Inp placeholder="https://example.com" value={bm.url || ""} onChange={(e) => setBm((s) => ({ ...s, url: e.target.value }))} />
                <Inp placeholder="Folder (e.g., Portals, Benchmarks)" value={bm.folder || ""} onChange={(e) => setBm((s) => ({ ...s, folder: e.target.value }))} />
                <Inp placeholder="Tags (comma separated)" onChange={(e) => setBm((s) => ({ ...s, tags: toTags(e.target.value) }))} />
                <Txt placeholder="Description / why it matters" value={bm.description || ""} onChange={(e) => setBm((s) => ({ ...s, description: e.target.value }))} rows={3} />
                <Inp placeholder="Expiry (YYYY-MM-DD)" value={bm.expiresAt || ""} onChange={(e) => setBm((s) => ({ ...s, expiresAt: e.target.value }))} />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">Caps: {MAX_BOOKMARKS} • duplicates blocked by URL</p>
                  <Btn className="bg-primary text-primary-foreground" onClick={onAddBookmark}>
                    <Save className="h-4 w-4" /> Save
                  </Btn>
                </div>
              </div>
            </Card>

            <Card>
              <Section title={<div className="flex items-center gap-2"><CalendarClock className="h-5 w-5"/> Expiring Soon (≤ 3 weeks)</div>} />
              <div className="p-4">
                {!mounted ? (
                  <p className="text-sm text-center text-muted-foreground">Loading...</p>
                ) : expiring.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing expiring soon.</p>
                ) : (
                  <div className="space-y-3">
                    {expiring.map((b) => (
                      <div key={b.id} className="rounded-lg border bg-amber-50/40 p-3">
                        <div className="font-medium">{b.title}</div>
                        <div className="text-xs text-muted-foreground">Expires {b.expiresAt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Notes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <Section title={<div className="flex items-center gap-2"><StickyNote className="h-5 w-5"/> Notes & Research</div>} subtitle="Quick notes with tags and optional links to bookmarks." />
            <div className="p-4">
              {!mounted ? (
                 <p className="py-12 text-center text-muted-foreground">Loading notes...</p>
              ) : notes.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">You haven’t saved any notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <Card key={n.id} className="bg-muted/30">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="whitespace-pre-wrap text-sm">{n.content}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {n.tags?.map((t) => (
                                <Chip key={t} className="bg-secondary text-secondary-foreground"><Tag className="h-3 w-3"/> {t}</Chip>
                              ))}
                              {n.linkedBookmarkIds && n.linkedBookmarkIds.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  Linked: {n.linkedBookmarkIds.map((id) => bookmarks.find((b) => b.id === id)?.title).filter(Boolean).join(", ")}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{fmt(n.createdAt)}</p>
                          </div>
                          <Btn className="text-muted-foreground hover:text-destructive" onClick={() => onDeleteNote(n.id)} aria-label="Delete note"><Trash2 className="h-4 w-4"/></Btn>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <Section title={<div className="flex items-center gap-2"><PlusCircle className="h-5 w-5"/> Create a New Note</div>} />
            <div className="space-y-3 p-4">
              <Txt placeholder="Start typing your note here…" value={note} onChange={(e) => setNote(e.target.value)} rows={6} />
              <Inp placeholder="Tags (comma separated)" value={noteTags} onChange={(e) => setNoteTags(e.target.value)} />
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Link bookmarks (optional)</div>
                <div className="max-h-32 overflow-auto rounded-lg border bg-muted/30 p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {!mounted ? <p className="text-xs text-center text-muted-foreground">Loading...</p> : bookmarks.length === 0 ? <p className="text-xs text-center text-muted-foreground">No bookmarks to link.</p> : bookmarks.map((b) => {
                      const checked = noteLinks.includes(b.id);
                      return (
                        <label key={b.id} className="flex items-center gap-2 text-sm p-1 rounded-md hover:bg-background transition-colors">
                          <input
                            type="checkbox"
                            className="shrink-0"
                            checked={checked}
                            onChange={(e) => setNoteLinks((prev) => (e.target.checked ? [...prev, b.id] : prev.filter((x) => x !== b.id)))}
                          />
                          <span className="truncate">{b.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">Caps: {MAX_NOTES} notes • long notes limited</p>
                <Btn className="bg-primary text-primary-foreground" onClick={onAddNote}><Save className="h-4 w-4"/> Save Note</Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
