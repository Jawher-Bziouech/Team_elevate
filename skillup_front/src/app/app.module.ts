import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { QRCodeModule } from 'angularx-qrcode';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { FormationQrCodeComponent } from './formation-qrcode-modal/formation-qrcode-modal.component';
import { UserTicketsComponent } from './user-tickets/user-tickets.component';
import { AdminTicketsComponent } from './admin-tickets/admin-tickets.component';
import { BulkCourseFormComponent } from './bulk-course-form/bulk-course-form.component';
import { FormationCoursesComponent } from './formation-courses/formation-courses.component';
import { CreateTicketComponent } from './create-ticket-component/create-ticket.component';
import { FileSizePipe } from './pipes/filesize.pipe';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { ChatbotService } from './chatbot.service';
import { BadgeSimpleComponent } from './badge-simple/badge-simple.component';
import { CourseListComponent } from './course-list/course-list.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    GestionFormationsComponent,
FormationModalComponent,
GestionInscriptionsComponent,
StatsComponent,
TestPredictionsComponent,
InscriptionsFormationComponent,
FormationsComponent,
FormationDetailComponent,
InscriptionFormationComponent,
    GamificationComponent,
    UserTicketsComponent,
    AdminTicketsComponent,
    BulkCourseFormComponent,
    FormationCoursesComponent,
    CreateTicketComponent,
    FileSizePipe,
    AnalyticsDashboardComponent,
    BadgeSimpleComponent,
    CourseListComponent,
    CourseEditComponent,
    JobOffersComponent,
    ApplicationModalComponent,
    GestionApplicationsComponent,
    SalaryPipe,
    PaymentListComponent,
PaymentFormComponent,
PaymentDetailComponent,
EventListComponent,
EventDashboardComponent,
UserDashboardComponent,


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
    QRCodeModule,
    FormationQrCodeComponent,
    BrowserAnimationsModule,
    JobOfferModule,
    EventCalendarComponent,
    EventFormComponent,



    
  ],
providers: [
    ChatbotService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }