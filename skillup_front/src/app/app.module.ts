import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
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
import { CreateTicketComponent } from './create-ticket-component/create-ticket.component'; 
import { UserTicketsComponent } from './user-tickets/user-tickets.component';
import { AdminTicketsComponent } from './admin-tickets/admin-tickets.component';
import { BulkCourseFormComponent } from './bulk-course-form/bulk-course-form.component';
import { FormationCoursesComponent } from './formation-courses/formation-courses.component';

//import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';


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
    CreateTicketComponent,
    UserTicketsComponent,
    AdminTicketsComponent,
    BulkCourseFormComponent,
    FormationCoursesComponent,
    //TicketDetailComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }