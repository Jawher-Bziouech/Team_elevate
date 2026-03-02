import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-back-office',
  templateUrl: './back-office.component.html',
  styleUrls: ['./back-office.component.css']
})
export class BackOfficeComponent implements OnInit {
  currentView: string = 'dashboard';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Mettre à jour currentView quand la route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        if (url.includes('formations')) this.currentView = 'formations';
        else if (url.includes('inscriptions')) this.currentView = 'inscriptions';
        else if (url.includes('statistiques')) this.currentView = 'statistiques';
        else if (url.includes('predictions')) this.currentView = 'predictions';
        else if (url.includes('forum')) this.currentView = 'forum';
        else if (url.includes('quiz')) this.currentView = 'quiz';
        else this.currentView = 'dashboard';
      }
    });
  }

  ngOnInit(): void {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}