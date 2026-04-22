import { Component, OnInit } from '@angular/core';
import { Formation, FormationService } from '../../formation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormationModalComponent } from './formation-modal/formation-modal.component';

@Component({
  selector: 'app-gestion-formations',
  templateUrl: './gestion-formations.component.html',
  styleUrls: ['./gestion-formations.component.css']
})
export class GestionFormationsComponent implements OnInit {
  formations: Formation[] = [];
  filteredFormationsList: Formation[] = [];
  categories: string[] = [];
  selectedCategorie: string = '';
  searchTerm: string = '';
  
  // États de chargement et messages
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formationService: FormationService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadCategories();
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getAllFormations().subscribe({
      next: (data: Formation[]) => {
        this.formations = data;
        console.log('📦 Formations reçues:', data);
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement formations', err);
        this.errorMessage = 'Impossible de charger les formations';
        this.loading = false;
        this.clearMessagesAfterDelay();
      }
    });
  }

  loadCategories(): void {
    this.formationService.getCategories().subscribe({
      next: (data: string[]) => {
        this.categories = data;
      },
      error: (err: any) => console.error('Erreur chargement catégories', err)
    });
  }

  applyFilter(): void {
    console.log('🔍 Filtre appliqué - Catégorie:', this.selectedCategorie, 'Recherche:', this.searchTerm);
    
    this.filteredFormationsList = this.formations.filter(f => {
      const matchCategorie = this.selectedCategorie === '' || f.categorie === this.selectedCategorie;
      const matchSearch = this.searchTerm === '' || 
        f.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchCategorie && matchSearch;
    });
    
    console.log('📊 Résultats filtrés:', this.filteredFormationsList.length);
  }

  // Getter pour le template
  get filteredFormations(): Formation[] {
    return this.filteredFormationsList;
  }

  openAddModal(): void {
    const modalRef = this.modalService.open(FormationModalComponent);
    modalRef.componentInstance.isEdit = false;
    modalRef.componentInstance.categories = this.categories;
    
    modalRef.result.then(
      (result: any) => {
        if (result) {
          this.addFormation(result);
        }
      },
      () => {}
    );
  }

  openEditModal(formation: Formation): void {
    const modalRef = this.modalService.open(FormationModalComponent);
    modalRef.componentInstance.isEdit = true;
    modalRef.componentInstance.formationData = formation;
    modalRef.componentInstance.categories = this.categories;
    
    modalRef.result.then(
      (result: any) => {
        if (result) {
          this.updateFormation(formation.id!, result);
        }
      },
      () => {}
    );
  }

  // ✅ MÉTHODE UNIQUE DE SUPPRESSION (version améliorée)
  deleteFormation(id: number | undefined): void {
    if (!id) {
      this.errorMessage = 'ID de formation invalide';
      this.clearMessagesAfterDelay();
      return;
    }

    // D'abord vérifier le nombre d'inscriptions
    this.formationService.getInscriptionsCount(id).subscribe({
      next: (count) => {
        const formation = this.formations.find(f => f.id === id);
        
        if (count > 0) {
          // Message personnalisé avec le nombre d'inscriptions
          const message = 
            `⚠️ **ATTENTION** ⚠️\n\n` +
            `La formation "${formation?.titre}" a **${count} inscription(s)** associée(s).\n\n` +
            `Voulez-vous :\n` +
            `✓ **OK** → Supprimer la formation ET ses ${count} inscription(s)\n` +
            `✗ **Annuler** → Ne rien supprimer`;
          
          if (confirm(message)) {
            this.deleteFormationWithInscriptions(id);
          }
        } else {
          // Pas d'inscriptions, suppression simple
          if (confirm(`Voulez-vous supprimer la formation "${formation?.titre}" ?`)) {
            this.deleteFormationOnly(id);
          }
        }
      },
      error: (err) => {
        console.error('Erreur vérification inscriptions', err);
        // Fallback à la suppression simple
        if (confirm('Voulez-vous supprimer cette formation ?')) {
          this.deleteFormationOnly(id);
        }
      }
    });
  }

  // ✅ Suppression simple (sans inscriptions)
  deleteFormationOnly(id: number): void {
    this.loading = true;
    this.formationService.deleteFormation(id).subscribe({
      next: (response) => {
        console.log('✅ Suppression réussie:', response);
        this.successMessage = typeof response === 'string' ? response : 'Formation supprimée avec succès';
        this.formations = this.formations.filter(f => f.id !== id);
        this.applyFilter();
        this.loading = false;
        this.clearMessagesAfterDelay();
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        
        if (err.status === 409) {
          // La formation a des inscriptions, proposer la suppression forcée
          if (confirm(err.error + '\n\nVoulez-vous supprimer la formation ET ses inscriptions ?')) {
            this.deleteFormationWithInscriptions(id);
          }
        } else {
          this.errorMessage = 'Erreur lors de la suppression: ' + (err.error?.message || err.message);
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      }
    });
  }

  // ✅ Suppression forcée (avec inscriptions)
  deleteFormationWithInscriptions(id: number): void {
    this.loading = true;
    
    this.formationService.deleteFormationWithInscriptions(id).subscribe({
      next: (response) => {
        console.log('✅ Suppression forcée réussie:', response);
        
        // Retirer la formation de la liste locale
        this.formations = this.formations.filter(f => f.id !== id);
        this.applyFilter();
        
        this.successMessage = typeof response === 'string' ? response : 'Formation et inscriptions supprimées';
        this.loading = false;
        
        // Recharger les catégories au cas où
        this.loadCategories();
        
        this.clearMessagesAfterDelay();
      },
      error: (err) => {
        console.error('❌ Erreur suppression forcée:', err);
        this.errorMessage = 'Erreur lors de la suppression forcée: ' + (err.error?.message || err.message);
        this.loading = false;
        this.clearMessagesAfterDelay();
      }
    });
  }

  // ✅ AJOUTER UNE FORMATION
  addFormation(result: any): void {
    if (result?.formValue) {
      this.loading = true;
      
      this.formationService.addFormationJson(result.formValue).subscribe({
        next: (response: Formation) => {
          this.formations.push(response);
          this.applyFilter();
          this.loadCategories();
          this.successMessage = 'Formation ajoutée avec succès';
          this.loading = false;
          console.log('✅ Formation ajoutée avec succès', response);
          this.clearMessagesAfterDelay();
        },
        error: (error: any) => {
          console.error('❌ Erreur création formation', error);
          this.errorMessage = 'Erreur lors de l\'ajout: ' + (error.error?.message || error.message);
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  // ✅ MODIFIER UNE FORMATION
  updateFormation(id: number, result: any): void {
    if (result?.formValue) {
      // Ajouter l'ID
      result.formValue.id = id;
      this.loading = true;
      
      this.formationService.updateFormationJson(id, result.formValue).subscribe({
        next: (response: Formation) => {
          const index = this.formations.findIndex(f => f.id === id);
          if (index !== -1) {
            this.formations[index] = response;
          }
          this.applyFilter();
          this.loadCategories();
          this.successMessage = 'Formation modifiée avec succès';
          this.loading = false;
          console.log('✅ Formation modifiée avec succès', response);
          this.clearMessagesAfterDelay();
        },
        error: (error: any) => {
          console.error('❌ Erreur modification formation', error);
          this.errorMessage = 'Erreur lors de la modification: ' + (error.error?.message || error.message);
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  // ✅ Effacer les messages après 3 secondes
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}