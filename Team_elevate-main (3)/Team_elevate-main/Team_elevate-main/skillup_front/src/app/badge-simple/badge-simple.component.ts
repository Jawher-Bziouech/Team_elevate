import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { BadgeService } from '../badge-service.service';


@Component({
  selector: 'app-badge-simple',
  templateUrl: './badge-simple.component.html',
  styleUrls: ['./badge-simple.component.css']
})
export class BadgeSimpleComponent implements OnInit {
  
  @Input() userId: number = 0;
  
  userBadges: string[] = [];
  allBadges: any[] = [];
  loading: boolean = false;
  message: string = '';

  constructor(
    private badgeService: BadgeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Récupérer l'ID si non fourni
    if (this.userId === 0) {
      const id = this.authService.getUserId();
      this.userId = id !== null ? id : 0;
    }
    
    if (this.userId > 0) {
      this.loadUserBadges();
      this.loadAllBadges();
    }
  }

  loadUserBadges() {
    this.badgeService.getUserBadges(this.userId).subscribe({
      next: (res) => {
        this.userBadges = res.badges;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message = 'Erreur de chargement';
      }
    });
  }

  loadAllBadges() {
    this.badgeService.getAllBadges().subscribe({
      next: (badges) => {
        this.allBadges = badges;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  addBadge(badgeName: string) {
    this.loading = true;
    this.badgeService.addBadge(this.userId, badgeName).subscribe({
      next: (res) => {
        this.userBadges = res.badges.split(',');
        this.message = 'Badge ajouté !';
        this.loading = false;
        setTimeout(() => this.message = '', 2000);
      },
      error: (err) => {
        this.message = 'Erreur';
        this.loading = false;
      }
    });
  }

  hasBadge(badgeName: string): boolean {
    return this.userBadges.includes(badgeName);
  }

  getBadgeIcon(badgeName: string): string {
    const badge = this.allBadges.find(b => b.name === badgeName);
    return badge ? badge.icon : '🏅';
  }
}