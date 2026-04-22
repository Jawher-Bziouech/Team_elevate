import { Component, OnInit } from '@angular/core';
import { InscriptionService, Inscription } from '../../services/inscription.service';
import { PaymentService } from '../../payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-gestion-inscriptions',
  templateUrl: './gestion-inscriptions.component.html'
})
export class GestionInscriptionsComponent implements OnInit {
  
  // ========== PROPRIÉTÉS ==========
  inscriptions: Inscription[] = [];
  filteredInscriptions: Inscription[] = [];
  formations: any[] = [];
  payments: any[] = []; // ✅ NOUVEAU: Liste des paiements
  searchTerm: string = '';
  statutFilter: string = '';
  showArchivedOnly: boolean = false;
  
  // Gestion modal modification
  inscriptionSelectionnee: Inscription | null = null;
  editForm: FormGroup;
  modalInstance: any;
  
  // Gestion avis émoji
  ressentiSelectionne: string = 'SATISFAIT';
  commentaire: string = '';
  formationTitreCourant: string = '';
  inscriptionIdCourant: number = 0;
  avisModalInstance: any;

  // Loading states
  loadingPayments = false;

  constructor(
    private inscriptionService: InscriptionService,
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      id: [''],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      formationId: ['', Validators.required],
      statut: ['', Validators.required]
    });
  }

  // ========== INITIALISATION ==========
  ngOnInit(): void {
    this.loadInscriptions();
    this.loadFormations();
    this.loadPayments(); // ✅ Charger les paiements
  }

  // ========== CHARGEMENT DES DONNÉES ==========
  loadInscriptions(): void {
    const request = this.showArchivedOnly 
      ? this.inscriptionService.getInscriptionsArchivees()
      : this.inscriptionService.getAllInscriptions();
    
    request.subscribe({
      next: (data) => {
        this.inscriptions = data;
        this.applyFilters();
      },
      error: (err) => console.error('Erreur chargement inscriptions', err)
    });
  }

  loadFormations(): void {
    // À remplacer par l'appel API réel
    this.formations = [
      { id: 1, titre: 'devops' },
      { id: 2, titre: 'springboot' },
      { id: 3, titre: 'angular' },
      { id: 4, titre: 'marketing' },
      { id: 5, titre: 'management' }
    ];
  }

  loadPayments(): void {
    this.loadingPayments = true;
    this.paymentService.getAllPayments(0, 1000).subscribe({
      next: (response: any) => {
        this.payments = response.content || [];
        this.loadingPayments = false;
        console.log('✅ Paiements chargés:', this.payments.length);
      },
      error: (err) => {
        console.error('❌ Erreur chargement paiements', err);
        this.loadingPayments = false;
        this.payments = [];
      }
    });
  }

  // ✅ NOUVELLE MÉTHODE: Obtenir le statut de paiement pour une inscription
  getPaiementStatus(inscription: Inscription): string {
    if (!this.payments || this.payments.length === 0) return 'NON_TROUVE';
    
    const payment = this.payments.find(p => 
      p.userEmail === inscription.email && 
      p.formationId === inscription.formation?.id
    );
    
    if (!payment) return 'NON_TROUVE';
    return payment.status || 'INCONNU';
  }

  // ✅ NOUVELLE MÉTHODE: Obtenir le montant payé
  getPaiementMontant(inscription: Inscription): number | null {
    if (!this.payments || this.payments.length === 0) return null;
    
    const payment = this.payments.find(p => 
      p.userEmail === inscription.email && 
      p.formationId === inscription.formation?.id
    );
    
    return payment ? payment.amount : null;
  }
  

  // ✅ NOUVELLE MÉTHODE: Obtenir la méthode de paiement
  getPaiementMethode(inscription: Inscription): string | null {
    if (!this.payments || this.payments.length === 0) return null;
    
    const payment = this.payments.find(p => 
      p.userEmail === inscription.email && 
      p.formationId === inscription.formation?.id
    );
    
    return payment ? payment.paymentMethod : null;
  }

  // ✅ NOUVELLE MÉTHODE: Badge CSS pour le statut de paiement
  getPaiementBadgeClass(status: string): string {
    switch(status) {
      case 'COMPLETED': return 'bg-success';
      case 'PENDING': return 'bg-warning text-dark';
      case 'FAILED': return 'bg-danger';
      case 'REFUNDED': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  // ✅ NOUVELLE MÉTHODE: Label pour le statut de paiement
  getPaiementBadgeLabel(status: string): string {
    switch(status) {
      case 'COMPLETED': return 'Payé';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'REFUNDED': return 'Remboursé';
      default: return 'Non payé';
    }
  }

  // ========== FILTRES ==========
  applyFilters(): void {
    this.filteredInscriptions = this.inscriptions.filter(ins => 
      (this.statutFilter === '' || ins.statut === this.statutFilter) &&
      (this.searchTerm === '' || 
        ins.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ins.email?.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  // ========== ARCHIVAGE ==========
  toggleShowArchived(): void {
    this.showArchivedOnly = !this.showArchivedOnly;
    this.loadInscriptions();
  }

  archiverInscription(id: number): void {
    if (confirm('📦 Êtes-vous sûr de vouloir ARCHIVER cette inscription ?')) {
      this.inscriptionService.archiverInscription(id).subscribe({
        next: () => {
          this.loadInscriptions();
          alert('✅ Inscription archivée avec succès');
        },
        error: (err) => {
          console.error('Erreur archivage', err);
          alert('❌ Erreur lors de l\'archivage');
        }
      });
    }
  }

  desarchiverInscription(id: number): void {
    if (confirm('📤 Êtes-vous sûr de vouloir DÉSARCHIVER cette inscription ?')) {
      this.inscriptionService.desarchiverInscription(id).subscribe({
        next: () => {
          this.loadInscriptions();
          alert('✅ Inscription désarchivée avec succès');
        },
        error: (err) => {
          console.error('Erreur désarchivage', err);
          alert('❌ Erreur lors du désarchivage');
        }
      });
    }
  }

  // ========== GESTION DES AVIS ÉMOJI ==========
  
  /**
   * Vérifie si la formation est terminée
   */
  estTerminee(dateFin: string | undefined): boolean {
    if (!dateFin) return false;
    const aujourdhui = new Date();
    const dateFinFormation = new Date(dateFin);
    aujourdhui.setHours(0, 0, 0, 0);
    dateFinFormation.setHours(0, 0, 0, 0);
    return dateFinFormation < aujourdhui;
  }

  /**
   * Ouvre le modal pour laisser un avis
   */
  ouvrirModalAvis(inscriptionId: number | undefined, ressenti: string, formationTitre: string | undefined): void {
    if (!inscriptionId) {
      console.error('ID d\'inscription invalide');
      return;
    }
    this.inscriptionIdCourant = inscriptionId;
    this.ressentiSelectionne = ressenti;
    this.formationTitreCourant = formationTitre || 'cette formation';
    this.commentaire = '';
    
    const modalElement = document.getElementById('avisModal');
    if (modalElement) {
      this.avisModalInstance = new bootstrap.Modal(modalElement);
      this.avisModalInstance.show();
    }
  }

  /**
   * Envoie l'avis au backend
   */
  envoyerAvis(): void {
    const avisData = {
      inscriptionId: this.inscriptionIdCourant,
      ressenti: this.ressentiSelectionne,
      commentaire: this.commentaire
    };
    
    this.inscriptionService.donnerAvis(avisData).subscribe({
      next: () => {
        if (this.avisModalInstance) {
          this.avisModalInstance.hide();
        }
        this.loadInscriptions();
        alert('✅ Merci pour votre avis !');
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi de l\'avis', err);
        alert('❌ Erreur lors de l\'envoi de l\'avis');
      }
    });
  }

  // ========== GESTION DES INSCRIPTIONS (CRUD) ==========
  
  modifierInscription(inscription: Inscription): void {
    this.inscriptionSelectionnee = inscription;
    
    this.editForm.patchValue({
      id: this.inscriptionSelectionnee.id,
      nom: this.inscriptionSelectionnee.nom,
      prenom: this.inscriptionSelectionnee.prenom,
      email: this.inscriptionSelectionnee.email,
      formationId: this.inscriptionSelectionnee.formation?.id,
      statut: this.inscriptionSelectionnee.statut
    });
    
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  sauvegarderModification(): void {
    if (this.editForm.valid && this.inscriptionSelectionnee) {
      const inscriptionModifiee: Inscription = {
        id: this.inscriptionSelectionnee.id,
        nom: this.editForm.value.nom,
        prenom: this.editForm.value.prenom,
        email: this.editForm.value.email,
        formation: { id: this.editForm.value.formationId, titre: '' },
        statut: this.editForm.value.statut,
        dateInscription: this.inscriptionSelectionnee.dateInscription,
        telephone: this.inscriptionSelectionnee.telephone || ''
      };
      
      this.inscriptionService.updateInscription(this.inscriptionSelectionnee.id!, inscriptionModifiee).subscribe({
        next: () => {
          if (this.modalInstance) {
            this.modalInstance.hide();
          }
          this.loadInscriptions();
          alert('✅ Inscription modifiée avec succès');
        },
        error: (err) => {
          console.error('Erreur modification', err);
          alert('❌ Erreur lors de la modification');
        }
      });
    }
  }

  supprimerInscription(id: number): void {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer définitivement cette inscription ?')) {
      this.inscriptionService.deleteInscription(id).subscribe({
        next: () => {
          this.loadInscriptions();
          alert('✅ Inscription supprimée avec succès');
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          alert('❌ Erreur lors de la suppression');
        }
      });
    }
  }

  // ========== MÉTHODES UTILITAIRES POUR L'AFFICHAGE ==========
  
  getArchiveBadgeClass(archivee: boolean): string {
    return archivee ? 'bg-secondary' : 'bg-info';
  }

  getArchiveBadgeText(archivee: boolean): string {
    return archivee ? 'Archivée' : 'Active';
  }

  getStatutBadgeClass(statut: string): string {
    switch(statut) {
      case 'CONFIRMÉE': return 'bg-success';
      case 'INSCRIT': return 'bg-warning';
      case 'ANNULÉE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}