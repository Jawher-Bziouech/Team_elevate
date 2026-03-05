import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Formation {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  dureeHeures: number;
  prix: number;
  dateDebut: Date;
  dateFin: Date;
  placesDisponibles: number;
  imageUrl?: string;
}

export interface Prediction {
  id?: number;
  formation: Formation;
  datePrediction: Date;
  inscriptionsPrevues: number;
  croissanceEstimee: number;
  niveauConfiance: number;
  tendance: string;
  dateDebutAnalyse?: Date;
  dateFinAnalyse?: Date;
}

export interface RapportObsolescence {
  id?: number;
  formation: Formation;
  dateRapport: Date;
  scoreObsolescence: number;
  niveauRisque: string;
  recommandation: string;
  criteres: string[];
  baisseInscriptions: number;
  derniereMAJAncienne: boolean;
  technologiesDepreciees: boolean;
  tauxAnnulation: number;
}

export interface DashboardPredictions {
  dernieresPredictions: Prediction[];
  fortesCroissances: Prediction[];
}

export interface DashboardObsolescence {
  aRetirer: RapportObsolescence[];
  aMettreAJour: RapportObsolescence[];
  risquesEleves: RapportObsolescence[];
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  
  private apiUrl = 'http://localhost:8084/api';

  constructor(private http: HttpClient) { }

  // Prédictions
  getDashboardPredictions(): Observable<DashboardPredictions> {
    return this.http.get<DashboardPredictions>(`${this.apiUrl}/predictions/dashboard`);
  }

  getDernieresPredictions(): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.apiUrl}/predictions/dernieres`);
  }

  getFortesCroissances(): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.apiUrl}/predictions/fortes-croissances`);
  }

  forcerPredictions(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/predictions/forcer`, { responseType: 'text' as 'json' });
  }

  // Obsolescence
  getDashboardObsolescence(): Observable<DashboardObsolescence> {
    return this.http.get<DashboardObsolescence>(`${this.apiUrl}/obsolescence/dashboard`);
  }

  getRapportsObsolescence(): Observable<RapportObsolescence[]> {
    return this.http.get<RapportObsolescence[]>(`${this.apiUrl}/obsolescence/rapports`);
  }

  getRisquesEleves(): Observable<RapportObsolescence[]> {
    return this.http.get<RapportObsolescence[]>(`${this.apiUrl}/obsolescence/risques-eleves`);
  }

  getFormationsARetirer(): Observable<RapportObsolescence[]> {
    return this.http.get<RapportObsolescence[]>(`${this.apiUrl}/obsolescence/a-retirer`);
  }

  getFormationsAMettreAJour(): Observable<RapportObsolescence[]> {
    return this.http.get<RapportObsolescence[]>(`${this.apiUrl}/obsolescence/a-mettre-a-jour`);
  }

  forcerDetectionObsolescence(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/obsolescence/forcer`, { responseType: 'text' as 'json' });
  }

  getStatutObsolescence(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obsolescence/statut`);
  }
}