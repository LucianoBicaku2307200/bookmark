import { create } from "zustand";
import { collections as initialCollections, type Collection } from "@/mock-data/bookmarks";

interface CollectionsState {
  collections: Collection[];
  addCollection: (collection: Omit<Collection, "id" | "count">) => void;
  updateCollection: (id: string, updates: Partial<Omit<Collection, "id">>) => void;
  deleteCollection: (id: string) => void;
  getCollectionById: (id: string) => Collection | undefined;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: initialCollections,

  addCollection: (collection) =>
    set((state) => ({
      collections: [
        ...state.collections,
        {
          ...collection,
          id: collection.name.toLowerCase().replace(/\s+/g, "-"),
          count: 0,
        },
      ],
    })),

  updateCollection: (id, updates) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === id ? { ...collection, ...updates } : collection
      ),
    })),

  deleteCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),

  getCollectionById: (id) => {
    return get().collections.find((c) => c.id === id);
  },
}));
