import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobOfferListComponent } from './job-offer-list/job-offer-list.component';
import { JobOfferFormComponent } from './job-offer-form/job-offer-form.component';

const routes: Routes = [
  { path: '', component: JobOfferListComponent },
  { path: 'new', component: JobOfferFormComponent },
  { path: 'edit/:id', component: JobOfferFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobOfferRoutingModule { }
