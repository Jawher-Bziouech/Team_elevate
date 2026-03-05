import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = { username: '', email: '', password: '', role: 'TRAINEE' };
  termsAccepted = false;
  submitted = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSignup(form: NgForm) {
    this.submitted = true;
    if (form.invalid || !this.termsAccepted) return;

    this.authService.register(this.user).subscribe({
      next: () => {
        alert('Registration Successful! You can now login.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert('Registration Failed: ' + err.error)
    });
  }
}