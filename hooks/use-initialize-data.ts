"use client";

import { useEffect } from "react";
import { useBookmarksStore } from "@/store/bookmarks-store";
import { useCollectionsStore } from "@/store/collections-store";
import { useTagsStore } from "@/store/tags-store";
import { useNotesStore } from "@/store/notes-store";
import { useDailyTrackStore } from "@/store/daily-track-store";
import { useAuth } from "@/components/auth/auth-provider";

export function useInitializeData() {
  const { user, loading: authLoading } = useAuth();
  const fetchBookmarks = useBookmarksStore((state) => state.fetchBookmarks);
  const fetchCollections = useCollectionsStore((state) => state.fetchCollections);
  const fetchTags = useTagsStore((state) => state.fetchTags);
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const fetchDailyTrack = useDailyTrackStore((state) => state.fetchDailyTrack);

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookmarks();
      fetchCollections();
      fetchTags();
      fetchNotes();
      fetchDailyTrack();
    }
  }, [user, authLoading, fetchBookmarks, fetchCollections, fetchTags, fetchNotes, fetchDailyTrack]);
}
