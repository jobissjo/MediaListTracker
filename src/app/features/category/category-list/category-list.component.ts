import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../core/services/category.service';
import { MediaService } from '../../../core/services/media.service';
import { Category } from '../../../core/models/category.model';
import { MediaType, ItemDurationType } from '../../../core/models/media-item.model';

interface CategoryWithCount {
  category: Category;
  itemCount: number;
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  defaultCategories$: Observable<CategoryWithCount[]>;
  customCategories$: Observable<CategoryWithCount[]>;
  
  MediaType = MediaType;
  ItemDurationType = ItemDurationType;
  
  constructor(
    private categoryService: CategoryService,
    private mediaService: MediaService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Get default categories with item counts
    this.defaultCategories$ = combineLatest([
      this.categoryService.getDefaultCategories(),
      this.mediaService.getMediaItems()
    ]).pipe(
      map(([categories, items]) => {
        return categories.map(category => {
          const itemCount = items.filter(item => item.categoryId === category.id).length;
          return { category, itemCount };
        });
      })
    );
    
    // Get custom categories with item counts
    this.customCategories$ = combineLatest([
      this.categoryService.getCustomCategories(),
      this.mediaService.getMediaItems()
    ]).pipe(
      map(([categories, items]) => {
        return categories.map(category => {
          const itemCount = items.filter(item => item.categoryId === category.id).length;
          return { category, itemCount };
        });
      })
    );
  }

  ngOnInit(): void {
  }

  getMediaTypeLabel(type: MediaType): string {
    switch (type) {
      case MediaType.MOVIE:
        return 'Movie';
      case MediaType.TV_SHOW:
        return 'TV Show';
      case MediaType.BOOK:
        return 'Book';
      case MediaType.COURSE:
        return 'Course';
      case MediaType.CUSTOM:
        return 'Custom';
      default:
        return 'Unknown';
    }
  }

  getDurationTypeLabel(type: ItemDurationType): string {
    switch (type) {
      case ItemDurationType.ONE_TIME:
        return 'One-time';
      case ItemDurationType.DURABLE:
        return 'Durable';
      default:
        return 'Unknown';
    }
  }

  navigateToAddCategory(): void {
    this.router.navigate(['/categories/add']);
  }

  editCategory(categoryId: string): void {
    this.router.navigate(['/categories/edit', categoryId]);
  }

  deleteCategory(category: Category): void {
    // Check if this is a default category
    if (category.isDefault) {
      this.snackBar.open('Default categories cannot be deleted', 'Close', {
        duration: 3000
      });
      return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe(success => {
        if (success) {
          this.snackBar.open('Category deleted successfully', 'Close', {
            duration: 3000
          });
        } else {
          this.snackBar.open('Failed to delete category', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  viewCategoryItems(categoryId: string): void {
    this.router.navigate(['/media'], { queryParams: { category: categoryId } });
  }
}
