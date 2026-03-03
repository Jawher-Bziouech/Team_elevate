import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
user = { username: '', email: '', password: '', role: 'TRAINEE' };
  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    this.authService.register(this.user).subscribe({
      next: (res) => {
        alert('Registration Successful! You can now login.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert('Registration Failed: ' + err.error)
    });
  }
}