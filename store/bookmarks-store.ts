import { create } from "zustand";
import { Bookmark } from "@/types";
import { createClient } from "@/lib/supabase/client";

type ViewMode = "grid" | "list";
type SortBy = "date-newest" | "date-oldest" | "alpha-az" | "alpha-za";
type FilterType = "all" | "favorites" | "with-tags" | "without-tags";

interface BookmarksState {
  bookmarks: Bookmark[];
  archivedBookmarks: Bookmark[];
  trashedBookmarks: Bookmark[];
  selectedCollection: string;
  selectedTags: string[];
  searchQuery: string;
  viewMode: ViewMode;
  sortBy: SortBy;
  filterType: FilterType;
  loading: boolean;
  error: string | null;
  
  // Fetch methods
  fetchBookmarks: () => Promise<void>;
  fetchArchivedBookmarks: () => Promise<void>;
  fetchTrashedBookmarks: () => Promise<void>;
  
  // UI state methods
  setSelectedCollection: (collectionId: string) => void;
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setFilterType: (filter: FilterType) => void;
  
  // CRUD methods
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => Promise<void>;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  toggleFavorite: (bookmarkId: string) => Promise<void>;
  archiveBookmark: (bookmarkId: string) => Promise<void>;
  restoreFromArchive: (bookmarkId: string) => Promise<void>;
  trashBookmark: (bookmarkId: string) => Promise<void>;
  restoreFromTrash: (bookmarkId: string) => Promise<void>;
  permanentlyDelete: (bookmarkId: string) => Promise<void>;
  
  // Getter methods
  getFilteredBookmarks: () => Bookmark[];
  getFavoriteBookmarks: () => Bookmark[];
  getArchivedBookmarks: () => Bookmark[];
  getTrashedBookmarks: () => Bookmark[];
}

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  bookmarks: [],
  archivedBookmarks: [],
  trashedBookmarks: [],
  selectedCollection: "all",
  selectedTags: [],
  searchQuery: "",
  viewMode: "grid",
  sortBy: "date-newest",
  filterType: "all",
  loading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/bookmarks");
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      const data = await response.json();
      set({ bookmarks: data.bookmarks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchArchivedBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/bookmarks?archived=true");
      if (!response.ok) throw new Error("Failed to fetch archived bookmarks");
      const data = await response.json();
      set({ archivedBookmarks: data.bookmarks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTrashedBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/bookmarks?trashed=true");
      if (!response.ok) throw new Error("Failed to fetch trashed bookmarks");
      const data = await response.json();
      set({ trashedBookmarks: data.bookmarks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedCollection: (collectionId) => set({ selectedCollection: collectionId }),

  toggleTag: (tagId) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tagId)
        ? state.selectedTags.filter((t) => t !== tagId)
        : [...state.selectedTags, tagId],
    })),

  clearTags: () => set({ selectedTags: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSortBy: (sort) => set({ sortBy: sort }),

  setFilterType: (filter) => set({ filterType: filter }),

  addBookmark: async (bookmark) => {
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookmark),
      });
      if (!response.ok) throw new Error("Failed to add bookmark");
      const data = await response.json();
      set((state) => ({
        bookmarks: [data.bookmark, ...state.bookmarks],
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateBookmark: async (id, updates) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update bookmark");
      const data = await response.json();
      
      set((state) => ({
        bookmarks: state.bookmarks.map((b) => 
          b.id === id ? { ...b, ...data.bookmark } : b
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleFavorite: async (bookmarkId) => {
    const bookmark = get().bookmarks.find((b) => b.id === bookmarkId);
    if (!bookmark) return;

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !bookmark.isFavorite }),
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      
      set((state) => ({
        bookmarks: state.bookmarks.map((b) =>
          b.id === bookmarkId ? { ...b, isFavorite: !b.isFavorite } : b
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  archiveBookmark: async (bookmarkId) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Failed to archive bookmark");
      
      const bookmark = get().bookmarks.find((b) => b.id === bookmarkId);
      if (bookmark) {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
          archivedBookmarks: [...state.archivedBookmarks, { ...bookmark, archivedAt: new Date().toISOString() }],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  restoreFromArchive: async (bookmarkId) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: null }),
      });
      if (!response.ok) throw new Error("Failed to restore bookmark");
      
      const bookmark = get().archivedBookmarks.find((b) => b.id === bookmarkId);
      if (bookmark) {
        set((state) => ({
          archivedBookmarks: state.archivedBookmarks.filter((b) => b.id !== bookmarkId),
          bookmarks: [...state.bookmarks, { ...bookmark, archivedAt: undefined }],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  trashBookmark: async (bookmarkId) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trashedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error("Failed to trash bookmark");
      
      const bookmark = get().bookmarks.find((b) => b.id === bookmarkId);
      if (bookmark) {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
          trashedBookmarks: [...state.trashedBookmarks, { ...bookmark, trashedAt: new Date().toISOString() }],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  restoreFromTrash: async (bookmarkId) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trashedAt: null }),
      });
      if (!response.ok) throw new Error("Failed to restore bookmark");
      
      const bookmark = get().trashedBookmarks.find((b) => b.id === bookmarkId);
      if (bookmark) {
        set((state) => ({
          trashedBookmarks: state.trashedBookmarks.filter((b) => b.id !== bookmarkId),
          bookmarks: [...state.bookmarks, { ...bookmark, trashedAt: undefined }],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  permanentlyDelete: async (bookmarkId) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bookmark");
      
      set((state) => ({
        trashedBookmarks: state.trashedBookmarks.filter((b) => b.id !== bookmarkId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getFilteredBookmarks: () => {
    const state = get();
    let filtered = [...state.bookmarks];

    if (state.selectedCollection !== "all") {
      filtered = filtered.filter((b) => b.collectionId === state.selectedCollection);
    }

    if (state.selectedTags.length > 0) {
      filtered = filtered.filter((b) =>
        state.selectedTags.some((tag) => b.tags.includes(tag))
      );
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query)
      );
    }

    switch (state.filterType) {
      case "favorites":
        filtered = filtered.filter((b) => b.isFavorite);
        break;
      case "with-tags":
        filtered = filtered.filter((b) => b.tags.length > 0);
        break;
      case "without-tags":
        filtered = filtered.filter((b) => b.tags.length === 0);
        break;
    }

    switch (state.sortBy) {
      case "date-newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "alpha-az":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "alpha-za":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return filtered;
  },

  getFavoriteBookmarks: () => {
    const state = get();
    let filtered = state.bookmarks.filter((b) => b.isFavorite);

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query)
      );
    }

    switch (state.sortBy) {
      case "date-newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "alpha-az":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "alpha-za":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return filtered;
  },

  getArchivedBookmarks: () => {
    const state = get();
    let filtered = [...state.archivedBookmarks];

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  getTrashedBookmarks: () => {
    const state = get();
    let filtered = [...state.trashedBookmarks];

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query)
      );
    }

    return filtered;
  },
}));
