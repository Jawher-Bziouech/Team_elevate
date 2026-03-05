import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { ForumComponent } from './forum/forum.component';
import { QuizComponent } from './quiz/quiz.component';
import { CertificationsComponent } from './certifications/certifications.component';
import { GamificationComponent } from './gamification/gamification.component';
import { FormationsComponent } from './user/formations/formations.component';
import { FormationDetailComponent } from './user/formation-detail/formation-detail.component';
import { GestionFormationsComponent } from './admin/gestion-formations/gestion-formations.component';
import { GestionInscriptionsComponent } from './admin/gestion-inscriptions/gestion-inscriptions.component';
import { StatsComponent } from './admin/stats/stats.component';
import { TestPredictionsComponent } from './admin/test-predictions/test-predictions.component';
import { UserTicketsComponent } from './user-tickets/user-tickets.component';
import { AdminTicketsComponent } from './admin-tickets/admin-tickets.component';
import { FormationCoursesComponent } from './formation-courses/formation-courses.component';
import { BulkCourseFormComponent } from './bulk-course-form/bulk-course-form.component';
import { CreateTicketComponent } from './create-ticket-component/create-ticket.component';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { BadgeSimpleComponent } from './badge-simple/badge-simple.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { CourseListComponent } from './course-list/course-list.component';
import { JobOffersComponent } from './job-offers/job-offers.component';
import { PaymentListComponent } from './payments/payment-list/payment-list.component';
import { PaymentFormComponent } from './payments/payment-form-component/payment-form-component.component';
import { PaymentDetailComponent } from './payments/payment-detail/payment-detail.component';
import { EventListComponent } from './event/event-list/event-list.component';
import { EventDashboardComponent } from './event/event-dashboard/event-dashboard.component';
import { UserDashboardComponent } from './event/user-dashboard/user-dashboard.component';
import { EventFormComponent } from './event/event-form/event-form.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'certifications', component: CertificationsComponent },
  { path: 'gamification', component: GamificationComponent },
  { path: 'formations', component: FormationsComponent },
  { path: 'formation/:id', component: FormationDetailComponent },
  {
    path: 'back-office',
    component: BackOfficeComponent,
    children: [
      { path: 'formations', component: GestionFormationsComponent },
      { path: 'inscriptions', component: GestionInscriptionsComponent },
      { path: 'predictions', component: TestPredictionsComponent },
      { path: 'statistiques', component: StatsComponent },
      { path: '', redirectTo: 'formations', pathMatch: 'full' }
    ]
  },
  { path: 'my-tickets', component: UserTicketsComponent },
  { path: 'admin-tickets', component: AdminTicketsComponent },
  { path: 'courses/:formationId', component: FormationCoursesComponent },
  { path: 'bulk', component: BulkCourseFormComponent },
  { path: 'create-ticket', component: CreateTicketComponent },
  { path: 'analytics', component: AnalyticsDashboardComponent },
  { path: 'badge', component: BadgeSimpleComponent },
  { path: 'courses/edit/:id', component: CourseEditComponent },
  { path: 'courses', component: CourseListComponent },
  { path: 'job-offers', component: JobOffersComponent },
  { path: 'payments', component: PaymentListComponent },
{ path: 'payments/new', component: PaymentFormComponent },
{ path: 'payments/:id', component: PaymentDetailComponent },
{ path: 'events', component: EventListComponent },
{ path: 'events/new', component: EventFormComponent },
{ path: 'events/edit/:id', component: EventFormComponent },
{ path: 'events-dashboard', component: EventDashboardComponent },
{ path: 'user-dashboard', component: UserDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }