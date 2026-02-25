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
  allPosts: any[] = [];
  editId: number | null = null; // stores ID of job offer to edit

  constructor(
    public authService: AuthService,
    private forumService: ForumService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forumService.getAllPosts().subscribe(data => {
      this.allPosts = data;
    });
  }

  showView(view: string) {
    this.currentView = view;
  }

  showForm() {
    this.currentView = 'jobOffersForm';
    this.editId = null;
  }

  editOffer(id: number) {
    this.currentView = 'jobOffersForm';
    this.editId = id;
  }

  showList() {
    this.currentView = 'jobOffers';
    this.editId = null;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
