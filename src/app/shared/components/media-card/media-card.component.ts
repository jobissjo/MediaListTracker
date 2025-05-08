import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MediaItem, CompletionStatus, ItemDurationType } from '../../../core/models/media-item.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss']
})
export class MediaCardComponent {
  @Input() mediaItem!: MediaItem;
  @Input() category?: Category;
  @Input() showActions = true;
  
  @Output() edit = new EventEmitter<MediaItem>();
  @Output() delete = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ id: string, status: CompletionStatus }>();
  @Output() progressUpdate = new EventEmitter<{ id: string, completedUnits: number }>();
  
  CompletionStatus = CompletionStatus;
  ItemDurationType = ItemDurationType;
  
  // Track when user is adjusting progress
  isAdjustingProgress = false;
  tempProgress = 0;
  
  get statusColor(): string {
    switch (this.mediaItem.status) {
      case CompletionStatus.COMPLETED:
        return '#4caf50'; // Green
      case CompletionStatus.IN_PROGRESS:
        return '#2196f3'; // Blue
      case CompletionStatus.WATCHLIST:
        return '#ff9800'; // Orange
      case CompletionStatus.NOT_STARTED:
      default:
        return '#9e9e9e'; // Gray
    }
  }
  
  get statusText(): string {
    switch (this.mediaItem.status) {
      case CompletionStatus.COMPLETED:
        return 'Completed';
      case CompletionStatus.IN_PROGRESS:
        return 'In Progress';
      case CompletionStatus.WATCHLIST:
        return 'Watchlist';
      case CompletionStatus.NOT_STARTED:
      default:
        return 'Not Started';
    }
  }
  
  constructor() { }
  
  onEdit(): void {
    this.edit.emit(this.mediaItem);
  }
  
  onDelete(): void {
    this.delete.emit(this.mediaItem.id);
  }
  
  onStatusChange(status: CompletionStatus): void {
    this.statusChange.emit({ id: this.mediaItem.id, status });
  }
  
  startAdjustingProgress(): void {
    this.isAdjustingProgress = true;
    this.tempProgress = this.mediaItem.completedUnits || 0;
  }
  
  updateTemporaryProgress(units: number): void {
    if (this.mediaItem.totalDuration) {
      this.tempProgress = Math.max(0, Math.min(units, this.mediaItem.totalDuration));
    }
  }
  
  commitProgress(): void {
    this.isAdjustingProgress = false;
    this.progressUpdate.emit({ id: this.mediaItem.id, completedUnits: this.tempProgress });
  }
  
  cancelProgressAdjustment(): void {
    this.isAdjustingProgress = false;
  }
  
  formatCompletionDate(date?: Date): string {
    if (!date) return 'Not completed';
    return new Date(date).toLocaleDateString();
  }
}
