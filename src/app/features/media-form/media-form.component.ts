import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MediaService } from '../../core/services/media.service';
import { CategoryService } from '../../core/services/category.service';
import { MediaItem, MediaType, ItemDurationType, CompletionStatus } from '../../core/models/media-item.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-media-form',
  templateUrl: './media-form.component.html',
  styleUrls: ['./media-form.component.scss']
})
export class MediaFormComponent implements OnInit {
  mediaForm!: FormGroup;
  categories$!: Observable<Category[]>;
  isEdit = false;
  mediaItemId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  
  // Enums for template usage
  MediaType = MediaType;
  ItemDurationType = ItemDurationType;
  CompletionStatus = CompletionStatus;
  
  // Thumbnail URLs for different media types
  defaultThumbnails: Record<MediaType, string[]> = {
    [MediaType.MOVIE]: [
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
      'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg'
    ],
    [MediaType.TV_SHOW]: [
      'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg',
      'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg'
    ],
    [MediaType.BOOK]: [
      'https://pixabay.com/get/g7ee19c332ca7043aa67009f1cb92706078e4d5f87515218676790c88faa87620ede58a8de6e2c1e4caac8d6a184b6aadeba9a6ac246a775a80fb186c4e71333b_1280.jpg',
      'https://pixabay.com/get/g8caae86b83cacc56268049abeb25d91367ee65f3b7dec85505c8d55b7f212924ddfc435392754b442dd98a27cd784db3387bc76aa7e06f38a7f2c7a16174ec06_1280.jpg',
      'https://pixabay.com/get/g7e7667703799c7edd79776a05d7adde8e2bf6e577cbf0f643815f0c3ac837c04b8559c5b57010ff123b45efdb9a6c2c43202087a4741a5e826f3dac171d6eb9b_1280.jpg',
      'https://pixabay.com/get/g9a0082709aa357ccab7fd3dc41c6551e6732eaa90b2925bf93c2f06f5ae7c180f7a558fb179f08f3e8c93e02d7ec57d7f5d257c8866085306845a0d4a6dcf9a1_1280.jpg',
      'https://pixabay.com/get/g8134ef564ea577493c302d73bb2803eb08945439c7464bf3446d2ea09e4ffbf4a9c26d81179e389d598151baa1d5bba4cec0fb88f754211829193a1dcb85e351_1280.jpg',
      'https://pixabay.com/get/gc1ff49986fb6ee38f33056f82145521323831ef1cbaa2a406e32aa5ef8847e56b9186cdfe51e253d35e429c75a49abcff7b23fa5e23b12a29b1f8d13c6716baa_1280.jpg'
    ],
    [MediaType.COURSE]: [
      'https://pixabay.com/get/ga64d23e70b0de7525ef4df07bd9132efffcb9ca3d3273c2936e38d40ce14f69ca4ba4b5d2898d087a754bfa6c217f33eb997c43a0fb073200667c5ec38090481_1280.jpg',
      'https://pixabay.com/get/g9a2fd20f30bcc291413a6c1d9573ea202e4eea05ffe3f1166ee34b625be8e7e975d78a3be77ed68259dc796d134359260e456bfd440db482af021b7506bf5ef9_1280.jpg',
      'https://pixabay.com/get/g257f6d6fd3841e08f9ff1cc721b33693cdbd6a66d808f06a37d082d039270d4d72a6d786c888c944a55d22b24863a643_1280.jpg',
      'https://pixabay.com/get/ge1cb4dbb90a2364a0bc9bb8b323678adb56b5f0a276650b44d170c014e49fc966d5bbf03b8513c3a1b11db281e6d4898_1280.jpg'
    ],
    [MediaType.CUSTOM]: []
  };
  
