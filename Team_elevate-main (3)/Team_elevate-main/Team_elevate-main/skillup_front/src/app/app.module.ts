import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { QRCodeModule } from 'angularx-qrcode';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MetricsInterceptor } from './monitoring/metrics.interceptor';

// Composants
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { ForumComponent } from './forum/forum.component';
import { QuizComponent } from './quiz/quiz.component';
import { GestionForumComponent } from './back-office/gestion-forum/gestion-forum.component';
import { GestionQuizComponent } from './back-office/gestion-quiz/gestion-quiz.component';
import { CertificationsComponent } from './certifications/certifications.component';
import { GestionCertificatComponent } from './back-office/gestion-certificat/gestion-certificat.component';
import { GamificationComponent } from './gamification/gamification.component';
import { GestionFormationsComponent } from './admin/gestion-formations/gestion-formations.component';
import { FormationModalComponent } from './admin/gestion-formations/formation-modal/formation-modal.component';
import { GestionInscriptionsComponent } from './admin/gestion-inscriptions/gestion-inscriptions.component';
import { StatsComponent } from './admin/stats/stats.component';
import { TestPredictionsComponent } from './admin/test-predictions/test-predictions.component';
import { InscriptionsFormationComponent } from './admin/inscriptions-formation/inscriptions-formation.component';
import { FormationsComponent } from './user/formations/formations.component';
import { FormationDetailComponent } from './user/formation-detail/formation-detail.component';
import { InscriptionFormationComponent } from './user/inscription-formation/inscription-formation.component';
import { UserTicketsComponent } from './user-tickets/user-tickets.component';
import { AdminTicketsComponent } from './admin-tickets/admin-tickets.component';

import { CreateTicketComponent } from './create-ticket-component/create-ticket.component';
import { FileSizePipe } from './pipes/filesize.pipe';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { BadgeSimpleComponent } from './badge-simple/badge-simple.component';

import { AuthInterceptor } from './auth.interceptor';
import { JobOffersComponent } from './job-offers/job-offers.component';
import { ApplicationModalComponent } from './job-offers/application-modal/application-modal.component';
import { GestionApplicationsComponent } from './back-office/gestion-applications/gestion-applications.component';
import { SalaryPipe } from './pipes/salary.pipe';
import { JobOfferModule } from './back-office/features/job-offer/job-offer.module';
import { PaymentListComponent } from './payments/payment-list/payment-list.component';
import { PaymentFormComponent } from './payments/payment-form-component/payment-form-component.component';
import { PaymentDetailComponent } from './payments/payment-detail/payment-detail.component';
import { EventListComponent } from './event/event-list/event-list.component';
import { EventDashboardComponent } from './event/event-dashboard/event-dashboard.component';
import { EventCalendarComponent } from './event/event-calendar/event-calendar.component';
import { UserDashboardComponent } from './event/user-dashboard/user-dashboard.component';
import { EventFormComponent } from './event/event-form/event-form.component';
import { VerifyCertificatComponent } from './verify-certificat/verify-certificat.component';
import { ChatbotService } from './chatbot.service';
// Composants standalone (à importer, pas à déclarer)
import { FormationQrCodeComponent } from './formation-qrcode-modal/formation-qrcode-modal.component';
import { AvisFormationComponent } from './avis-formation/avis-formation.component';
import { AdminAvisComponent } from './admin/admin-avis/admin-avis.component';
import { CourseManagementComponent } from './admin/course-management/course-management.component';
import { TrainerCoursesComponent } from './user/trainer-courses/trainer-courses.component';

import { CourseAdvancedFeaturesComponent } from './course-advanced-features/course-advanced-features.component';
import { UserFormationPaymentsComponent } from './user/user-formation-payments/user-formation-payments.component';
import { GestionEntreprisesComponent } from './back-office/gestion-entreprises/gestion-entreprises.component';
import { EntreprisesComponent } from './entreprises/entreprises.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { InternshipService } from './services/internship.service';
import { InternshipListComponent } from './internship-list/internship-list.component';
import { InternshipDetailComponent } from './internship-detail/internship-detail.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { CompanyDashboardComponent } from './company-dashboard/company-dashboard.component';
import { FloatingChatWidgetComponent } from './floating-chat-widget/floating-chat-widget.component';
import { InternshipAdminComponent } from './admin/gestion-internships/internship-admin.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    SidebarComponent,
    HeaderComponent,
    HomeComponent,
    BackOfficeComponent,
    ForumComponent,
    QuizComponent,
    GestionForumComponent,
    GestionQuizComponent,
    CertificationsComponent,
    GestionCertificatComponent,
    GamificationComponent,
    GestionFormationsComponent,
    FormationModalComponent,
    GestionInscriptionsComponent,
    StatsComponent,
    TestPredictionsComponent,
    InscriptionsFormationComponent,
    FormationsComponent,
    InscriptionFormationComponent,
    UserTicketsComponent,
    AdminTicketsComponent,
   
    CreateTicketComponent,
    FileSizePipe,
    AnalyticsDashboardComponent,
    BadgeSimpleComponent,
    
    JobOffersComponent,
    ApplicationModalComponent,
    GestionApplicationsComponent,
    SalaryPipe,
    PaymentListComponent,
    PaymentFormComponent,
    EventListComponent,
    EventDashboardComponent,
    UserDashboardComponent,
    VerifyCertificatComponent,
    FormationDetailComponent,
    CourseManagementComponent,
    TrainerCoursesComponent,

    CourseAdvancedFeaturesComponent,
    GestionEntreprisesComponent,
    EntreprisesComponent,
    CheckoutComponent,
    InternshipListComponent,
    InternshipDetailComponent,
    MyApplicationsComponent,
    CompanyDashboardComponent,
    FloatingChatWidgetComponent,
    InternshipAdminComponent,
    // ⚠️ Retire les composants standalone de declarations
    // AdminAvisComponent,  // ← À retirer de declarations
    // AvisFormationComponent,  // ← À retirer de declarations
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgChartsModule,
    BrowserAnimationsModule,
    JobOfferModule,
    EventCalendarComponent,
    EventFormComponent,
    PaymentDetailComponent,
    QRCodeModule,
    FormationQrCodeComponent,
    AvisFormationComponent,
    AdminAvisComponent,
    UserFormationPaymentsComponent
  ],
  providers: [
    ChatbotService,
    InternshipService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MetricsInterceptor, multi: true }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }