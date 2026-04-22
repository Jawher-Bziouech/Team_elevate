import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionService } from '../../services/inscription.service';
import { FormationService } from '../../formation.service';

@Component({
  selector: 'app-admin-avis',
  templateUrl: './admin-avis.component.html',
  styleUrls: ['./admin-avis.component.css'],
  standalone: true,  // ✅ standalone
  imports: [CommonModule, FormsModule]  // ✅ imports nécessaires
})
export class AdminAvisComponent implements OnInit  {
  
  avisList: any[] = [];
  formations: any[] = [];
  formationFilter: string = '';
  loading: boolean = false;

  constructor(
    private inscriptionService: InscriptionService,
    private formationService: FormationService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadAllAvis();
  }

  loadFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data: any[]) => {
        this.formations = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  loadAllAvis(): void {
    this.loading = true;
    this.getAllAvis().subscribe({
      next: (data: any[]) => {
        this.avisList = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getAllAvis(): any {
    return this.inscriptionService.getAllAvis();
  }

  filterByFormation(): void {
    if (this.formationFilter) {
      this.inscriptionService.getAvisByFormation(Number(this.formationFilter)).subscribe({
        next: (data: any[]) => {
          this.avisList = data;
        },
        error: (err: any) => console.error(err)
      });
    } else {
      this.loadAllAvis();
    }
  }

  getFormationTitle(formationId: number): string {
    const formation = this.formations.find(f => f.id === formationId);
    return formation ? formation.titre : 'N/A';
  }

  getRessentiIcon(ressenti: string): string {
    switch(ressenti) {
      case 'SATISFAIT': return '😊';
      case 'NEUTRE': return '😐';
      case 'INSATISFAIT': return '☹️';
      default: return '❓';
    }
  }

  getRessentiClass(ressenti: string): string {
    switch(ressenti) {
      case 'SATISFAIT': return 'bg-success';
      case 'NEUTRE': return 'bg-warning';
      case 'INSATISFAIT': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStats(ressenti: string): number {
    return this.avisList.filter(a => a.ressenti === ressenti).length;
  }
}