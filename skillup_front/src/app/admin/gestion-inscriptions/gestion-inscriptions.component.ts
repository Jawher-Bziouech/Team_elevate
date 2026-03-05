import { Component, OnInit } from '@angular/core';
import { InscriptionService, Inscription } from '../../services/inscription.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-gestion-inscriptions',
  templateUrl: './gestion-inscriptions.component.html'
})
export class GestionInscriptionsComponent implements OnInit {
  inscriptions: Inscription[] = [];
  filteredInscriptions: Inscription[] = [];
  formations: any[] = [];
  searchTerm: string = '';
  statutFilter: string = '';
  
  inscriptionSelectionnee: Inscription | null = null;
  editForm: FormGroup;
  modalInstance: any;

  constructor(
    private inscriptionService: InscriptionService,
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

  ngOnInit(): void {
    this.loadInscriptions();
    this.loadFormations();
  }

  loadInscriptions(): void {
    this.inscriptionService.getAllInscriptions().subscribe({
      next: (data) => {
        this.inscriptions = data;
        this.applyFilters();
      },
      error: (err) => console.error('Erreur', err)
    });
  }

  loadFormations(): void {
    // À remplacer par votre service de formations
    this.formations = [
      { id: 1, titre: 'devops' },
      { id: 2, titre: 'springboot' },
      { id: 3, titre: 'angular' },
      { id: 4, titre: 'marketing' },
      { id: 5, titre: 'management' }
    ];
  }

  applyFilters(): void {
    this.filteredInscriptions = this.inscriptions.filter(ins => 
      (this.statutFilter === '' || ins.statut === this.statutFilter) &&
      (this.searchTerm === '' || 
        ins.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ins.email?.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  // ✅ MODIFIER
  modifierInscription(inscription: Inscription): void {
    this.inscriptionSelectionnee = inscription;
    
    this.editForm.patchValue({
      id: inscription.id,
      nom: inscription.nom,
      prenom: inscription.prenom,
      email: inscription.email,
      formationId: inscription.formation?.id,
      statut: inscription.statut
    });
    
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // ✅ SAUVEGARDER MODIFICATION
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

  // ✅ SUPPRIMER
  supprimerInscription(id: number): void {
    if (confirm('🗑️ Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
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
}