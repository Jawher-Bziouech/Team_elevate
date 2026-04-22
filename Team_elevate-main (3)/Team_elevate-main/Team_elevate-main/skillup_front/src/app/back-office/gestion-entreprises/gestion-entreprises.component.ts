import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../entreprise.service';
import { Entreprise } from '../../models/entreprise.model';

@Component({
  selector: 'app-gestion-entreprises',
  templateUrl: './gestion-entreprises.component.html',
  styleUrls: ['./gestion-entreprises.component.css']
})
export class GestionEntreprisesComponent implements OnInit {
  entreprises: Entreprise[] = [];
  showModal = false;
  editingEntreprise: Entreprise | null = null;

  formData: Entreprise = this.emptyForm();

  secteurOptions = ['Technology', 'IT', 'Finance', 'Healthcare', 'Education', 'Engineering', 'Consulting', 'Retail', 'Energy', 'Construction', 'Telecom', 'Other'];
  tailleOptions = [
    { value: 'STARTUP', label: 'Startup' },
    { value: 'PME', label: 'PME' },
    { value: 'GRANDE_ENTREPRISE', label: 'Grande Entreprise' }
  ];

  constructor(private entrepriseService: EntrepriseService) {}

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises(): void {
    this.entrepriseService.getAll().subscribe({
      next: (data) => this.entreprises = data || [],
      error: (err) => console.error('Error loading entreprises:', err)
    });
  }

  get approvedCount(): number { return this.entreprises.filter(e => e.status === 'APPROVED').length; }
  get pendingCount(): number { return this.entreprises.filter(e => e.status === 'PENDING').length; }
  get rejectedCount(): number { return this.entreprises.filter(e => e.status === 'REJECTED').length; }

  openAddModal(): void {
    this.editingEntreprise = null;
    this.formData = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(e: Entreprise): void {
    this.editingEntreprise = e;
    this.formData = { ...e };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEntreprise = null;
  }

  saveEntreprise(): void {
    if (this.editingEntreprise && this.editingEntreprise.id) {
      this.entrepriseService.update(this.editingEntreprise.id, this.formData).subscribe({
        next: () => { this.closeModal(); this.loadEntreprises(); },
        error: (err) => console.error('Error updating:', err)
      });
    } else {
      this.entrepriseService.create(this.formData).subscribe({
        next: () => { this.closeModal(); this.loadEntreprises(); },
        error: (err) => console.error('Error creating:', err)
      });
    }
  }

  approveEntreprise(id: number): void {
    this.entrepriseService.updateStatus(id, 'APPROVED').subscribe(() => this.loadEntreprises());
  }

  rejectEntreprise(id: number): void {
    this.entrepriseService.updateStatus(id, 'REJECTED').subscribe(() => this.loadEntreprises());
  }

  deleteEntreprise(id: number): void {
    if (confirm('Delete this company?')) {
      this.entrepriseService.delete(id).subscribe(() => this.loadEntreprises());
    }
  }

  getInitials(nom: string | undefined): string {
    if (!nom) return '?';
    const words = nom.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return nom.substring(0, 2).toUpperCase();
  }

  private emptyForm(): Entreprise {
    return { nom: '', secteur: '', description: '', adresse: '', email: '', telephone: '', siteWeb: '', taille: '', dateCreation: '' };
  }
}
