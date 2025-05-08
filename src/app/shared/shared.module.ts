import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { HeaderComponent } from './components/header/header.component';
import { MediaCardComponent } from './components/media-card/media-card.component';
import { ProgressIndicatorComponent } from './components/progress-indicator/progress-indicator.component';

const materialModules = [
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatProgressBarModule,
  MatChipsModule,
  MatBadgeModule,
  MatMenuModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDividerModule
];

const components = [
  HeaderComponent,
  MediaCardComponent,
  ProgressIndicatorComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ...materialModules
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    ...materialModules,
    ...components
  ]
})
export class SharedModule { }
