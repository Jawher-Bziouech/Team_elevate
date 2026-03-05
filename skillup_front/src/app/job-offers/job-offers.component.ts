import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../back-office/features/job-offer/job-offer.service';
import { JobOffer } from '../models/job-offer.model';

@Component({
  selector: 'app-job-offers',
  templateUrl: './job-offers.component.html',
  styleUrl: './job-offers.component.css'
})
export class JobOffersComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  loading: boolean = true;
  filteredOffers: JobOffer[] = [];
  displayedOffers: JobOffer[] = [];
  private latestIds: number[] = [];

  // Application modal
  applyingForOffer: JobOffer | null = null;

  // Filters
  searchTerm: string = '';
  selectedIndustry: string = 'all';
  selectedLocation: string = 'all';
  industries: string[] = [];
  locations: string[] = [];

  // Pagination
  pageSize = 10;
  currentPage = 0; // zero-based
  pageSizeOptions = [5, 10, 20];

  // Sorting
  sortBy: string = 'newest';
  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'salary_desc', label: 'Salary: High → Low' },
    { value: 'salary_asc', label: 'Salary: Low → High' },
    { value: 'company_asc', label: 'Company A → Z' },
    { value: 'company_desc', label: 'Company Z → A' }
  ];

  constructor(private jobOfferService: JobOfferService) { }

  ngOnInit(): void {
    this.loadJobOffers();
  }

  loadJobOffers(): void {
    this.jobOfferService.getAll().subscribe({
      next: (offers) => {
        this.jobOffers = offers || [];
        this.extractLatestIds();
        this.extractFilters();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading job offers:', err);
        this.loading = false;
      }
    });
  }

  extractFilters(): void {
    const industriesSet = new Set(this.jobOffers.map(offer => offer.industry || 'Unknown'));
    this.industries = Array.from(industriesSet).filter(Boolean).sort();

    const locationsSet = new Set(this.jobOffers.map(offer => offer.location || 'Unknown'));
    this.locations = Array.from(locationsSet).filter(Boolean).sort();
  }

  applyFilters(resetPage = true): void {
    let filtered = this.jobOffers.slice();

    // Search filter
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(offer =>
        (offer.jobTitle || '').toLowerCase().includes(q) ||
        (offer.firm?.nom || '').toLowerCase().includes(q)
      );
    }

    // Industry filter
    if (this.selectedIndustry !== 'all') {
      filtered = filtered.filter(offer => offer.industry === this.selectedIndustry);
    }

    // Location filter
    if (this.selectedLocation !== 'all') {
      filtered = filtered.filter(offer => offer.location === this.selectedLocation);
    }

    // Sorting
    filtered = this.applySorting(filtered);

    this.filteredOffers = filtered;

    if (resetPage) {
      this.currentPage = 0;
    }
    this.updateDisplayedOffers();
  }

  applySorting(list: JobOffer[]): JobOffer[] {
    const sorted = list.slice();
    switch (this.sortBy) {
      case 'newest':
        // newest by opportunityId desc
        sorted.sort((a, b) => (b.opportunityId || 0) - (a.opportunityId || 0));
        break;
      case 'salary_desc':
        sorted.sort((a, b) => this.getSalaryMiddle(b.salaryRange) - this.getSalaryMiddle(a.salaryRange));
        break;
      case 'salary_asc':
        sorted.sort((a, b) => this.getSalaryMiddle(a.salaryRange) - this.getSalaryMiddle(b.salaryRange));
        break;
      case 'company_asc':
        sorted.sort((a, b) => (a.firm?.nom || '').localeCompare(b.firm?.nom || ''));
        break;
      case 'company_desc':
        sorted.sort((a, b) => (b.firm?.nom || '').localeCompare(a.firm?.nom || ''));
        break;
      default:
        break;
    }
    return sorted;
  }

  getSalaryMiddle(range?: string): number {
    if (!range) return 0;
    const cleaned = range.replace(/\s+/g, '');
    const parts = cleaned.split('-');
    if (parts.length !== 2) return 0;
    const a = Number(parts[0]) || 0;
    const b = Number(parts[1]) || 0;
    return (a + b) / 2;
  }

  updateDisplayedOffers(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOffers = this.filteredOffers.slice(start, end);
  }

  // Pagination handlers
  onPageChange(newPageIndex: number): void {
    this.currentPage = newPageIndex;
    this.updateDisplayedOffers();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 0;
    this.updateDisplayedOffers();
  }

  // UI hooks
  onSearchChange(): void { this.applyFilters(); }
  onIndustryChange(): void { this.applyFilters(); }
  onLocationChange(): void { this.applyFilters(); }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedIndustry = 'all';
    this.selectedLocation = 'all';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  /** trackBy function pour relancer l'animation fade-in à chaque changement de liste */
  trackByOfferId(index: number, offer: JobOffer): number {
    return offer.opportunityId ?? index;
  }

  /** Détermine les 3 IDs les plus récents */
  private extractLatestIds(): void {
    const allIds = this.jobOffers
      .map(o => o.opportunityId)
      .filter((id): id is number => id != null)
      .sort((a, b) => b - a);

    this.latestIds = allIds.slice(0, 3);
  }

  /** Vérifie si une offre est considérée comme "Nouvelle" */
  isNew(offer: JobOffer): boolean {
    return !!offer.opportunityId && this.latestIds.includes(offer.opportunityId);
  }

  // Application Modal
  openApplyModal(offer: JobOffer): void {
    this.applyingForOffer = offer;
    document.body.style.overflow = 'hidden';
  }

  closeApplyModal(): void {
    this.applyingForOffer = null;
    document.body.style.overflow = '';
  }

  onApplicationSubmitted(): void {
    this.closeApplyModal();
  }

  getIndustryIcon(industry: string): string {
    const iconMap: { [key: string]: string } = {
      'Technology': '💻',
      'IT': '🖥️',
      'Finance': '💰',
      'Healthcare': '🏥',
      'Education': '🎓',
      'Engineering': '⚙️',
      'Marketing': '📱',
      'Sales': '📈',
      'Design': '🎨',
      'Manufacturing': '🏭',
      'Retail': '🛍️',
      'Hospitality': '🏨',
      'Transportation': '🚚',
      'Energy': '⚡',
      'Construction': '🏗️',
      'Legal': '⚖️',
      'Real Estate': '🏢',
      'Agriculture': '🌾',
      'Media': '📺',
      'Telecommunications': '📡'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())) {
        return icon;
      }
    }
    return '💼';
  }

  getCompanyInitials(companyName: string | undefined): string {
    if (!companyName) return '🏢';
    const words = companyName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return companyName.substring(0, 2).toUpperCase();
  }

  getIndustryColor(industry: string | undefined): { bg: string; text: string; border: string } {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      'Technology': { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
      'IT': { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
      'Finance': { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      'Healthcare': { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
      'Education': { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      'Engineering': { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
      'Marketing': { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' },
      'Sales': { bg: '#bbf7d0', text: '#166534', border: '#86efac' },
      'Design': { bg: '#fbcfe8', text: '#9d174d', border: '#f9a8d4' },
      'Manufacturing': { bg: '#e5e7eb', text: '#374151', border: '#d1d5db' },
      'Retail': { bg: '#fef08a', text: '#854d0e', border: '#fde047' },
      'Hospitality': { bg: '#cffafe', text: '#155e75', border: '#a5f3fc' },
      'Transportation': { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
      'Energy': { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },
      'Construction': { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
      'Legal': { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
      'Real Estate': { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
      'Agriculture': { bg: '#ecfccb', text: '#3f6212', border: '#d9f99d' },
      'Media': { bg: '#fae8ff', text: '#86198f', border: '#f5d0fe' },
      'Telecommunications': { bg: '#cffafe', text: '#155e75', border: '#a5f3fc' }
    };

    if (!industry) return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

    for (const [key, colors] of Object.entries(colorMap)) {
      if (industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())) {
        return colors;
      }
    }
    return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  }
}
