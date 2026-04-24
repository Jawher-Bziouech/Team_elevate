import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Add the Guards here!
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { CompanyGuard } from './company.guard';

// Components
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { InternshipListComponent } from './internship-list/internship-list.component';
import { InternshipDetailComponent } from './internship-detail/internship-detail.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { CompanyDashboardComponent } from './company-dashboard/company-dashboard.component';
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

import { CreateTicketComponent } from './create-ticket-component/create-ticket.component';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { BadgeSimpleComponent } from './badge-simple/badge-simple.component';

import { JobOffersComponent } from './job-offers/job-offers.component';
import { PaymentListComponent } from './payments/payment-list/payment-list.component';
import { PaymentFormComponent } from './payments/payment-form-component/payment-form-component.component';
import { PaymentDetailComponent } from './payments/payment-detail/payment-detail.component';
import { EventListComponent } from './event/event-list/event-list.component';
import { EventDashboardComponent } from './event/event-dashboard/event-dashboard.component';
import { UserDashboardComponent } from './event/user-dashboard/user-dashboard.component';
import { EventFormComponent } from './event/event-form/event-form.component';
import { VerifyCertificatComponent } from './verify-certificat/verify-certificat.component';
import { AdminAvisComponent } from './admin/admin-avis/admin-avis.component';
import { CourseManagementComponent } from './admin/course-management/course-management.component';
import { TrainerCoursesComponent } from './user/trainer-courses/trainer-courses.component';
import { FormationPaymentComponent } from './user/formation-payment/formation-payment.component';
import { UserFormationPaymentsComponent } from './user/user-formation-payments/user-formation-payments.component';
import { GestionEntreprisesComponent } from './back-office/gestion-entreprises/gestion-entreprises.component';
import { EntreprisesComponent } from './entreprises/entreprises.component';
import { CheckoutComponent } from './checkout/checkout.component';

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
  { path: 'formation-payment/:formationId', component: FormationPaymentComponent, canActivate: [AuthGuard] }, // ✅ NEW: Payment route
  { path: 'my-tickets', component: UserTicketsComponent, canActivate: [AuthGuard] },
  { path: 'admin-tickets', component: AdminTicketsComponent, canActivate: [AuthGuard] },
 
  { path: 'create-ticket', component: CreateTicketComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsDashboardComponent, canActivate: [AuthGuard] },
  { path: 'badge', component: BadgeSimpleComponent, canActivate: [AuthGuard] },
  
  { path: 'entreprises', component: EntreprisesComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'job-offers', component: JobOffersComponent, canActivate: [AuthGuard] },
  { path: 'payments', component: PaymentListComponent, canActivate: [AuthGuard] },
  { path: 'payments/new', component: PaymentFormComponent, canActivate: [AuthGuard] },
  { path: 'payments/:id', component: PaymentDetailComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventListComponent, canActivate: [AuthGuard] },
  { path: 'events/new', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events/edit/:id', component: EventFormComponent, canActivate: [AuthGuard] },
  { path: 'events-dashboard', component: EventDashboardComponent, canActivate: [AuthGuard] },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'my-formation-payments', component: UserFormationPaymentsComponent, canActivate: [AuthGuard] },
  { path: 'trainer-courses', component: TrainerCoursesComponent, canActivate: [AuthGuard]},
  { path: 'internships', component: InternshipListComponent, canActivate: [AuthGuard] },
  { path: 'internships/:id', component: InternshipDetailComponent, canActivate: [AuthGuard] },
  { path: 'my-applications', component: MyApplicationsComponent, canActivate: [AuthGuard] },
  { path: 'company-dashboard', component: CompanyDashboardComponent, canActivate: [CompanyGuard] },

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
      {path: 'payments', component: PaymentListComponent },
      { path: 'avis', component: AdminAvisComponent },
      { path: 'courses', component: CourseManagementComponent },
      { path: 'entreprises', component: GestionEntreprisesComponent },
      { path: '', redirectTo: 'formations', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }