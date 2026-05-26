import { create } from "zustand";
import { Note } from "@/types";

interface NotesState {
  notes: Note[];
  selectedTags: string[];
  searchQuery: string;
  loading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedTags: [],
  searchQuery: "",
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      set({ notes: data.notes, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addNote: async (note) => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error("Failed to add note");
      const data = await response.json();
      set((state) => ({ notes: [data.note, ...state.notes] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateNote: async (id, updates) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update note");
      const data = await response.json();
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...data.note } : n)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete note");
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleTag: (tagId) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tagId)
        ? state.selectedTags.filter((t) => t !== tagId)
        : [...state.selectedTags, tagId],
    })),

  clearTags: () => set({ selectedTags: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredNotes: () => {
    const state = get();
    let filtered = [...state.notes];

    if (state.selectedTags.length > 0) {
      filtered = filtered.filter((n) =>
        state.selectedTags.some((tag) => n.tags.includes(tag))
      );
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filtered;
  },
}));