  constructor(
    private fb: FormBuilder,
    private mediaService: MediaService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.checkForEditMode();
    
    // Listen to category changes to update form based on selected category
    this.mediaForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.updateFormBasedOnCategory(categoryId);
      }
    });
    
    // Listen to media type changes to provide default thumbnails
    this.mediaForm.get('type')?.valueChanges.subscribe(type => {
      if (type && !this.isEdit) {
        this.updateThumbnailOptions(type as MediaType);
      }
    });
  }

  /**
   * Initialize the form with default values
   */
  initForm(): void {
    this.mediaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categoryId: ['', Validators.required],
      type: [MediaType.MOVIE, Validators.required],
      durationType: [ItemDurationType.ONE_TIME, Validators.required],
      thumbnailUrl: [''],
      status: [CompletionStatus.NOT_STARTED, Validators.required],
      progress: [0],
      totalDuration: [null],
      completedUnits: [0]
    });
  }

  /**
   * Load categories from service
   */
  loadCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  /**
   * Check if we're in edit mode and load the media item if needed
   */
  checkForEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.mediaItemId = id;
      this.isLoading = true;
      
      this.mediaService.getMediaItemById(id).subscribe({
        next: (mediaItem) => {
          if (mediaItem) {
            this.populateForm(mediaItem);
          } else {
            this.handleItemNotFound();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error);
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Populate the form with media item data
   */
  populateForm(mediaItem: MediaItem): void {
    this.mediaForm.patchValue({
      title: mediaItem.title,
      description: mediaItem.description || '',
      categoryId: mediaItem.categoryId,
      type: mediaItem.type,
      durationType: mediaItem.durationType,
      thumbnailUrl: mediaItem.thumbnailUrl || '',
      status: mediaItem.status,
      progress: mediaItem.progress || 0,
      totalDuration: mediaItem.totalDuration || null,
      completedUnits: mediaItem.completedUnits || 0
    });
  }

  /**
   * Update form based on selected category
   */
  updateFormBasedOnCategory(categoryId: string): void {
    if (!categoryId) return;
    
    this.categoryService.getCategoryById(categoryId).subscribe(category => {
      if (category) {
        // Don't override values if in edit mode
        if (!this.isEdit) {
          this.mediaForm.patchValue({
            type: category.type,
            durationType: category.durationType
          });
          
          this.updateThumbnailOptions(category.type);
        }
      }
    });
  }

  /**
   * Update thumbnail options based on media type
   */
  updateThumbnailOptions(type: MediaType): void {
    const thumbnails = this.defaultThumbnails[type];
    if (thumbnails && thumbnails.length > 0) {
      // Randomly select a thumbnail
      const randomIndex = Math.floor(Math.random() * thumbnails.length);
      this.mediaForm.get('thumbnailUrl')?.setValue(thumbnails[randomIndex]);
    }
  }

  /**
   * Is the form for a durable media type
   */
  isDurableType(): boolean {
    return this.mediaForm.get('durationType')?.value === ItemDurationType.DURABLE;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.mediaForm.invalid) {
      this.markFormGroupTouched(this.mediaForm);
      return;
    }
    
    this.isSubmitting = true;
    const formValue = this.mediaForm.value;
    
    // Adjust progress value based on completed units for durable items
    if (formValue.durationType === ItemDurationType.DURABLE && formValue.totalDuration) {
      const completedUnits = formValue.completedUnits || 0;
      formValue.progress = Math.min(
        Math.round((completedUnits / formValue.totalDuration) * 100), 
        100
      );
    }
    
    // For completed items, ensure progress is 100%
    if (formValue.status === CompletionStatus.COMPLETED) {
      formValue.progress = 100;
      if (formValue.durationType === ItemDurationType.DURABLE && formValue.totalDuration) {
        formValue.completedUnits = formValue.totalDuration;
      }
    }
    
    if (this.isEdit && this.mediaItemId) {
      this.updateMediaItem(formValue);
    } else {
      this.createMediaItem(formValue);
    }
  }

  /**
   * Create a new media item
   */
  createMediaItem(formValue: any): void {
    this.mediaService.createMediaItem(formValue).subscribe({
      next: (item) => {
        this.handleSuccess(`${item.title} added successfully!`);
        this.router.navigate(['/media']);
      },
      error: (error) => {
        this.handleError(error);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Update an existing media item
   */
  updateMediaItem(formValue: any): void {
    if (!this.mediaItemId) return;
    
    this.mediaService.updateMediaItem(this.mediaItemId, formValue).subscribe({
      next: (item) => {
        if (item) {
          this.handleSuccess(`${item.title} updated successfully!`);
          this.router.navigate(['/media']);
        } else {
          this.handleItemNotFound();
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.handleError(error);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Mark all form controls as touched to trigger validation
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Handle success message
   */
  handleSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Handle error message
   */
  handleError(error: any): void {
    console.error('Error in media form:', error);
    this.snackBar.open(error.message || 'An error occurred', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Handle media item not found
   */
  handleItemNotFound(): void {
    this.snackBar.open('Media item not found', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    this.router.navigate(['/media']);
  }

  /**
   * Cancel form and navigate back
   */
  onCancel(): void {
    this.router.navigate(['/media']);
  }
}
