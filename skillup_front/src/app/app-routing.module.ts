import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { ForumComponent } from './forum/forum.component';
import { QuizComponent } from './quiz/quiz.component';
import { FormationsComponent } from './user/formations/formations.component';
import { FormationDetailComponent } from './user/formation-detail/formation-detail.component';
import { TestPredictionsComponent } from './admin/test-predictions/test-predictions.component';

// Composants admin (à importer)
import { GestionFormationsComponent } from './admin/gestion-formations/gestion-formations.component';
import { GestionInscriptionsComponent } from './admin/gestion-inscriptions/gestion-inscriptions.component';
import { StatsComponent } from './admin/stats/stats.component';

const routes: Routes = [
  // Routes publiques (sans sidebar)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'formations', component: FormationsComponent },
  { path: 'formation/:id', component: FormationDetailComponent },
  { path: 'home', component: HomeComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'quiz', component: QuizComponent },
  
  // ✅ Routes admin AVEC sidebar (BackOfficeComponent comme parent)
  {
    path: 'admin',
    component: BackOfficeComponent,
    children: [
      { path: 'formations', component: GestionFormationsComponent },
      { path: 'inscriptions', component: GestionInscriptionsComponent },
      { path: 'predictions', component: TestPredictionsComponent },
      { path: 'statistiques', component: StatsComponent },
      { path: '', redirectTo: 'formations', pathMatch: 'full' }
    ]
  },
  
  // Route standalone (sans sidebar) si besoin
  { path: 'predictions', component: TestPredictionsComponent },
  
  // Redirection
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }