import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ForumService } from '../forum.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-office',
  templateUrl: './back-office.component.html',
  styleUrls: ['./back-office.component.css']
})
export class BackOfficeComponent implements OnInit {
  currentView = 'dashboard';
  allPosts: any[] = []; // Still kept for dashboard stats

  constructor(
    public authService: AuthService, 
    private forumService: ForumService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load posts once for the dashboard statistics
    this.forumService.getAllPosts().subscribe(data => {
      this.allPosts = data;
    });
  }

  showView(view: string) {
    this.currentView = view;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}