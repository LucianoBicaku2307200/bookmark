import { create } from "zustand";
import { Collection } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface CollectionsState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  addCollection: (collection: Omit<Collection, "id" | "count">) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Omit<Collection, "id">>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  getCollectionById: (id: string) => Collection | undefined;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  loading: false,
  error: null,

  fetchCollections: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/collections");
      if (!response.ok) throw new Error("Failed to fetch collections");
      const data = await response.json();
      set({ collections: data.collections, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCollection: async (collection) => {
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collection),
      });
      if (!response.ok) throw new Error("Failed to add collection");
      const data = await response.json();
      set((state) => ({
        collections: [...state.collections, data.collection],
      }));
      return data.collection;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateCollection: async (id, updates) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update collection");
      const data = await response.json();
      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === id ? { ...collection, ...data.collection } : collection
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCollection: async (id) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete collection");
      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getCollectionById: (id) => {
    return get().collections.find((c) => c.id === id);
  },
}));
