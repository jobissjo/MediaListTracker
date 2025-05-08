import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaService } from '../../core/services/media.service';
import { CategoryService } from '../../core/services/category.service';
import { MediaItem, CompletionStatus } from '../../core/models/media-item.model';
import { Category } from '../../core/models/category.model';

interface CategoryWithItems {
  category: Category;
  items: MediaItem[];
  inProgress: number;
  completed: number;
  watchlist: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  recentItems$: Observable<MediaItem[]>;
  inProgressItems$: Observable<MediaItem[]>;
  categoriesWithItems$: Observable<CategoryWithItems[]>;
  
  totalItems = 0;
  completedItems = 0;
  inProgressItems = 0;
  watchlistItems = 0;
  
  constructor(
    private mediaService: MediaService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    // Get recent items (up to 5)
    this.recentItems$ = this.mediaService.getMediaItems().pipe(
      map(items => {
        // Sort by date added (newest first) and take first 5
        return [...items]
          .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
          .slice(0, 5);
      })
    );
    
    // Get in-progress items (up to 5)
    this.inProgressItems$ = this.mediaService.getMediaItemsByStatus(CompletionStatus.IN_PROGRESS).pipe(
      map(items => items.slice(0, 5))
    );
    
    // Get categories with their items count
    this.categoriesWithItems$ = combineLatest([
      this.categoryService.getCategories(),
      this.mediaService.getMediaItems()
    ]).pipe(
      map(([categories, items]) => {
        // Update summary counts
        this.totalItems = items.length;
        this.completedItems = items.filter(item => item.status === CompletionStatus.COMPLETED).length;
        this.inProgressItems = items.filter(item => item.status === CompletionStatus.IN_PROGRESS).length;
        this.watchlistItems = items.filter(item => item.status === CompletionStatus.WATCHLIST).length;
        
        return categories.map(category => {
          const categoryItems = items.filter(item => item.categoryId === category.id);
          return {
            category,
            items: categoryItems,
            inProgress: categoryItems.filter(item => item.status === CompletionStatus.IN_PROGRESS).length,
            completed: categoryItems.filter(item => item.status === CompletionStatus.COMPLETED).length,
            watchlist: categoryItems.filter(item => item.status === CompletionStatus.WATCHLIST).length
          };
        });
      })
    );
  }

  ngOnInit(): void {
  }

  navigateToMediaList(categoryId?: string): void {
    if (categoryId) {
      this.router.navigate(['/media'], { queryParams: { category: categoryId } });
    } else {
      this.router.navigate(['/media']);
    }
  }

  navigateToAddMedia(): void {
    this.router.navigate(['/media/add']);
  }
  
  onStatusChange(event: { id: string, status: CompletionStatus }): void {
    this.mediaService.updateCompletionStatus(event.id, event.status).subscribe();
  }
  
  onProgressUpdate(event: { id: string, completedUnits: number }): void {
    this.mediaService.updateProgress(event.id, event.completedUnits).subscribe();
  }
  
  getCompletionPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
}
