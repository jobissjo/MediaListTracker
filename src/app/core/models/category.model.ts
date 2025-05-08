import { MediaType, ItemDurationType } from './media-item.model';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: MediaType;
  durationType: ItemDurationType;
  color?: string;
  icon?: string;
  isDefault: boolean;
  userId?: string; // Only custom categories have userId
  createdAt: Date;
  updatedAt: Date;
}
