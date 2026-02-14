import { create } from "zustand";
import { Tag } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface TagsState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  addTag: (tag: Omit<Tag, "id" | "count">) => Promise<void>;
  updateTag: (id: string, updates: Partial<Omit<Tag, "id">>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagById: (id: string) => Tag | undefined;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  loading: false,
  error: null,

  fetchTags: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      set({ tags: data.tags, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addTag: async (tag) => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tag),
      });
      if (!response.ok) throw new Error("Failed to add tag");
      const data = await response.json();
      set((state) => ({
        tags: [...state.tags, data.tag],
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTag: async (id, updates) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update tag");
      const data = await response.json();
      set((state) => ({
        tags: state.tags.map((tag) =>
          tag.id === id ? { ...tag, ...data.tag } : tag
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tag");
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getTagById: (id) => {
    return get().tags.find((t) => t.id === id);
  },
}));
