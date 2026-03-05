import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material modules
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { JobOfferRoutingModule } from './job-offer-routing.module';
import { JobOfferListComponent } from './job-offer-list/job-offer-list.component';
import { JobOfferFormComponent } from './job-offer-form/job-offer-form.component';

@NgModule({
  declarations: [
    JobOfferListComponent,
    JobOfferFormComponent
  ],
  exports: [
    JobOfferListComponent,
    JobOfferFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    JobOfferRoutingModule,
    MatSliderModule,
    MatPaginatorModule,
    MatSortModule
  ]
})
export class JobOfferModule { }
