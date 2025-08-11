"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import {
  Bookmark as BookmarkIcon,
  StickyNote,
  PlusCircle,
  Save,
  Trash2,
  Star,
  StarOff,
  Tag,
  Folder,
  ExternalLink,
  CalendarClock,
  RefreshCcw,
  Search as SearchIcon,
} from "lucide-react";

/************************************
 * Limits (perf guardrails)
 ************************************/
const MAX_BOOKMARKS = 300;
const MAX_NOTES = 400;
const MAX_NOTE_LENGTH = 20_000;

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
  lastChecked?: string; // ISO date
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  tags?: string[];
  linkedBookmarkIds?: string[];
}

/************************************
 * Utils
 ************************************/
const fmtDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const toTags = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const isValidISODate = (s?: string) => {
  if (!s) return true; // empty allowed
  const re = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
  if (!re.test(s)) return false;
  const dt = new Date(s + "T00:00:00Z");
  return !isNaN(dt.getTime()) && s === dt.toISOString().slice(0, 10);
};

const normalizeUrl = (u: string) => {
  try {
    const url = new URL(u);
    url.hash = "";
    url.search = ""; // drop tracking params for dedupe
    return url.toString().replace(/\/$/, "");
  } catch {
    return u.trim();
  }
};

/************************************
 * Page
 ************************************/
