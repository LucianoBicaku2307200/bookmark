"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useTagsStore } from "@/store/tags-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBookmarkDialog({ open, onOpenChange }: AddBookmarkDialogProps) {
  const addBookmark = useBookmarksStore((state) => state.addBookmark);
  const { collections, addCollection } = useCollectionsStore();
  const { tags: allTags } = useTagsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    favicon: "",
    collectionId: "dev",
    tags: [] as string[],
    isFavorite: false,
    hasDarkIcon: false,
    isYoutubeVideo: false,
    duration: "",
    thumbnail: "",
  });

  const ensureYoutubeCollection = async () => {
    const existing = collections.find(c => c.name.toLowerCase() === "youtube");
    if (existing) return existing.id;

    try {
      const newCollection = await addCollection({
        name: "Youtube",
        icon: "brand-youtube",
        color: "red"
      });
      return newCollection.id;
    } catch (error) {
      console.error("Failed to create Youtube collection", error);
      return "";
    }
  };

  const fetchYoutubeData = async () => {
    if (!formData.url) return;

    setIsLoading(true);
    try {
      // Extract video ID from URL
      const videoIdMatch = formData.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        console.error("Could not extract video ID");
        return;
      }

      const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos";

      const response = await fetch(
        `${YOUTUBE_API_URL}?part=contentDetails,snippet&id=${videoId}&key=${API_KEY}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const snippet = item.snippet;
        const contentDetails = item.contentDetails;

        const youtubeCollectionId = await ensureYoutubeCollection();

        setFormData(prev => ({
          ...prev,
          title: snippet.title,
          description: snippet.description.substring(0, 300) + (snippet.description.length > 300 ? "..." : ""),
          duration: contentDetails.duration.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", ""),
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
          collectionId: youtubeCollectionId || prev.collectionId,
          favicon: "" // Clear favicon to prefer thumbnail
        }));
      }
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYoutubeCheck = async (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isYoutubeVideo: checked,
    }));

    if (checked) {
      const youtubeCollectionId = await ensureYoutubeCollection();
      if (youtubeCollectionId) {
        setFormData(prev => ({ ...prev, collectionId: youtubeCollectionId }));
      }

      if (formData.url && !formData.title) {
        fetchYoutubeData();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Auto-generate favicon if not provided and not youtube video
      let favicon = formData.favicon;
      if (!favicon && !formData.isYoutubeVideo && formData.url) {
        try {
          favicon = `https://www.google.com/s2/favicons?domain=${new URL(formData.url).hostname}&sz=64`;
        } catch (e) {
          // Invalid URL, ignore
        }
      }

      await addBookmark({
        title: formData.title,
        url: formData.url,
        description: formData.description,
        favicon: favicon,
        collectionId: formData.collectionId,
        tags: formData.tags,
        isFavorite: formData.isFavorite,
        hasDarkIcon: formData.hasDarkIcon,
        duration: formData.isYoutubeVideo ? formData.duration : undefined,
        thumbnail: formData.isYoutubeVideo ? formData.thumbnail : undefined,
      });

      // Reset form
      setFormData({
        title: "",
        url: "",
        description: "",
        favicon: "",
        collectionId: "dev",
        tags: [],
        isFavorite: false,
        hasDarkIcon: false,
        isYoutubeVideo: false,
        duration: "",
        thumbnail: "",
      });

      onOpenChange(false);
      toast.success("Bookmark added successfully");
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Failed to add bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Add a new bookmark to your collection. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">

            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="youtubeVideo"
                checked={formData.isYoutubeVideo}
                onChange={(e) => handleYoutubeCheck(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="youtubeVideo" className="cursor-pointer font-medium text-red-500">
                YouTube Video
              </Label>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  onBlur={() => {
                    if (formData.isYoutubeVideo && formData.url) {
                      fetchYoutubeData();
                    }
                  }}
                  required
                />
                {formData.isYoutubeVideo && (
                  <Button type="button" variant="secondary" size="sm" onClick={fetchYoutubeData} disabled={isLoading}>
                    Fetch
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Shadcn UI"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Brief description of the bookmark"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {formData.isYoutubeVideo && (
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 10:05"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            )}

            {!formData.isYoutubeVideo && (
              <div className="grid gap-2">
                <Label htmlFor="favicon">Favicon URL (optional)</Label>
                <Input
                  id="favicon"
                  type="url"
                  placeholder="Leave empty to auto-generate"
                  value={formData.favicon}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, favicon will be auto-generated from the URL
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="collection">Collection *</Label>
              <select
                id="collection"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.collectionId}
                onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                required
                disabled={formData.isYoutubeVideo}
              >
                {collections
                  .filter((c) => c.id !== "all")
                  .map((collection) => (
                    <option key={collection.id} value={collection.id} className="bg-background text-foreground">
                      {collection.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Tags (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${formData.tags.includes(tag.id)
                      ? tag.color
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="favorite" className="cursor-pointer">
                  Mark as favorite
                </Label>
              </div>

              {!formData.isYoutubeVideo && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="darkIcon"
                    checked={formData.hasDarkIcon}
                    onChange={(e) => setFormData({ ...formData, hasDarkIcon: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="darkIcon" className="cursor-pointer">
                    Has dark icon
                  </Label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Bookmark"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
