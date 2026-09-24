import { create } from "zustand";
import { Activity, ActivityType, Entry, EntryValue } from "@/types";
import { DateRange, toDateKey } from "@/lib/daily-track/chart-data";

interface DailyTrackState {
  activities: Activity[];
  entries: Entry[];
  range: DateRange;
  logDate: string | null;
  loading: boolean;
  error: string | null;

  setRange: (range: DateRange) => void;
  openLogDay: (date?: string) => void;
  closeLogDay: () => void;
  fetchDailyTrack: () => Promise<void>;
  createActivity: (name: string, type: ActivityType, color?: string) => Promise<void>;
  renameActivity: (id: string, name: string) => Promise<void>;
  setActivityColor: (id: string, color: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  saveDay: (date: string, values: Record<string, EntryValue | null>) => Promise<void>;
}

const ACTIVITIES_URL = "/api/daily-track/activities";
const ENTRIES_URL = "/api/daily-track/entries";

export const useDailyTrackStore = create<DailyTrackState>((set, get) => ({
  activities: [],
  entries: [],
  range: {},
  logDate: null,
  loading: false,
  error: null,

  setRange: (range) => set({ range }),

  openLogDay: (date) => set({ logDate: date ?? toDateKey(new Date()) }),

  closeLogDay: () => set({ logDate: null }),

  fetchDailyTrack: async () => {
    set({ loading: true, error: null });
    try {
      const [activitiesResponse, entriesResponse] = await Promise.all([
        fetch(ACTIVITIES_URL),
        fetch(ENTRIES_URL),
      ]);
      if (!activitiesResponse.ok || !entriesResponse.ok) {
        throw new Error("Failed to fetch daily track");
      }
      const [activitiesData, entriesData] = await Promise.all([
        activitiesResponse.json(),
        entriesResponse.json(),
      ]);
      set({
        activities: activitiesData.activities,
        entries: entriesData.entries,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createActivity: async (name, type, color) => {
    try {
      const response = await fetch(ACTIVITIES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, color }),
      });
      if (!response.ok) throw new Error("Failed to add activity");
      const data = await response.json();
      set((state) => ({ activities: [...state.activities, data.activity] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  renameActivity: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const response = await fetch(`${ACTIVITIES_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) throw new Error("Failed to rename activity");
      const data = await response.json();
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? data.activity : a)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setActivityColor: async (id, color) => {
    try {
      const response = await fetch(`${ACTIVITIES_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      if (!response.ok) throw new Error("Failed to update color");
      const data = await response.json();
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? data.activity : a)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteActivity: async (id) => {
    try {
      const response = await fetch(`${ACTIVITIES_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete activity");
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        // Mirrors the FK cascade; a day left with no values disappears.
        entries: state.entries
          .map((entry) => {
            const { [id]: _removed, ...values } = entry.values;
            return { ...entry, values };
          })
          .filter((entry) => Object.keys(entry.values).length > 0),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  saveDay: async (date, values) => {
    try {
      const response = await fetch(ENTRIES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, values }),
      });
      if (!response.ok) throw new Error("Failed to save day");
      const data = await response.json();
      const saved: Entry = data.entry;

      const rest = get().entries.filter((entry) => entry.date !== saved.date);
      const next =
        Object.keys(saved.values).length > 0 ? [...rest, saved] : rest;

      set({ entries: next.sort((a, b) => a.date.localeCompare(b.date)) });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
