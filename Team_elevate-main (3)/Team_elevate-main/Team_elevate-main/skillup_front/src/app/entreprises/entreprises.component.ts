import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntrepriseService } from '../entreprise.service';
import { AuthService } from '../auth.service';
import { Entreprise } from '../models/entreprise.model';
import { JobOfferService } from '../back-office/features/job-offer/job-offer.service';

const PLANS = [
  {
    key: 'FREE',
    label: 'Free',
    price: 0,
    priceLabel: '0 DT',
    period: '',
    benefits: ['Browse all companies', 'See company description & location', 'View open job positions'],
    locked: ['Company email address', 'Company phone number']
  },
  {
    key: 'BASIC',
    label: 'Basic',
    price: 9.99,
    priceLabel: '9.99 DT',
    period: '/month',
    benefits: ['Everything in Free', 'See company email address'],
    locked: ['Company phone number']
  },
  {
    key: 'PRO',
    label: 'Pro',
    price: 19.99,
    priceLabel: '19.99 DT',
    period: '/month',
    benefits: ['Everything in Basic', 'See company phone number', 'Full contact info revealed']
  }
];

@Component({
  selector: 'app-entreprises',
  templateUrl: './entreprises.component.html',
  styleUrls: ['./entreprises.component.css']
})
export class EntreprisesComponent implements OnInit {
  entreprises: Entreprise[] = [];
  filteredEntreprises: Entreprise[] = [];
  displayedEntreprises: Entreprise[] = [];
  loading = true;
  loadError = false;

  searchTerm = '';
  selectedSecteur = 'all';
  selectedTaille = 'all';
  sortBy = 'newest';
  secteurs: string[] = [];

  pageSize = 9;
  currentPage = 0;
  pageSizeOptions = [6, 9, 18];

