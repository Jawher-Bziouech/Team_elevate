import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = {
    username: '',
    email: '',
    password: ''
  };
  termsAccepted = false;  // ← AJOUTEZ POUR LE CHECKBOX

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSignup(): void {
    if (!this.termsAccepted) {
      alert('Veuillez accepter les conditions d\'utilisation');
      return;
    }
    
    console.log('Tentative d\'inscription:', this.user);
    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('Inscription réussie', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur inscription', err);
        alert('Erreur lors de l\'inscription');
      }
    });
  }
}