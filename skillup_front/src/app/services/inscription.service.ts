import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Inscription {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateInscription?: Date;
  statut?: string;
  formation?: any;
  formationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8084/api';

  constructor(private http: HttpClient) { }

  // S'inscrire à une formation
  inscrire(formationId: number, inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(`${this.apiUrl}/formations/${formationId}/inscriptions`, inscription);
  }

  // Récupérer toutes les inscriptions (admin)
  getAllInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptions`);
  }

  // Récupérer les inscriptions d'une formation
  getInscriptionsByFormation(formationId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/formations/${formationId}/inscriptions`);
  }

  // Récupérer une inscription par ID
  getInscriptionById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.apiUrl}/inscriptions/${id}`);
  }

  // Modifier une inscription (admin)
  updateInscription(id: number, inscription: Inscription): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/inscriptions/${id}`, inscription);
  }

  // Annuler une inscription (user)
  annulerInscription(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/inscriptions/${id}/annuler`, {});
  }

  // Supprimer une inscription (admin)
  deleteInscription(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/inscriptions/${id}`, { responseType: 'text' as 'json' });
  }
}