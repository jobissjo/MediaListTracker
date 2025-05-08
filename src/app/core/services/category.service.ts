import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Category } from '../models/category.model';
import { MediaType, ItemDurationType } from '../models/media-item.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';
  private categories$ = new BehaviorSubject<Category[]>([]);

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
    this.loadInitialData();
  }

  /**
   * Load initial categories from storage
   */
  private loadInitialData(): void {
    const storedItems = this.storageService.getItem<Category[]>(this.STORAGE_KEY) || [];
    
    if (storedItems.length === 0) {
      // Load default categories if none found
      this.loadDefaultCategories();
    } else {
      this.categories$.next(storedItems);
    }
  }

  /**
   * Load default categories
   */
  private loadDefaultCategories(): void {
    const defaultCategories: Category[] = [
      {
        id: 'movies',
        name: 'Movies',
        description: 'Films and cinematographic works',
        type: MediaType.MOVIE,
        durationType: ItemDurationType.ONE_TIME,
        color: '#e53935',
        icon: 'movie',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tv-shows',
        name: 'TV Shows',
        description: 'Television series and episodes',
        type: MediaType.TV_SHOW,
        durationType: ItemDurationType.DURABLE,
        color: '#8e24aa',
        icon: 'tv',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'books',
        name: 'Books',
        description: 'Novels, fiction, and non-fiction literature',
        type: MediaType.BOOK,
        durationType: ItemDurationType.ONE_TIME,
        color: '#43a047',
        icon: 'book',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'courses',
        name: 'Courses',
        description: 'Educational courses and learning paths',
        type: MediaType.COURSE,
        durationType: ItemDurationType.DURABLE,
        color: '#1e88e5',
        icon: 'school',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    this.categories$.next(defaultCategories);
    this.storageService.setItem(this.STORAGE_KEY, defaultCategories);
  }

  /**
   * Save current categories to storage
   */
  private saveItems(): void {
    this.storageService.setItem(this.STORAGE_KEY, this.categories$.getValue());
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.categories$.asObservable();
  }

  /**
   * Get default categories
   */
  getDefaultCategories(): Observable<Category[]> {
    return this.categories$.pipe(
      map(categories => categories.filter(category => category.isDefault))
    );
  }

  /**
   * Get custom categories
   */
  getCustomCategories(): Observable<Category[]> {
    return this.categories$.pipe(
      map(categories => categories.filter(category => !category.isDefault))
    );
  }

  /**
   * Get a category by ID
   */
  getCategoryById(id: string): Observable<Category | null> {
    return this.categories$.pipe(
      map(categories => categories.find(category => category.id === id) || null)
    );
  }

  /**
   * Create a new custom category
   */
  createCategory(category: Omit<Category, 'id' | 'isDefault' | 'createdAt' | 'updatedAt' | 'userId'>): Observable<Category> {
    const userId = this.authService.getCurrentUserId();
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
      isDefault: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const currentCategories = this.categories$.getValue();
    const updatedCategories = [...currentCategories, newCategory];
    this.categories$.next(updatedCategories);
    this.saveItems();
    
    return of(newCategory);
  }

  /**
   * Update an existing category
   */
  updateCategory(id: string, updates: Partial<Category>): Observable<Category | null> {
    const currentCategories = this.categories$.getValue();
    const categoryIndex = currentCategories.findIndex(category => category.id === id);
    
    if (categoryIndex === -1) {
      return of(null);
    }
    
    // Don't allow modifying default status or ID
    const { isDefault, id: newId, ...validUpdates } = updates;
    
    const updatedCategory = {
      ...currentCategories[categoryIndex],
      ...validUpdates,
      updatedAt: new Date()
    };
    
    const updatedCategories = [
      ...currentCategories.slice(0, categoryIndex),
      updatedCategory,
      ...currentCategories.slice(categoryIndex + 1)
    ];
    
    this.categories$.next(updatedCategories);
    this.saveItems();
    
    return of(updatedCategory);
  }

  /**
   * Delete a custom category
   */
  deleteCategory(id: string): Observable<boolean> {
    const currentCategories = this.categories$.getValue();
    const category = currentCategories.find(c => c.id === id);
    
    // Prevent deletion of default categories
    if (!category || category.isDefault) {
      return of(false);
    }
    
    const updatedCategories = currentCategories.filter(c => c.id !== id);
    this.categories$.next(updatedCategories);
    this.saveItems();
    
    return of(true);
  }
}
