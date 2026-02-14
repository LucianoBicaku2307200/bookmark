"use client";

import { useEffect } from "react";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useTagsStore } from "@/store/tags-store";
import { useAuth } from "@/components/auth/auth-provider";

export function useInitializeData() {
  const { user, loading: authLoading } = useAuth();
  const fetchBookmarks = useBookmarksStore((state) => state.fetchBookmarks);
  const fetchCollections = useCollectionsStore((state) => state.fetchCollections);
  const fetchTags = useTagsStore((state) => state.fetchTags);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!authLoading && user) {
      fetchBookmarks();
      fetchCollections();
      fetchTags();
    }
  }, [user, authLoading, fetchBookmarks, fetchCollections, fetchTags]);
}
