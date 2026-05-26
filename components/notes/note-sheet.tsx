"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotesStore } from "@/store/notes-store";
import { useTagsStore } from "@/store/tags-store";
import { cn } from "@/lib/utils";
import { Loader2, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Note } from "@/types";

interface NoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note;
}

export function NoteSheet({ open, onOpenChange, note }: NoteSheetProps) {
  const addNote = useNotesStore((state) => state.addNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const { tags: allTags } = useTagsStore();
  const [isLoading, setIsLoading] = useState(false);

  const initialForm = { title: "", content: "", tags: [] as string[] };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (open) {
      if (note) {
        setFormData({ title: note.title, content: note.content, tags: note.tags });
      } else {
        setFormData(initialForm);
      }
    }
  }, [open, note]);

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      if (note) {
        await updateNote(note.id, {
          title: formData.title.trim(),
          content: formData.content,
          tags: formData.tags,
        });
        toast.success("Note updated");
      } else {
        await addNote({
          title: formData.title.trim(),
          content: formData.content,
          tags: formData.tags,
        });
        toast.success("Note created");
      }
      onOpenChange(false);
    } catch {
      toast.error(note ? "Failed to update note" : "Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    setIsLoading(true);
    try {
      await deleteNote(note.id);
      toast.success("Note deleted");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{note ? "Edit Note" : "New Note"}</SheetTitle>
          <SheetDescription>
            {note ? "Update your note details." : "Add a new note with title, content, and tags."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4 px-4 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              placeholder="Note title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col">
            <Label htmlFor="note-content">Content</Label>
            <textarea
              id="note-content"
              placeholder="Write your note..."
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              disabled={isLoading}
              className="flex-1 min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {allTags.length > 0 && (
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                      formData.tags.includes(tag.id)
                        ? "bg-primary text-primary-foreground"
                        : tag.color
                    )}
                  >
                    <Tag className="size-3" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SheetFooter className="px-0 pb-0">
            <div className="flex items-center justify-between w-full gap-2">
              {note && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="size-4 animate-spin" />}
                  {note ? "Save changes" : "Create note"}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
