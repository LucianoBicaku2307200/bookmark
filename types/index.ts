export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon: string;
  collectionId: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
  hasDarkIcon?: boolean;
  duration?: string;
  thumbnail?: string;
  startAt?: string;
  endAt?: string;
};

export type Collection = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  count: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActivityType = "number" | "checkbox";

export type Activity = {
  id: string;
  name: string;
  type: ActivityType;
  color: string;
};

export type EntryValue = number | boolean;

export type Entry = {
  date: string;
  values: Record<string, EntryValue>;
};

export type TrackerData = {
  activities: Activity[];
  entries: Entry[];
};
