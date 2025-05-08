export enum MediaType {
  MOVIE = 'movie',
  TV_SHOW = 'tv-show',
  BOOK = 'book',
  COURSE = 'course',
  CUSTOM = 'custom'
}

export enum ItemDurationType {
  ONE_TIME = 'one-time',
  DURABLE = 'durable'
}

export enum CompletionStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  WATCHLIST = 'watchlist'
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  type: MediaType;
  durationType: ItemDurationType;
  thumbnailUrl?: string;
  status: CompletionStatus;
  progress?: number; // 0-100 percentage
  totalDuration?: number; // For durable items, total units (e.g., episodes, chapters)
  completedUnits?: number; // For durable items, completed units
  addedDate: Date;
  completedDate?: Date;
  userId: string;
  customFields?: Record<string, any>; // For additional properties based on type
}
