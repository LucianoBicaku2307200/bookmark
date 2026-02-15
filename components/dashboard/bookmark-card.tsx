"use client";

import { useState } from "react";
import Image from "next/image";
import { AddBookmarkDialog } from "./add-bookmark-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  Tag,
  Archive,
  Clock,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useTagsStore } from "@/store/tags-store";
import { type Bookmark } from "@/types";

interface BookmarkCardProps {
  bookmark: Bookmark;
  variant?: "grid" | "list";
}

export function BookmarkCard({
  bookmark,
  variant = "grid",
}: BookmarkCardProps) {
  const { toggleFavorite, archiveBookmark, trashBookmark } = useBookmarksStore();
  const { tags: allTags } = useTagsStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const bookmarkTags = allTags.filter((tag) => bookmark.tags.includes(tag.id));
  const isYoutube = bookmark.collectionId === "youtube" || !!bookmark.thumbnail || !!bookmark.duration;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
  };

  const handleOpenUrl = () => {
    window.open(bookmark.url, "_blank");
  };

  return (
    <>
      <AddBookmarkDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        bookmark={bookmark}
      />

      {variant === "list" ? (
        <div className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className={cn("size-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0", isYoutube ? "bg-red-500/10" : "bg-muted")}>
            {isYoutube ? (
              <Youtube className="size-5 text-red-600" />
            ) : (
              <Image
                src={bookmark.favicon}
                alt={bookmark.title}
                width={24}
                height={24}
                className={cn("size-6", bookmark.hasDarkIcon && "dark:invert")}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{bookmark.title}</h3>
              {bookmarkTags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  {bookmarkTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                        tag.color
                      )}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {bookmarkTags.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{bookmarkTags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
              <span className="truncate">{bookmark.url}</span>
              {isYoutube && bookmark.duration && (
                <span className="flex items-center gap-1 text-xs shrink-0 bg-muted px-1.5 py-0.5 rounded-sm">
                  <Clock className="size-3" />
                  {bookmark.duration}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => toggleFavorite(bookmark.id)}
            >
              <Heart
                className={cn(
                  "size-4",
                  bookmark.isFavorite && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={handleOpenUrl}>
              <ExternalLink className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="size-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => archiveBookmark(bookmark.id)}>
                  <Archive className="size-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => trashBookmark(bookmark.id)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <div className="group relative flex flex-col rounded-xl border bg-card overflow-hidden hover:bg-accent/30 transition-colors">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon-xs"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => toggleFavorite(bookmark.id)}
            >
              <Heart
                className={cn(
                  "size-4",
                  bookmark.isFavorite && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="size-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenUrl}>
                  <ExternalLink className="size-4 mr-2" />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => archiveBookmark(bookmark.id)}>
                  <Archive className="size-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => trashBookmark(bookmark.id)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            className="w-full text-left cursor-pointer"
            onClick={handleOpenUrl}
          >
            {isYoutube && bookmark.thumbnail ? (
              <div className="h-32 w-full relative bg-black group-hover:opacity-90 transition-opacity">
                <Image
                  src={bookmark.thumbnail}
                  alt={bookmark.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Youtube className="size-10 text-white fill-red-600" />
                </div>
              </div>
            ) : (
              <div className="h-32 bg-linear-to-br from-muted/50 to-muted flex items-center justify-center">
                <div className="size-12 rounded-xl bg-background shadow-sm flex items-center justify-center">
                  <Image
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    width={32}
                    height={32}
                    className={cn("size-8", bookmark.hasDarkIcon && "dark:invert")}
                  />
                </div>
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium line-clamp-1">{bookmark.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bookmark.description}
              </p>
              {isYoutube && bookmark.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium pt-1">
                  <Clock className="size-3" />
                  {bookmark.duration}
                </span>
              )}

              {bookmarkTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {bookmarkTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                        tag.color
                      )}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {bookmarkTags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground py-0.5">
                      +{bookmarkTags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        </div>
      )}
    </>
  );
}
