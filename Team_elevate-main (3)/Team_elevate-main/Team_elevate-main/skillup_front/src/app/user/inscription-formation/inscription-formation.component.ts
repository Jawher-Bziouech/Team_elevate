import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-inscription-formation',
  templateUrl: './inscription-formation.component.html'
})
export class InscriptionFormationComponent implements OnInit {
  @Input() formation: any;
  
  loading = false;
  success = false;
  errorMessage = '';
  isAuthenticated = false;
  currentUser: any = null;
  userEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    
    // ✅ Récupérer et corriger l'email
    this.userEmail = this.authService.getCompleteEmail();
    console.log('📧 Email utilisateur:', this.userEmail);
  }

  /**
   * Redirige vers la page de paiement pour cette formation
   * Le paiement créera ensuite l'inscription automatiquement
   */
  onSubmit(): void {
    if (!this.isAuthenticated) {
      this.errorMessage = 'Vous devez être connecté pour vous inscrire';
      return;
    }

    // ✅ Vérifier l'email avant redirection
    if (!this.userEmail || !this.userEmail.includes('@')) {
      console.error('❌ Email invalide:', this.userEmail);
      this.errorMessage = 'Email invalide. Veuillez vous reconnecter.';
      return;
    }

    console.log('� Redirection vers le paiement pour la formation:', this.formation?.titre);

    // Redirection vers la page de paiement avec l'ID de la formation
    this.router.navigate(['/formation-payment', this.formation.id]);
  }
}