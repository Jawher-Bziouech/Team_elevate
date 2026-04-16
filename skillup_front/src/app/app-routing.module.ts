import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Add the Guards here!
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

// Components
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
import { EntreprisesComponent } from './entreprises/entreprises.component';


import { VerifyCertificatComponent } from './verify-certificat/verify-certificat.component';

const routes: Routes = [
  // 🔓 PUBLIC ROUTES (No guards needed)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'verify', component: VerifyCertificatComponent }, // Public verification page

  // 🔒 PROTECTED GENERAL ROUTES (Must be logged in)
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'forum', component: ForumComponent, canActivate: [AuthGuard] },
  { path: 'quiz', component: QuizComponent, canActivate: [AuthGuard] },
  { path: 'certifications', component: CertificationsComponent, canActivate: [AuthGuard] },
  { path: 'gamification', component: GamificationComponent, canActivate: [AuthGuard] },
  { path: 'formations', component: FormationsComponent, canActivate: [AuthGuard] },
  { path: 'formation/:id', component: FormationDetailComponent, canActivate: [AuthGuard] },
  { path: 'my-tickets', component: UserTicketsComponent, canActivate: [AuthGuard] },
  { path: 'admin-tickets', component: AdminTicketsComponent, canActivate: [AuthGuard] },
  { path: 'courses/:formationId', component: FormationCoursesComponent, canActivate: [AuthGuard] },
  { path: 'bulk', component: BulkCourseFormComponent, canActivate: [AuthGuard] },
  { path: 'create-ticket', component: CreateTicketComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'badge', component: BadgeSimpleComponent, canActivate: [AuthGuard] },
  { path: 'courses/edit/:id', component: CourseEditComponent, canActivate: [AuthGuard] },
  { path: 'courses', component: CourseListComponent, canActivate: [AuthGuard] },
  { path: 'job-offers', component: JobOffersComponent, canActivate: [AuthGuard] },
  { path: 'payments', component: PaymentListComponent, canActivate: [AuthGuard] },
  { path: 'payments/new', component: PaymentFormComponent, canActivate: [AuthGuard] },
  { path: 'payments/:id', component: PaymentDetailComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'events/new', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events-dashboard', component: EventDashboardComponent, canActivate: [AuthGuard] },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },

  // 👑 PROTECTED ADMIN ROUTES (Must be Admin)
  {
    path: 'back-office',
    component: BackOfficeComponent,
    canActivate: [AdminGuard], // Only Admins allowed past this point!
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
{ path: 'entreprises', component: EntreprisesComponent },
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
