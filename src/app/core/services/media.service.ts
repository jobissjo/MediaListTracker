import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { MediaItem, MediaType, ItemDurationType, CompletionStatus } from '../models/media-item.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private readonly STORAGE_KEY = 'media_items';
  private mediaItems$ = new BehaviorSubject<MediaItem[]>([]);

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
    this.loadInitialData();
  }

  /**
   * Load initial data from storage
   */
  private loadInitialData(): void {
    const storedItems = this.storageService.getItem<MediaItem[]>(this.STORAGE_KEY) || [];
    
    if (storedItems.length === 0) {
      // Load mock data if no items found
      this.loadMockData();
    } else {
      this.mediaItems$.next(storedItems);
    }
  }

  /**
   * Load mock data for testing purposes
   */
  private loadMockData(): void {
    const userId = this.authService.getCurrentUserId();
    const mockData: MediaItem[] = [
      // Movies
      {
        id: uuidv4(),
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        categoryId: 'movies',
        type: MediaType.MOVIE,
        durationType: ItemDurationType.ONE_TIME,
        thumbnailUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
        status: CompletionStatus.COMPLETED,
        progress: 100,
        addedDate: new Date('2023-01-15'),
        completedDate: new Date('2023-01-20'),
        userId
      },
      {
        id: uuidv4(),
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        categoryId: 'movies',
        type: MediaType.MOVIE,
        durationType: ItemDurationType.ONE_TIME,
        thumbnailUrl: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
        status: CompletionStatus.WATCHLIST,
        addedDate: new Date('2023-02-10'),
        userId
      },
      
      // TV Shows
      {
        id: uuidv4(),
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
        categoryId: 'tv-shows',
        type: MediaType.TV_SHOW,
        durationType: ItemDurationType.DURABLE,
        thumbnailUrl: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg',
        status: CompletionStatus.IN_PROGRESS,
        progress: 60,
        totalDuration: 62, // Total episodes
        completedUnits: 37, // Watched episodes
        addedDate: new Date('2022-11-05'),
        userId
      },
      {
        id: uuidv4(),
        title: 'Stranger Things',
        description: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces.',
        categoryId: 'tv-shows',
        type: MediaType.TV_SHOW,
        durationType: ItemDurationType.DURABLE,
        thumbnailUrl: 'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg',
        status: CompletionStatus.NOT_STARTED,
        progress: 0,
        totalDuration: 34, // Total episodes across all seasons
        completedUnits: 0,
        addedDate: new Date('2023-03-20'),
        userId
      },
      
      // Books
      {
        id: uuidv4(),
        title: 'To Kill a Mockingbird',
        description: 'The story of racial injustice and the loss of innocence in the American South.',
        categoryId: 'books',
        type: MediaType.BOOK,
        durationType: ItemDurationType.ONE_TIME,
        thumbnailUrl: 'https://pixabay.com/get/g7ee19c332ca7043aa67009f1cb92706078e4d5f87515218676790c88faa87620ede58a8de6e2c1e4caac8d6a184b6aadeba9a6ac246a775a80fb186c4e71333b_1280.jpg',
        status: CompletionStatus.COMPLETED,
        progress: 100,
        addedDate: new Date('2022-12-10'),
        completedDate: new Date('2023-01-05'),
        userId
      },
      {
        id: uuidv4(),
        title: '1984',
        description: 'A dystopian social science fiction novel by George Orwell.',
        categoryId: 'books',
        type: MediaType.BOOK,
        durationType: ItemDurationType.ONE_TIME,
        thumbnailUrl: 'https://pixabay.com/get/g8caae86b83cacc56268049abeb25d91367ee65f3b7dec85505c8d55b7f212924ddfc435392754b442dd98a27cd784db3387bc76aa7e06f38a7f2c7a16174ec06_1280.jpg',
        status: CompletionStatus.IN_PROGRESS,
        progress: 45,
        addedDate: new Date('2023-04-15'),
        userId
      },
      
      // Courses
      {
        id: uuidv4(),
        title: 'Angular Fundamentals',
        description: 'Learn the basics of Angular development including components, services, and routing.',
        categoryId: 'courses',
        type: MediaType.COURSE,
        durationType: ItemDurationType.DURABLE,
        thumbnailUrl: 'https://pixabay.com/get/ga64d23e70b0de7525ef4df07bd9132efffcb9ca3d3273c2936e38d40ce14f69ca4ba4b5d2898d087a754bfa6c217f33eb997c43a0fb073200667c5ec38090481_1280.jpg',
        status: CompletionStatus.IN_PROGRESS,
        progress: 30,
        totalDuration: 10, // Total modules
        completedUnits: 3, // Completed modules
        addedDate: new Date('2023-02-01'),
        userId
      },
      {
        id: uuidv4(),
        title: 'Machine Learning Basics',
        description: 'Introduction to machine learning algorithms and concepts.',
        categoryId: 'courses',
        type: MediaType.COURSE,
        durationType: ItemDurationType.DURABLE,
        thumbnailUrl: 'https://pixabay.com/get/g9a2fd20f30bcc291413a6c1d9573ea202e4eea05ffe3f1166ee34b625be8e7e975d78a3be77ed68259dc796d134359260e456bfd440db482af021b7506bf5ef9_1280.jpg',
        status: CompletionStatus.NOT_STARTED,
        progress: 0,
        totalDuration: 8, // Total modules
        completedUnits: 0, // Completed modules
        addedDate: new Date('2023-05-10'),
        userId
      }
    ];
    
    this.mediaItems$.next(mockData);
    this.storageService.setItem(this.STORAGE_KEY, mockData);
  }

  /**
   * Save current media items to storage
   */
  private saveItems(): void {
    this.storageService.setItem(this.STORAGE_KEY, this.mediaItems$.getValue());
  }

  /**
   * Get all media items
   */
  getMediaItems(): Observable<MediaItem[]> {
    return this.mediaItems$.asObservable();
  }

  /**
   * Get media items by category
   */
  getMediaItemsByCategory(categoryId: string): Observable<MediaItem[]> {
    return this.mediaItems$.pipe(
      map(items => items.filter(item => item.categoryId === categoryId))
    );
  }

  /**
   * Get media items by status
   */
  getMediaItemsByStatus(status: CompletionStatus): Observable<MediaItem[]> {
    return this.mediaItems$.pipe(
      map(items => items.filter(item => item.status === status))
    );
  }

  /**
   * Get a specific media item by ID
   */
  getMediaItemById(id: string): Observable<MediaItem | null> {
    return this.mediaItems$.pipe(
      map(items => items.find(item => item.id === id) || null)
    );
  }

  /**
   * Create a new media item
   */
  createMediaItem(mediaItem: Omit<MediaItem, 'id' | 'addedDate' | 'userId'>): Observable<MediaItem> {
    const userId = this.authService.getCurrentUserId();
    const newItem: MediaItem = {
      ...mediaItem,
      id: uuidv4(),
      addedDate: new Date(),
      userId
    };
    
    const currentItems = this.mediaItems$.getValue();
    const updatedItems = [...currentItems, newItem];
    this.mediaItems$.next(updatedItems);
    this.saveItems();
    
    return of(newItem);
  }

  /**
   * Update an existing media item
   */
  updateMediaItem(id: string, updates: Partial<MediaItem>): Observable<MediaItem | null> {
    const currentItems = this.mediaItems$.getValue();
    const itemIndex = currentItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return of(null);
    }
    
    const updatedItem = {
      ...currentItems[itemIndex],
      ...updates
    };
    
    const updatedItems = [
      ...currentItems.slice(0, itemIndex),
      updatedItem,
      ...currentItems.slice(itemIndex + 1)
    ];
    
    this.mediaItems$.next(updatedItems);
    this.saveItems();
    
    return of(updatedItem);
  }

  /**
   * Delete a media item
   */
  deleteMediaItem(id: string): Observable<boolean> {
    const currentItems = this.mediaItems$.getValue();
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    if (updatedItems.length === currentItems.length) {
      return of(false);
    }
    
    this.mediaItems$.next(updatedItems);
    this.saveItems();
    
    return of(true);
  }

  /**
   * Update the completion status of a media item
   */
  updateCompletionStatus(id: string, status: CompletionStatus, progress?: number): Observable<MediaItem | null> {
    const updates: Partial<MediaItem> = { status };
    
    if (progress !== undefined) {
      updates.progress = progress;
    }
    
    if (status === CompletionStatus.COMPLETED) {
      updates.completedDate = new Date();
      updates.progress = 100;
    }
    
    return this.updateMediaItem(id, updates);
  }

  /**
   * Update progress for a durable media item
   */
  updateProgress(id: string, completedUnits: number): Observable<MediaItem | null> {
    return this.getMediaItemById(id).pipe(
      map(item => {
        if (!item || item.durationType !== ItemDurationType.DURABLE || !item.totalDuration) {
          return null;
        }
        
        const progress = Math.min(Math.round((completedUnits / item.totalDuration) * 100), 100);
        let status = item.status;
        
        if (completedUnits === 0) {
          status = CompletionStatus.NOT_STARTED;
        } else if (completedUnits === item.totalDuration) {
          status = CompletionStatus.COMPLETED;
        } else if (completedUnits > 0 && completedUnits < item.totalDuration) {
          status = CompletionStatus.IN_PROGRESS;
        }
        
        const updates: Partial<MediaItem> = {
          completedUnits,
          progress,
          status
        };
        
        if (status === CompletionStatus.COMPLETED) {
          updates.completedDate = new Date();
        }
        
        return this.updateMediaItem(id, updates);
      })
    );
  }

  /**
   * Search media items by title
   */
  searchMediaItems(query: string): Observable<MediaItem[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.mediaItems$.pipe(
      map(items => items.filter(item => 
        item.title.toLowerCase().includes(normalizedQuery) ||
        (item.description && item.description.toLowerCase().includes(normalizedQuery))
      ))
    );
  }
}
