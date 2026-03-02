// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { QRCodeModule } from 'angularx-qrcode';  // ✅ Changé de NgxQRCodeModule à QRCodeModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Composants
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { GestionFormationsComponent } from './admin/gestion-formations/gestion-formations.component';
import { FormationModalComponent } from './admin/gestion-formations/formation-modal/formation-modal.component'; // ✅ Ajouté
import { GestionInscriptionsComponent } from './admin/gestion-inscriptions/gestion-inscriptions.component';
import { StatsComponent } from './admin/stats/stats.component';
import { TestPredictionsComponent } from './admin/test-predictions/test-predictions.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { ForumComponent } from './forum/forum.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormationDetailComponent } from './user/formation-detail/formation-detail.component';
import { FormationsComponent } from './user/formations/formations.component';
import { InscriptionFormationComponent } from './user/inscription-formation/inscription-formation.component';
import { InscriptionsFormationComponent } from './admin/inscriptions-formation/inscriptions-formation.component';

// Composants standalone
import { FormationQrCodeComponent } from './formation-qrcode-modal/formation-qrcode-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    GestionFormationsComponent,
    FormationModalComponent,      // ✅ Ajouté
    GestionInscriptionsComponent,
    StatsComponent,
    TestPredictionsComponent,
    BackOfficeComponent,
    ForumComponent,
    LoginComponent,
    SignupComponent,
    FormationDetailComponent,
    FormationsComponent,
    InscriptionFormationComponent,
    InscriptionsFormationComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,           // ✅ Pour les pipes (date, currency, number, titlecase)
    FormsModule,            // ✅ Pour ngModel
    ReactiveFormsModule,    // ✅ Pour formGroup
    HttpClientModule,
    RouterModule,
    AppRoutingModule,       // ✅ Pour router-outlet
    NgbModule,
    NgChartsModule,         // ✅ Pour les graphiques
    QRCodeModule,           // ✅ Pour les QR codes (angularx-qrcode)
    FormationQrCodeComponent, // ✅ Composant standalone
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }