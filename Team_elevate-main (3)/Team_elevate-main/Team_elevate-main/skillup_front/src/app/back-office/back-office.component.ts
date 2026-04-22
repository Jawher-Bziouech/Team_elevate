import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ForumService } from '../forum.service';
import { JobOfferService } from './features/job-offer/job-offer.service';
import { IndustryCount } from '../models/job-offer.model';
import { Post } from '../models/forum.model';

import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-back-office',
  templateUrl: './back-office.component.html',
  styleUrls: ['./back-office.component.css']
})
export class BackOfficeComponent implements OnInit {
  currentView = 'dashboard';
  allPosts: Post[] = [];
  editId: number | null = null;
  industryStats: IndustryCount[] = [];
  selectedPaymentId = 0;

  constructor(
    public authService: AuthService,
    private forumService: ForumService,
    private router: Router,
    private jobOfferService: JobOfferService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Load forum posts for dashboard stats
    this.forumService.getAllPosts().subscribe(data => {
      this.allPosts = data;
    });

    // Load job offer industry statistics
    this.loadIndustryStats();
    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        this.currentView = params['view'];
      }
      this.selectedPaymentId = params['id'] ? +params['id'] : 0;
    });

    // RESTORE ORIGINAL NAVIGATION LOGIC:
    // When navigating to Formation sub-routes, clear currentView so router-outlet takes over
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        if (url.includes('/back-office/formations') || url.includes('/back-office/inscriptions') ||
          url.includes('/back-office/statistiques') || url.includes('/back-office/predictions')) {
          this.currentView = '';
        }
      }
    });

    // Also check on initial load
    const currentUrl = this.router.url;
    if (currentUrl.includes('/back-office/formations') || currentUrl.includes('/back-office/inscriptions') ||
      currentUrl.includes('/back-office/statistiques') || currentUrl.includes('/back-office/predictions')) {
      this.currentView = '';
    }
  }

  loadIndustryStats(): void {
    this.jobOfferService.getJobCountByIndustry().subscribe({
      next: (data) => this.industryStats = data,
      error: (err) => console.error('Failed to load industry stats', err)
    });
  }

  getTotalCount(): number {
    return this.industryStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
  }

  getPercentage(count: number): number {
    const total = this.getTotalCount();
    return total > 0 ? (count / total) * 100 : 0;
  }

  getIndustryIcon(industry: string): string {
    const iconMap: { [key: string]: string } = {
      'Technology': '💻', 'IT': '🖥️', 'Finance': '💰', 'Healthcare': '🏥',
      'Education': '🎓', 'Engineering': '⚙️', 'Marketing': '📱', 'Sales': '📈',
      'Design': '🎨', 'Manufacturing': '🏭', 'Retail': '🛍️', 'Hospitality': '🏨',
      'Transportation': '🚚', 'Energy': '⚡', 'Construction': '🏗️', 'Legal': '⚖️',
      'Real Estate': '🏢', 'Agriculture': '🌾', 'Media': '📺', 'Telecommunications': '📡'
    };
    for (const [key, icon] of Object.entries(iconMap)) {
      if (industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())) {
        return icon;
      }
    }
    return '💼';
  }

  getIndustryColor(index: number): string {
    const colors = ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];
    return colors[index % colors.length];
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