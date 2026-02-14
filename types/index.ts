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