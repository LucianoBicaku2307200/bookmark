"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, Search } from "lucide-react";
import { useNotesStore } from "@/store/notes-store";
import { useAuth } from "@/components/auth/auth-provider";
import { NoteSheet } from "@/components/notes/note-sheet";

function UserProfileDropdown() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {getInitials(user.email || "U")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

            <Button size="sm" className="flex" onClick={() => setSheetOpen(true)}>
              <Plus className="size-4" />
              <span className="hidden sm:inline ml-2">New Note</span>
            </Button>

            <Separator orientation="vertical" className="h-5 hidden sm:block" />

            <UserProfileDropdown />

            <ThemeToggle />
          </div>
        </div>
      </header>

      <NoteSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
