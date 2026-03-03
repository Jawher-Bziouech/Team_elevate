import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'skillup-front';
  constructor(private router: Router) {}

  // This function returns TRUE if we are on Login or Signup pages
  isAuthPage(): boolean {
    const url = this.router.url;
    // Hide ONLY on these two pages
    return url.includes('/login') || url.includes('/signup');
    
  }
 isAdminPage(): boolean {
  // .startsWith is safer than .includes
  return this.router.url.split('?')[0].startsWith('/back-office');
}
}