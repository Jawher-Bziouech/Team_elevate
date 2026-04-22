import { Component, Input, OnInit } from '@angular/core';
import { InscriptionService } from '../services/inscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-avis-formation',
  templateUrl: './avis-formation.component.html',
  styleUrls: ['./avis-formation.component.css'],
  standalone: true,  // ✅ standalone
  imports: [CommonModule, FormsModule]  // ✅ imports nécessaires
})
export class AvisFormationComponent implements OnInit {
  
  @Input() inscriptionId!: number;
  @Input() formationId!: number;
  @Input() dateFin!: string;
  
  aDejaDonneAvis: boolean = false;
  formationTerminee: boolean = false;
  monAvis: any = null;
  
  ressentiSelectionne: string = 'SATISFAIT';
  commentaire: string = '';
  modalInstance: any;

  constructor(private inscriptionService: InscriptionService) {}

  ngOnInit(): void {
    console.log('🟢 Composant créé pour inscriptionId:', this.inscriptionId);
    this.formationTerminee = this.verifierFormationTerminee();
    this.verifierAvisExistant();
  }

  verifierFormationTerminee(): boolean {
    const aujourdhui = new Date();
    const dateFinFormation = new Date(this.dateFin);
    aujourdhui.setHours(0, 0, 0, 0);
    dateFinFormation.setHours(0, 0, 0, 0);
    return dateFinFormation < aujourdhui;
  }

  verifierAvisExistant(): void {
    console.log('🔍 Vérification pour inscriptionId:', this.inscriptionId);
    this.inscriptionService.hasAvis(this.inscriptionId).subscribe({
      next: (existe: boolean) => {
        console.log('📝 Résultat hasAvis:', existe);
        this.aDejaDonneAvis = existe;
        if (existe) {
          this.chargerMonAvis();
        }
      },
      error: (err: any) => {
        console.error('Erreur vérification avis:', err);
      }
    });
  }

  chargerMonAvis(): void {
    this.inscriptionService.getAvisByInscription(this.inscriptionId).subscribe({
      next: (avis: any) => {
        console.log('📝 Avis chargé:', avis);
        this.monAvis = avis;
      },
      error: (err: any) => {
        console.error('Erreur chargement avis:', err);
      }
    });
  }

  ouvrirModalAvis(ressenti: string): void {
    this.ressentiSelectionne = ressenti;
    this.commentaire = '';
    
    const modalElement = document.getElementById('avisModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  envoyerAvis(): void {
    this.inscriptionService.donnerAvis({
      inscriptionId: this.inscriptionId,
      ressenti: this.ressentiSelectionne,
      commentaire: this.commentaire
    }).subscribe({
      next: () => {
        if (this.modalInstance) {
          this.modalInstance.hide();
        }
        this.aDejaDonneAvis = true;
        this.chargerMonAvis();
        alert('✅ Merci pour votre avis !');
      },
      error: (err: any) => {
        console.error('Erreur envoi avis:', err);
        alert('❌ Erreur lors de l\'envoi de l\'avis');
      }
    });
  }
}