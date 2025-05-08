import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { MediaListComponent } from './media-list.component';
import { SharedModule } from '../../shared/shared.module';
import { MediaFormModule } from '../media-form/media-form.module';

const routes: Routes = [
  { path: '', component: MediaListComponent },
  { path: 'add', loadChildren: () => import('../media-form/media-form.module').then(m => m.MediaFormModule) },
  { path: 'edit/:id', loadChildren: () => import('../media-form/media-form.module').then(m => m.MediaFormModule) }
];

@NgModule({
  declarations: [
    MediaListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    MediaFormModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule
  ]
})
export class MediaListModule { }
