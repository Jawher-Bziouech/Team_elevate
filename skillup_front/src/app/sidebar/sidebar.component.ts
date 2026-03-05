import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onLogout() {
    this.authService.logout(); // Clears the token
    alert('You have been logged out.');
    this.router.navigate(['/login']); // Send back to start
  }
}