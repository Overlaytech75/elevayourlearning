import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studyActions, useStudyState } from "@/lib/study-store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes · Eleva" },
      { name: "description", content: "Markdown note-taking for lectures and revision, with live preview and autosave." },
      { property: "og:title", content: "Notes · Eleva" },
      { property: "og:description", content: "Markdown note-taking for lectures and revision, with live preview and autosave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const notes = useStudyState((s) => s.notes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  const create = () => {
    studyActions.addNote({ title: "Untitled note", body: "", tag: "General" });
    setActiveId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-wider">Notes</h1>
          <p className="mt-1 text-muted-foreground">Markdown in, clean revision material out. Saves as you type.</p>
        </div>
        <Button className="gap-1.5" onClick={create}>
          <Plus className="h-4 w-4" /> New note
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActiveId(n.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                active?.id === n.id
                  ? "border-primary/50 bg-secondary/60"
                  : "border-border/60 hover:border-border hover:bg-secondary/30"
              }`}
            >
              <p className="truncate font-medium">{n.title || "Untitled"}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{n.tag}</Badge>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(n.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
          {notes.length === 0 && (
            <EmptyState
              title="No notes yet"
              body="Create one for a lecture, a summary, or to paste output from the AI tools. Markdown works."
              className="py-8"
            />
          )}

        </div>

        {active ? (
          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  className="min-w-[12rem] flex-1 font-display text-lg"
                  value={active.title}
                  onChange={(e) => studyActions.updateNote(active.id, { title: e.target.value })}
                />
                <Input
                  className="w-40"
                  value={active.tag}
                  onChange={(e) => studyActions.updateNote(active.id, { tag: e.target.value })}
                  placeholder="Course tag"
                />
                <Button size="icon" variant="ghost" onClick={() => studyActions.deleteNote(active.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <Tabs defaultValue="write">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <Textarea
                    rows={18}
                    className="font-mono text-sm"
                    value={active.body}
                    onChange={(e) => studyActions.updateNote(active.id, { body: e.target.value })}
                    placeholder="# Lecture 4&#10;&#10;- point one&#10;- point two"
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose prose-sm dark:prose-invert min-h-[24rem] max-w-none rounded-xl border border-border/60 p-4">
                    <ReactMarkdown>{active.body || "_Nothing to preview yet._"}</ReactMarkdown>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-16 text-center text-muted-foreground">
              <FileText className="h-8 w-8" />
              <p className="text-sm">Create a note to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
