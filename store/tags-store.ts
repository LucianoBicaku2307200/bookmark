import { create } from "zustand";
import { tags as initialTags, type Tag } from "@/mock-data/bookmarks";

interface TagsState {
  tags: Tag[];
  addTag: (tag: Omit<Tag, "id" | "count">) => void;
  updateTag: (id: string, updates: Partial<Omit<Tag, "id">>) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: initialTags,

  addTag: (tag) =>
    set((state) => ({
      tags: [
        ...state.tags,
        {
          ...tag,
          id: tag.name.toLowerCase().replace(/\s+/g, "-"),
          count: 0,
        },
      ],
    })),

  updateTag: (id, updates) =>
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    })),

  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    })),

  getTagById: (id) => {
    return get().tags.find((t) => t.id === id);
  },
}));
