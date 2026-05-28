"use client";

import { useState } from "react";
import { Note } from "@/types";
import { useTagsStore } from "@/store/tags-store";
import { NoteSheet } from "@/components/notes/note-sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { getTagById } = useTagsStore();

  const noteTags = note.tags
    .map((id) => getTagById(id))
    .filter(Boolean) as ReturnType<typeof getTagById>[];

  return (
    <>
      <div className="group relative flex flex-col gap-2 rounded-lg border bg-background p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {note.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSheetOpen(true)}
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>

        {note.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {note.content}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          {noteTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {noteTags.slice(0, 3).map((tag) => (
                <span
                  key={tag!.id}
                  className={cn(
                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium",
                    tag!.color
                  )}
                >
                  <Tag className="size-2.5" />
                  {tag!.name}
                </span>
              ))}
            </div>
          ) : (
            <span />
          )}
          <span className="text-[11px] text-muted-foreground shrink-0">
            {format(new Date(note.createdAt), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <NoteSheet open={sheetOpen} onOpenChange={setSheetOpen} note={note} />
    </>
  );
}
