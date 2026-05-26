"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotesStore } from "@/store/notes-store";
import { NoteSheet } from "@/components/notes/note-sheet";
import { Plus, Search } from "lucide-react";

export function NotesHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useNotesStore();

  return (
    <>
      <header className="w-full border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-base font-semibold hidden sm:block">Notes</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9"
              />
            </div>

            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="size-4" />
              New Note
            </Button>
          </div>
        </div>
      </header>

      <NoteSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
