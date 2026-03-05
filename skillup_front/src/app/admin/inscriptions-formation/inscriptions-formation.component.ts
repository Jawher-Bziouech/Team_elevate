import { Component, Input, OnInit } from '@angular/core';
import { InscriptionService, Inscription } from '../../services/inscription.service';

@Component({
  selector: 'app-inscriptions-formation',
  templateUrl: './inscriptions-formation.component.html',
  styleUrls: ['./inscriptions-formation.component.css']
})
export class InscriptionsFormationComponent implements OnInit {
  @Input() formationId!: number;
  @Input() formation: any;
  
  inscriptions: Inscription[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private inscriptionService: InscriptionService) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.loading = true;
    
    if (this.formationId) {
      this.inscriptionService.getInscriptionsByFormation(this.formationId).subscribe({
        next: (data) => {
          this.inscriptions = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur de chargement';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.inscriptionService.getAllInscriptions().subscribe({
        next: (data) => {
          this.inscriptions = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur de chargement';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  getStatutClass(statut: string | undefined): string {
    if (!statut) return 'badge bg-secondary';
    switch(statut) {
      case 'CONFIRMÉE': return 'badge bg-success';
      case 'INSCRIT': return 'badge bg-warning';
      case 'ANNULÉE': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}