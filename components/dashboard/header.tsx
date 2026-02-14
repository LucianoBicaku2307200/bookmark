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
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Github,
  Check,
  LogOut,
  User,
} from "lucide-react";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AddBookmarkDialog } from "@/components/dashboard/add-bookmark-dialog";

interface BookmarksHeaderProps {
  title?: string;
}

const sortOptions = [
  { value: "date-newest", label: "Date Added (Newest)" },
  { value: "date-oldest", label: "Date Added (Oldest)" },
  { value: "alpha-az", label: "Alphabetical (A-Z)" },
  { value: "alpha-za", label: "Alphabetical (Z-A)" },
] as const;

const filterOptions = [
  { value: "all", label: "All Bookmarks" },
  { value: "favorites", label: "Favorites Only" },
  { value: "with-tags", label: "With Tags" },
  { value: "without-tags", label: "Without Tags" },
] as const;

function UserProfileDropdown() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

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

export function BookmarksHeader({ title = "Bookmarks" }: BookmarksHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterType,
    setFilterType,
  } = useBookmarksStore();

  const currentSort = sortOptions.find((opt) => opt.value === sortBy);
  const currentFilter = filterOptions.find((opt) => opt.value === filterType);

  return (
    <header className="w-full border-b">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-base font-semibold hidden sm:block">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-9"
            />
          </div>

          <div className="flex items-center border rounded-md p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn("rounded-sm", viewMode === "grid" && "bg-muted")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn("rounded-sm", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ArrowUpDown className="size-4" />
                <span className="hidden lg:inline">{currentSort?.label.split(" ")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Sort by
              </DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {sortBy === option.value && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "hidden sm:flex",
                  filterType !== "all" && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="size-4" />
                <span className="hidden lg:inline">
                  {filterType !== "all" ? currentFilter?.label : "Filter"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Filter by
              </DropdownMenuLabel>
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilterType(option.value)}
                  className="flex items-center justify-between"
                >
                  {option.label}
                  {filterType === option.value && <Check className="size-4" />}
                </DropdownMenuItem>
              ))}
              {filterType !== "all" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilterType("all")}
                    className="text-muted-foreground"
                  >
                    Clear filter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="hidden sm:flex" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4" />
            Add Bookmark
          </Button>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          <UserProfileDropdown />

          <ThemeToggle />
        </div>
      </div>

      <AddBookmarkDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </header>
  );
}
