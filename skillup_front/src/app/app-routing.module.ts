import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { ForumComponent } from './forum/forum.component';
import { QuizComponent } from './quiz/quiz.component';
//import { CreateTicketComponent } from './create-ticket-component/create-ticket.component'; 
import { UserTicketsComponent } from './user-tickets/user-tickets.component'; 
import { AdminTicketsComponent } from './admin-tickets/admin-tickets.component'; 
import { FormationCoursesComponent } from './formation-courses/formation-courses.component';
import { BulkCourseFormComponent } from './bulk-course-form/bulk-course-form.component';
import { CreateTicketComponent } from './create-ticket-component/create-ticket.component';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { BadgeSimpleComponent } from './badge-simple/badge-simple.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { CourseListComponent } from './course-list/course-list.component';




const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'back-office', component: BackOfficeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' } ,
  
  
  { path: 'my-tickets', component: UserTicketsComponent },
  { path: 'admin-tickets', component: AdminTicketsComponent },
  { path: 'courses/:formationId', component: FormationCoursesComponent},
  { path: 'bulk', component: BulkCourseFormComponent },
  { path: 'create-ticket', component: CreateTicketComponent },
  { path: 'analytics', component: AnalyticsDashboardComponent },
   { path: 'badge', component: BadgeSimpleComponent },
   { path: 'courses/edit/:id', component: CourseEditComponent },
   { path: 'courses', component: CourseListComponent },
   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }