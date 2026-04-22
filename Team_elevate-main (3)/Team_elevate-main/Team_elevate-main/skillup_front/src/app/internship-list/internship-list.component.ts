import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InternshipOffer, InternshipService, InternshipApplication } from '../services/internship.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-internship-list',
  templateUrl: './internship-list.component.html',
  styleUrls: ['./internship-list.component.css']
})
export class InternshipListComponent implements OnInit {
  internships: InternshipOffer[] = [];
  filteredInternships: InternshipOffer[] = [];
  myApplications: InternshipApplication[] = [];
  
  searchTerm = '';
  selectedLevel = '';
  selectedLocation = '';
  
  loading = false;
  errorMessage = '';

  // For filter dropdowns
  levels: string[] = [];
  locations: string[] = [];

  constructor(
    private internshipService: InternshipService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Fetch both internships and user applications if logged in as trainee
    const isTrainee = this.authService.isLoggedIn() && this.authService.hasRole('TRAINEE');

    if (isTrainee) {
      this.internshipService.getMyApplications().subscribe({
        next: (apps) => {
          this.myApplications = apps;
          this.loadInternships();
        },
        error: () => {
          this.loadInternships(); // Continue even if apps fail
        }
      });
    } else {
      this.loadInternships();
    }
  }

  loadInternships(): void {
    this.internshipService.getInternships().subscribe({
      next: (offers) => {
        // Fix for N/A company names if missing
        this.internships = offers.map(offer => ({
          ...offer,
          companyName: offer.companyName || 'SkillUp Partner'
        }));
        
        this.extractFilterValues();
        this.applyFilter();
        
        // Artificial delay for better UX demo of skeleton
        setTimeout(() => {
          this.loading = false;
        }, 800);
      },
      error: () => {
        this.errorMessage = 'Failed to load internships. Please try again later.';
        this.loading = false;
      }
    });
  }

  getApplicationStatus(internshipId: number): string | null {
    const app = this.myApplications.find(a => a.internshipOfferId === internshipId);
    return app ? app.status : null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACCEPTED':
      case 'ACCEPTED_BY_COMPANY':
        return 'status-applied accepted';
      case 'REJECTED':
        return 'status-applied rejected';
      default:
        return 'status-applied pending';
    }
  }

  extractFilterValues(): void {
    this.levels = [...new Set(this.internships.map(i => i.requiredStudyLevel))].filter(Boolean).sort();
    this.locations = [...new Set(this.internships.map(i => i.location))].filter(Boolean).sort();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredInternships = this.internships.filter((offer) => {
      const matchesSearch = !term || 
        offer.title?.toLowerCase().includes(term) || 
        offer.companyName?.toLowerCase().includes(term) ||
        offer.description?.toLowerCase().includes(term);
      
      const matchesLevel = !this.selectedLevel || offer.requiredStudyLevel === this.selectedLevel;
      const matchesLocation = !this.selectedLocation || offer.location === this.selectedLocation;

      return matchesSearch && matchesLevel && matchesLocation;
    });
  }

  openDetails(id: number): void {
    this.router.navigate(['/internships', id]);
  }

  applyForInternship(id: number): void {
    this.router.navigate(['/internships', id], { queryParams: { openApply: 'true' } });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedLevel = '';
    this.selectedLocation = '';
    this.applyFilter();
  }
}