export default function BookmarksAndNotesPage() {
  // storage
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    "app:bookmarks",
    []
  );
  const [notes, setNotes] = useLocalStorage<Note[]>("app:notes", []);

  // UI state
  const [q, setQ] = React.useState("");
  const deferredQ = React.useDeferredValue(q);

  const [draftBM, setDraftBM] = React.useState<Partial<Bookmark>>({
    title: "",
    url: "",
    description: "",
    folder: "General",
    tags: [],
    expiresAt: "",
  });

  const [newNote, setNewNote] = React.useState("");
  const [noteTagsInput, setNoteTagsInput] = React.useState("");
  const [noteLinks, setNoteLinks] = React.useState<string[]>([]);

  const { toast } = useToast();

  /** Derived */
  const filtered = React.useMemo(() => {
    if (!deferredQ.trim()) return bookmarks;
    const t = deferredQ.toLowerCase();
    return bookmarks.filter((b) =>
      [b.title, b.url, b.description ?? "", b.folder ?? "", b.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(t)
    );
  }, [bookmarks, deferredQ]);

  const expiringSoon = React.useMemo(() => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 21); // 3 weeks
    return bookmarks.filter((b) => b.expiresAt && new Date(b.expiresAt) <= horizon);
  }, [bookmarks]);

  /** Handlers */
  const capBookmarks = (arr: Bookmark[]) => arr.slice(0, MAX_BOOKMARKS);
  const capNotes = (arr: Note[]) => arr.slice(0, MAX_NOTES);

  const addBookmark = () => {
    const title = (draftBM.title || "").trim();
    let url = (draftBM.url || "").trim();

    if (!title || !url) {
      toast({ variant: "destructive", title: "Title and URL are required." });
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      toast({ variant: "destructive", title: "URL must start with http(s)://" });
      return;
    }
    if (!isValidISODate(draftBM.expiresAt)) {
      toast({ variant: "destructive", title: "Invalid expiry date (YYYY-MM-DD)." });
      return;
    }

    url = normalizeUrl(url);
    if (bookmarks.some((b) => normalizeUrl(b.url) === url)) {
      toast({ title: "This URL is already saved.", description: url });
      return;
    }

    const entry: Bookmark = {
      id: crypto.randomUUID(),
      title,
      url,
      description: (draftBM.description || "").trim(),
      folder: (draftBM.folder || "General").trim(),
      tags: draftBM.tags || [],
      favorite: false,
      lastChecked: new Date().toISOString(),
      expiresAt: draftBM.expiresAt || undefined,
    };

    setBookmarks((prev) => capBookmarks([entry, ...prev]));
    setDraftBM({ title: "", url: "", description: "", folder: "General", tags: [], expiresAt: "" });
    toast({ title: "Bookmark saved!" });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Bookmark deleted." });
  };

  const toggleFavorite = (id: string) => {
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, favorite: !b.favorite } : b)));
  };

  const markCheckedNow = (id: string) => {
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, lastChecked: new Date().toISOString() } : b)));
    toast({ title: "Marked as checked." });
  };

  const addNote = () => {
    const content = newNote.trim();
    if (!content) {
      toast({ variant: "destructive", title: "Cannot save an empty note." });
      return;
    }
    if (content.length > MAX_NOTE_LENGTH) {
      toast({ variant: "destructive", title: `Note too long (max ${MAX_NOTE_LENGTH.toLocaleString()})` });
      return;
    }
    const note: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
      tags: toTags(noteTagsInput),
      linkedBookmarkIds: noteLinks,
    };
    setNotes((prev) => capNotes([note, ...prev]));
    setNewNote("");
    setNoteTagsInput("");
    setNoteLinks([]);
    toast({ title: "Note saved!" });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Note deleted." });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl">
        {/* Heading */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <BookmarkIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Bookmarks & Notes</h1>
            <p className="text-muted-foreground">Admin essentials for daily consulting: curated links with context, notes, and expiries.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search bookmarks by title, tag, folder…"
              className="w-[280px]"
              aria-label="Search bookmarks"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bookmarks list */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Bookmarks</CardTitle>
              <CardDescription>Tags, folders, expiry reminders, favorites.</CardDescription>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No bookmarks yet. Add one from the panel on the right.</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((b) => (
                    <div key={b.id} className="rounded-xl border bg-muted/20 p-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleFavorite(b.id)}
                          className="mt-1 text-muted-foreground hover:text-foreground"
                          aria-label={b.favorite ? "Unfavorite" : "Favorite"}
                        >
                          {b.favorite ? <Star className="h-5 w-5" /> : <StarOff className="h-5 w-5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={b.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate font-semibold hover:underline"
                              title={b.title}
                            >
                              {b.title}
                            </a>
                            <a
                              href={b.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground"
                              aria-label="Open link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          {b.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {b.folder && (
                              <Badge variant="outline">
                                <Folder className="mr-1 h-3 w-3" />
                                {b.folder}
                              </Badge>
                            )}
                            {b.tags.map((t) => (
                              <Badge key={t} variant="secondary">
                                <Tag className="mr-1 h-3 w-3" />
                                {t}
                              </Badge>
                            ))}
                            {b.expiresAt && (
                              <Badge className="border-red-200 bg-red-50 text-red-700">
                                <CalendarClock className="mr-1 h-3 w-3" />
                                Expires {b.expiresAt}
                              </Badge>
                            )}
                            {b.lastChecked && (
                              <Badge variant="outline" className="border-dashed">
                                <RefreshCcw className="mr-1 h-3 w-3" />
                                Checked {fmtDateTime(b.lastChecked)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => markCheckedNow(b.id)}>
                            <RefreshCcw className="mr-1 h-3 w-3" />
                            Mark checked
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteBookmark(b.id)}
                            aria-label="Delete bookmark"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Quick add + Expiring */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" /> Quick Add Bookmark
                </CardTitle>
                <CardDescription>Minimal fields now—edit later if needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Title"
                  value={draftBM.title || ""}
                  onChange={(e) => setDraftBM((s) => ({ ...s, title: e.target.value }))}
                />
                <Input
                  placeholder="https://example.com"
                  value={draftBM.url || ""}
                  onChange={(e) => setDraftBM((s) => ({ ...s, url: e.target.value }))}
                />
                <Input
                  placeholder="Folder (e.g., Portals, Benchmarks)"
                  value={draftBM.folder || ""}
                  onChange={(e) => setDraftBM((s) => ({ ...s, folder: e.target.value }))}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  onChange={(e) => setDraftBM((s) => ({ ...s, tags: toTags(e.target.value) }))}
                />
                <Textarea
                  placeholder="Description / why it matters"
                  value={draftBM.description || ""}
                  onChange={(e) => setDraftBM((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                />
                <Input
                  placeholder="Expiry (YYYY-MM-DD)"
                  value={draftBM.expiresAt || ""}
                  onChange={(e) => setDraftBM((s) => ({ ...s, expiresAt: e.target.value }))}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Caps: {MAX_BOOKMARKS} bookmarks • duplicates blocked by URL</span>
                  <Button onClick={addBookmark}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" /> Expiring Soon (≤ 3 weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expiringSoon.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing expiring soon.</p>
                ) : (
                  <div className="space-y-3">
                    {expiringSoon.map((b) => (
                      <div key={b.id} className="rounded-lg border bg-amber-50/40 p-3">
                        <div className="font-medium">{b.title}</div>
                        <div className="text-xs text-muted-foreground">Expires {b.expiresAt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Notes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" /> Notes & Research
              </CardTitle>
              <CardDescription>Quick notes with optional tags and links to saved bookmarks.</CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">You haven’t saved any notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Card key={note.id} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="whitespace-pre-wrap">{note.content}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {note.tags?.map((t) => (
                                <Badge key={t} variant="secondary">
                                  <Tag className="mr-1 h-3 w-3" />
                                  {t}
                                </Badge>
                              ))}
                              {note.linkedBookmarkIds && note.linkedBookmarkIds.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  Linked: {note.linkedBookmarkIds
                                    .map((id) => bookmarks.find((b) => b.id === id)?.title)
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{fmtDateTime(note.createdAt)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick add note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Create a New Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Start typing your note here…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={6}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={noteTagsInput}
                onChange={(e) => setNoteTagsInput(e.target.value)}
              />
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Link bookmarks (optional)</div>
                <div className="max-h-28 overflow-y-auto rounded-md border bg-muted/30 p-2 flex flex-col gap-1">
                    {bookmarks.map((b) => {
                      const checked = noteLinks.includes(b.id);
                      return (
                        <label key={b.id} className="flex items-center gap-2 text-sm p-1 rounded-md hover:bg-background transition-colors">
                          <input
                            type="checkbox"
                            className="shrink-0"
                            checked={checked}
                            onChange={(e) =>
                              setNoteLinks((prev) =>
                                e.target.checked
                                  ? [...prev, b.id]
                                  : prev.filter((x) => x !== b.id)
                              )
                            }
                          />
                          <span className="truncate">{b.title}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[11px] text-muted-foreground">
                  Caps: {MAX_NOTES.toLocaleString()} notes • extremely long pastes are blocked.
                </div>
                <div className="flex justify-end">
                  <Button onClick={addNote}>
                    <Save className="mr-2 h-4 w-4" /> Save Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
    