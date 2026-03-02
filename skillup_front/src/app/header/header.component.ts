import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { InscriptionService } from '../services/inscription.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  showMenu = false;
  inscriptionCount = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private inscriptionService: InscriptionService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loadInscriptionCount();
    }
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadInscriptionCount(): void {
    this.inscriptionService.getAllInscriptions().subscribe({
      next: (data) => {
        this.inscriptionCount = data.length;
      },
      error: (err) => console.error('Erreur chargement inscriptions', err)
    });
  }
}