  selectedEntreprise: Entreprise | null = null;
  private entrepriseIdsWithOffers = new Set<number>();

  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'name_asc', label: 'Name A → Z' },
    { value: 'name_desc', label: 'Name Z → A' }
  ];

  Math = Math;

  // Upgrade plan modal (plan selection only)
  plans = PLANS;
  showUpgradeModal = false;
  selectedUpgradePlan: string | null = null;

  constructor(
    private entrepriseService: EntrepriseService,
    private authService: AuthService,
    private router: Router,
    private jobOfferService: JobOfferService
  ) { }

  get isLoggedIn(): boolean { return this.authService.isLoggedIn(); }
  get currentPlan(): string { return this.authService.getPlan(); }
  get isPro(): boolean { return this.authService.isPro(); }

  ngOnInit(): void {
    this.loadEntreprises();
    this.loadCompanyNamesWithOffers();
  }

  loadEntreprises(): void {
    this.loadError = false;
    const role = this.authService.getRole() || 'TRAINEE';
    const plan = this.authService.getPlan();
    this.entrepriseService.getApprovedForRole(role, plan).subscribe({
      next: (data) => {
        this.entreprises = data || [];
        this.extractFilters();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load companies:', err);
        this.loadError = true;
        this.loading = false;
      }
    });
  }

  extractFilters(): void {
    const secteursSet = new Set(this.entreprises.map(e => e.secteur || 'Other'));
    this.secteurs = Array.from(secteursSet).filter(Boolean).sort();
  }

  applyFilters(resetPage = true): void {
    let filtered = this.entreprises.slice();
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.nom || '').toLowerCase().includes(q) ||
        (e.secteur || '').toLowerCase().includes(q) ||
        (e.adresse || '').toLowerCase().includes(q)
      );
    }
    if (this.selectedSecteur !== 'all') filtered = filtered.filter(e => e.secteur === this.selectedSecteur);
    if (this.selectedTaille !== 'all') filtered = filtered.filter(e => e.taille === this.selectedTaille);
    filtered = this.applySorting(filtered);
    this.filteredEntreprises = filtered;
    if (resetPage) this.currentPage = 0;
    this.updateDisplayed();
  }

  applySorting(list: Entreprise[]): Entreprise[] {
    const sorted = list.slice();
    switch (this.sortBy) {
      case 'newest': sorted.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
      case 'name_asc': sorted.sort((a, b) => (a.nom || '').localeCompare(b.nom || '')); break;
      case 'name_desc': sorted.sort((a, b) => (b.nom || '').localeCompare(a.nom || '')); break;
    }
    return sorted;
  }

  updateDisplayed(): void {
    const start = this.currentPage * this.pageSize;
    this.displayedEntreprises = this.filteredEntreprises.slice(start, start + this.pageSize);
  }

  onPageChange(p: number): void { this.currentPage = p; this.updateDisplayed(); }
  onPageSizeChange(s: number): void { this.pageSize = Number(s); this.currentPage = 0; this.updateDisplayed(); }
  onSearchChange(): void { this.applyFilters(); }
  onSecteurChange(): void { this.applyFilters(); }
  onTailleChange(): void { this.applyFilters(); }

  clearAllFilters(): void {
    this.searchTerm = ''; this.selectedSecteur = 'all'; this.selectedTaille = 'all'; this.sortBy = 'newest';
    this.applyFilters();
  }

  openDetail(e: Entreprise): void {
    this.selectedEntreprise = e;
    document.body.style.overflow = 'hidden';

    const role = this.authService.getRole() || 'TRAINEE';
    const plan = this.authService.getPlan();
    const userId = this.authService.getUserId() ?? undefined;
    const username = this.authService.getUsername() ?? undefined;

    this.entrepriseService.getByIdForRole(e.id!, role, plan, userId, username).subscribe({
      next: (detail) => { this.selectedEntreprise = detail; },
      error: () => { /* keep the card data already shown */ }
    });
  }

  closeDetail(): void {
    this.selectedEntreprise = null;
    document.body.style.overflow = '';
  }

  loadCompanyNamesWithOffers(): void {
    this.jobOfferService.getAll().subscribe({
      next: (offers) => {
        this.entrepriseIdsWithOffers = new Set(
          (offers || [])
            .map(o => o.entrepriseId)
            .filter((id): id is number => id != null)
        );
      },
      error: () => { /* silently ignore — button just won't show */ }
    });
  }

  hasJobOffers(id: number | undefined): boolean {
    if (id == null) return false;
    return this.entrepriseIdsWithOffers.has(id);
  }

  viewJobOffers(): void {
    const id = this.selectedEntreprise?.id;
    if (!id) return;
    this.closeDetail();
    this.router.navigate(['/job-offers'], { queryParams: { entrepriseId: id } });
  }

  // ── Upgrade modal ─────────────────────────────────────────────────────────

  openUpgradeModal(): void {
    this.showUpgradeModal = true;
    this.selectedUpgradePlan = null;
    document.body.style.overflow = 'hidden';
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal = false;
    document.body.style.overflow = '';
  }

  selectUpgradePlan(planKey: string): void {
    if (planKey === 'FREE' || planKey === this.currentPlan) return;
    this.selectedUpgradePlan = planKey;
  }

  goToCheckout(): void {
    if (!this.selectedUpgradePlan) return;
    this.closeUpgradeModal();
    this.router.navigate(['/checkout'], { queryParams: { plan: this.selectedUpgradePlan } });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getInitials(nom: string | undefined): string {
    if (!nom) return '?';
    const words = nom.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return nom.substring(0, 2).toUpperCase();
  }

  getSecteurColor(secteur: string | undefined): { bg: string; text: string } {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'Technology': { bg: '#e0e7ff', text: '#3730a3' }, 'IT': { bg: '#dbeafe', text: '#1e40af' },
      'Finance': { bg: '#d1fae5', text: '#065f46' }, 'Healthcare': { bg: '#fce7f3', text: '#9d174d' },
      'Education': { bg: '#fef3c7', text: '#92400e' }, 'Engineering': { bg: '#f3e8ff', text: '#6b21a8' },
      'Consulting': { bg: '#fed7aa', text: '#9a3412' }, 'Retail': { bg: '#fef08a', text: '#854d0e' },
      'Energy': { bg: '#fef9c3', text: '#854d0e' }, 'Construction': { bg: '#ffedd5', text: '#9a3412' },
      'Telecom': { bg: '#cffafe', text: '#155e75' }
    };
    if (!secteur) return { bg: '#f1f5f9', text: '#475569' };
    for (const [key, color] of Object.entries(colors)) {
      if (secteur.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return { bg: '#f1f5f9', text: '#475569' };
  }

  getTailleLabel(taille: string | undefined): string {
    switch (taille) {
      case 'STARTUP': return 'Startup'; case 'PME': return 'PME';
      case 'GRANDE_ENTREPRISE': return 'Grande Entreprise'; default: return taille || '';
    }
  }

  getTailleColor(taille: string | undefined): string {
    switch (taille) {
      case 'STARTUP': return '#10b981'; case 'PME': return '#2563eb';
      case 'GRANDE_ENTREPRISE': return '#7c3aed'; default: return '#64748b';
    }
  }

  trackById(index: number, e: Entreprise): number { return e.id ?? index; }
}
