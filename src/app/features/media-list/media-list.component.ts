import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, startWith, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaService } from '../../core/services/media.service';
import { CategoryService } from '../../core/services/category.service';
import { MediaItem, CompletionStatus } from '../../core/models/media-item.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-media-list',
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss']
})
export class MediaListComponent implements OnInit {
  mediaItems$: Observable<MediaItem[]>;
  categories$: Observable<Category[]>;
  filteredItems$: Observable<MediaItem[]>;
  
  searchControl = new FormControl('');
  categoryFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  selectedCategory$ = new BehaviorSubject<string | null>(null);
  categoriesMap: Record<string, Category> = {};
  
  CompletionStatus = CompletionStatus;
  
  constructor(
    private mediaService: MediaService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.mediaItems$ = this.mediaService.getMediaItems();
    this.categories$ = this.categoryService.getCategories();
    
    // Create a map of category ids to category objects for easy lookup
    this.categories$.subscribe(categories => {
      this.categoriesMap = categories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {} as Record<string, Category>);
    });
    
    // Set up filters
    this.filteredItems$ = combineLatest([
      this.mediaItems$,
      this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith('')
      ),
      this.categoryFilter.valueChanges.pipe(startWith('all')),
      this.statusFilter.valueChanges.pipe(startWith('all'))
    ]).pipe(
      map(([items, search, category, status]) => {
        let filtered = items;
        
        // Filter by search
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
          );
        }
        
        // Filter by category
        if (category !== 'all') {
          filtered = filtered.filter(item => item.categoryId === category);
        }
        
        // Filter by status
        if (status !== 'all') {
          filtered = filtered.filter(item => item.status === status);
        }
        
        return filtered;
      })
    );
  }

  ngOnInit(): void {
    // Check if there's a category filter in the URL params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.categoryFilter.setValue(params['category']);
        this.selectedCategory$.next(params['category']);
      }
    });
  }

  getCategoryName(categoryId: string): string {
    return this.categoriesMap[categoryId]?.name || 'Unknown Category';
  }

  getCategory(categoryId: string): Category | null {
    return this.categoriesMap[categoryId] || null;
  }

  addNewMedia(): void {
    this.router.navigate(['/media/add']);
  }

  editMediaItem(item: MediaItem): void {
    this.router.navigate(['/media/edit', item.id]);
  }

  deleteMediaItem(id: string): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.mediaService.deleteMediaItem(id).subscribe(success => {
        if (success) {
          this.snackBar.open('Media item deleted successfully', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('Failed to delete media item', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  updateStatus(event: { id: string, status: CompletionStatus }): void {
    this.mediaService.updateCompletionStatus(event.id, event.status).subscribe(updatedItem => {
      if (updatedItem) {
        this.snackBar.open(`Status updated to ${this.getStatusText(event.status)}`, 'Close', {
          duration: 2000
        });
      }
    });
  }

  updateProgress(event: { id: string, completedUnits: number }): void {
    this.mediaService.updateProgress(event.id, event.completedUnits).subscribe(updatedItem => {
      if (updatedItem) {
        this.snackBar.open('Progress updated successfully', 'Close', {
          duration: 2000
        });
      }
    });
  }

  getStatusText(status: CompletionStatus): string {
    switch (status) {
      case CompletionStatus.COMPLETED:
        return 'Completed';
      case CompletionStatus.IN_PROGRESS:
        return 'In Progress';
      case CompletionStatus.WATCHLIST:
        return 'Watchlist';
      case CompletionStatus.NOT_STARTED:
        return 'Not Started';
      default:
        return 'Unknown';
    }
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.categoryFilter.setValue('all');
    this.statusFilter.setValue('all');
    this.selectedCategory$.next(null);
  }

  filterByStatus(status: CompletionStatus): void {
    this.statusFilter.setValue(status);
  }
}
