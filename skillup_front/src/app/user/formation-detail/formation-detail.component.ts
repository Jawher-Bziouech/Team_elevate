import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService, Formation } from '../../formation.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-formation-detail',
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.css']
})
export class FormationDetailComponent implements OnInit {
  formation: Formation | null = null;
  loading: boolean = true;
  error: string = '';
  private modalInstance: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🔍 ID récupéré depuis URL:', id);
    
    if (id) {
      this.loadFormation(+id);
    } else {
      console.error('❌ Aucun ID trouvé dans l\'URL');
      this.loading = false;
      this.error = 'ID de formation manquant';
    }
  }

  loadFormation(id: number): void {
    console.log('🔍 Chargement formation ID:', id);
    this.loading = true;
    
    this.formationService.getFormationById(id).subscribe({
      next: (data) => {
        console.log('✅ Formation reçue:', data);
        this.formation = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur API:', err);
        this.loading = false;
        this.error = 'Erreur lors du chargement de la formation';
      }
    });
  }

  // ✅ AJOUTER CETTE MÉTHODE
  openQRCodeModal(): void {
    const modalElement = document.getElementById('qrCodeModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  goBack(): void {
    this.router.navigate(['/formations']);
  }
}