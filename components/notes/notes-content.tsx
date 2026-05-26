"use client";

import { useState } from "react";
import { useNotesStore } from "@/store/notes-store";
import { useTagsStore } from "@/store/tags-store";
import { NoteCard } from "@/components/notes/note-card";
import { NoteSheet } from "@/components/notes/note-sheet";
import { cn } from "@/lib/utils";
import { FileText, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotesContent() {
  const { getFilteredNotes, selectedTags, clearTags, toggleTag, loading } = useNotesStore();
  const { getTagById } = useTagsStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const notes = getFilteredNotes();

  return (
    <div className="flex-1 overflow-y-auto w-full px-4 pb-4">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 py-3">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          {selectedTags.map((tagId) => {
            const tag = getTagById(tagId);
            if (!tag) return null;
            return (
              <button
                key={tagId}
                onClick={() => toggleTag(tagId)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                  tag.color
                )}
              >
                <Tag className="size-3" />
                {tag.name}
                <X className="size-3" />
              </button>
            );
          })}
          <button
            onClick={clearTags}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <FileText className="size-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
            {selectedTags.length > 0 ? (
              <p className="text-xs text-muted-foreground mt-1">
                No notes match the selected tags.{" "}
                <button
                  onClick={clearTags}
                  className="underline hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Create your first note to get started.
              </p>
            )}
          </div>
          {selectedTags.length === 0 && (
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              New Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      <NoteSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
