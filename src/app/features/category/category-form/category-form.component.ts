import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { MediaType, ItemDurationType } from '../../../core/models/media-item.model';

interface ColorOption {
  name: string;
  value: string;
}

interface IconOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEdit = false;
  categoryId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  
  // Enums for template usage
  MediaType = MediaType;
  ItemDurationType = ItemDurationType;
  
  // Color options
  colorOptions: ColorOption[] = [
    { name: 'Red', value: '#e53935' },
    { name: 'Pink', value: '#d81b60' },
    { name: 'Purple', value: '#8e24aa' },
    { name: 'Deep Purple', value: '#5e35b1' },
    { name: 'Indigo', value: '#3949ab' },
    { name: 'Blue', value: '#1e88e5' },
    { name: 'Light Blue', value: '#039be5' },
    { name: 'Cyan', value: '#00acc1' },
    { name: 'Teal', value: '#00897b' },
    { name: 'Green', value: '#43a047' },
    { name: 'Light Green', value: '#7cb342' },
    { name: 'Lime', value: '#c0ca33' },
    { name: 'Yellow', value: '#fdd835' },
    { name: 'Amber', value: '#ffb300' },
    { name: 'Orange', value: '#fb8c00' },
    { name: 'Deep Orange', value: '#f4511e' },
    { name: 'Brown', value: '#6d4c41' },
    { name: 'Grey', value: '#757575' },
    { name: 'Blue Grey', value: '#546e7a' }
  ];
  
  // Icon options
  iconOptions: IconOption[] = [
    { name: 'Movie', value: 'movie' },
    { name: 'TV', value: 'tv' },
    { name: 'Book', value: 'book' },
    { name: 'School', value: 'school' },
    { name: 'Videogame', value: 'videogame_asset' },
    { name: 'Music', value: 'music_note' },
    { name: 'Sports', value: 'sports' },
    { name: 'Art', value: 'palette' },
    { name: 'Food', value: 'restaurant' },
    { name: 'Travel', value: 'flight' },
    { name: 'Shopping', value: 'shopping_cart' },
    { name: 'Work', value: 'work' },
    { name: 'Event', value: 'event' },
    { name: 'Favorite', value: 'favorite' },
    { name: 'Star', value: 'star' },
    { name: 'Label', value: 'label' },
    { name: 'Category', value: 'category' },
    { name: 'List', value: 'list' },
    { name: 'Folder', value: 'folder' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkForEditMode();
  }

  /**
   * Initialize the form with default values
   */
  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: [MediaType.CUSTOM, Validators.required],
      durationType: [ItemDurationType.ONE_TIME, Validators.required],
      color: [this.colorOptions[0].value, Validators.required],
      icon: [this.iconOptions[0].value, Validators.required]
    });
  }

  /**
   * Check if we're in edit mode and load the category if needed
   */
  checkForEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.categoryId = id;
      this.isLoading = true;
      
      this.categoryService.getCategoryById(id).subscribe({
        next: (category) => {
          if (category) {
            this.populateForm(category);
          } else {
            this.handleCategoryNotFound();
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
   * Populate the form with category data
   */
  populateForm(category: Category): void {
    // Don't allow editing default categories
    if (category.isDefault) {
      this.snackBar.open('Default categories cannot be edited', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/categories']);
      return;
    }
    
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      type: category.type,
      durationType: category.durationType,
      color: category.color || this.colorOptions[0].value,
      icon: category.icon || this.iconOptions[0].value
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }
    
    this.isSubmitting = true;
    const formValue = this.categoryForm.value;
    
    if (this.isEdit && this.categoryId) {
      this.updateCategory(formValue);
    } else {
      this.createCategory(formValue);
    }
  }

  /**
   * Create a new category
   */
  createCategory(formValue: any): void {
    this.categoryService.createCategory(formValue).subscribe({
      next: (category) => {
        this.handleSuccess(`Category "${category.name}" created successfully!`);
        this.router.navigate(['/categories']);
      },
      error: (error) => {
        this.handleError(error);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Update an existing category
   */
  updateCategory(formValue: any): void {
    if (!this.categoryId) return;
    
    this.categoryService.updateCategory(this.categoryId, formValue).subscribe({
      next: (category) => {
        if (category) {
          this.handleSuccess(`Category "${category.name}" updated successfully!`);
          this.router.navigate(['/categories']);
        } else {
          this.handleCategoryNotFound();
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
    console.error('Error in category form:', error);
    this.snackBar.open(error.message || 'An error occurred', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Handle category not found
   */
  handleCategoryNotFound(): void {
    this.snackBar.open('Category not found', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    this.router.navigate(['/categories']);
  }

  /**
   * Cancel form and navigate back
   */
  onCancel(): void {
    this.router.navigate(['/categories']);
  }
}
