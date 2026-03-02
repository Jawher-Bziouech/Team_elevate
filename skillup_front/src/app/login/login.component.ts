import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
  const role = this.authService.getRole();

  if (role === 'ADMIN') {
    this.router.navigate(['/back-office']);
  } else {
    this.router.navigate(['/home']);
  }
},
      error: (err) => alert('Login Failed: ' + err.error)
    });
  }
}