import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../entreprise.service';
import { Entreprise } from '../models/entreprise.model';

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

  // Filters
  searchTerm = '';
  selectedSecteur = 'all';
  selectedTaille = 'all';
  sortBy = 'newest';
  secteurs: string[] = [];

  // Pagination
  pageSize = 9;
  currentPage = 0;
  pageSizeOptions = [6, 9, 18];

  // Detail modal
  selectedEntreprise: Entreprise | null = null;

  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'name_asc', label: 'Name A → Z' },
    { value: 'name_desc', label: 'Name Z → A' }
  ];

  Math = Math;

  constructor(private entrepriseService: EntrepriseService) {}

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises(): void {
    this.entrepriseService.getApproved().subscribe({
      next: (data) => {
        this.entreprises = data || [];
        this.extractFilters();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading entreprises:', err);
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

    if (this.selectedSecteur !== 'all') {
      filtered = filtered.filter(e => e.secteur === this.selectedSecteur);
    }

    if (this.selectedTaille !== 'all') {
      filtered = filtered.filter(e => e.taille === this.selectedTaille);
    }

    filtered = this.applySorting(filtered);
    this.filteredEntreprises = filtered;

    if (resetPage) this.currentPage = 0;
    this.updateDisplayed();
  }

  applySorting(list: Entreprise[]): Entreprise[] {
    const sorted = list.slice();
    switch (this.sortBy) {
      case 'newest':
        sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'name_asc':
        sorted.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
        break;
      case 'name_desc':
        sorted.sort((a, b) => (b.nom || '').localeCompare(a.nom || ''));
        break;
    }
    return sorted;
  }

  updateDisplayed(): void {
    const start = this.currentPage * this.pageSize;
    this.displayedEntreprises = this.filteredEntreprises.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayed();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 0;
    this.updateDisplayed();
  }

  onSearchChange(): void { this.applyFilters(); }
  onSecteurChange(): void { this.applyFilters(); }
  onTailleChange(): void { this.applyFilters(); }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedSecteur = 'all';
    this.selectedTaille = 'all';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  openDetail(e: Entreprise): void {
    this.selectedEntreprise = e;
    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selectedEntreprise = null;
    document.body.style.overflow = '';
  }

  getInitials(nom: string | undefined): string {
    if (!nom) return '?';
    const words = nom.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return nom.substring(0, 2).toUpperCase();
  }

  getSecteurColor(secteur: string | undefined): { bg: string; text: string } {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'Technology': { bg: '#e0e7ff', text: '#3730a3' },
      'IT': { bg: '#dbeafe', text: '#1e40af' },
      'Finance': { bg: '#d1fae5', text: '#065f46' },
      'Healthcare': { bg: '#fce7f3', text: '#9d174d' },
      'Education': { bg: '#fef3c7', text: '#92400e' },
      'Engineering': { bg: '#f3e8ff', text: '#6b21a8' },
      'Consulting': { bg: '#fed7aa', text: '#9a3412' },
      'Retail': { bg: '#fef08a', text: '#854d0e' },
      'Energy': { bg: '#fef9c3', text: '#854d0e' },
      'Construction': { bg: '#ffedd5', text: '#9a3412' },
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
      case 'STARTUP': return 'Startup';
      case 'PME': return 'PME';
      case 'GRANDE_ENTREPRISE': return 'Grande Entreprise';
      default: return taille || '';
    }
  }

  getTailleColor(taille: string | undefined): string {
    switch (taille) {
      case 'STARTUP': return '#10b981';
      case 'PME': return '#2563eb';
      case 'GRANDE_ENTREPRISE': return '#7c3aed';
      default: return '#64748b';
    }
  }

  trackById(index: number, e: Entreprise): number {
    return e.id ?? index;
  }
}
