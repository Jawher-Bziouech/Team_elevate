import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormationService } from '../formation.service';
import { InscriptionService } from '../services/inscription.service';  

@Component({
  selector: 'app-back-office',
  templateUrl: './back-office.component.html',
  styleUrls: ['./back-office.component.css']
})
export class BackOfficeComponent implements OnInit {
  currentView: string = 'dashboard';
  allPosts: any[] = [];
  formationCount: number = 0;
  inscriptionCount: number = 0;  

  constructor(
    public authService: AuthService,
    public router: Router,
    private formationService: FormationService,
    private inscriptionService: InscriptionService  
  ) {}

  ngOnInit(): void {
    this.loadFormationCount();
    this.loadInscriptionCount();  
  }

  showView(view: string): void {
    this.currentView = view;
  }

  loadFormationCount(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formationCount = data.length;
      },
      error: (err) => console.error('Erreur chargement formations', err)
    });
  }

  // ✅ MÉTHODE À AJOUTER
  loadInscriptionCount(): void {
    this.inscriptionService.getAllInscriptions().subscribe({
      next: (data) => {
        this.inscriptionCount = data.length;
      },
      error: (err) => console.error('Erreur chargement inscriptions', err)
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}