import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Inscription {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  dateInscription?: Date | string;
  dateArchive?: Date | string | null;
  statut?: string;
  archivee?: boolean;
  formation?: any;
  
  // Propriétés pour les avis
  avisDonne?: boolean;
  ressenti?: string;
  commentaire?: string;
  dateAvis?: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:9090/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ========== INSCRIPTIONS ==========
  inscrire(formationId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/formations/${formationId}/inscriptions`,
      null,
      { headers: this.getHeaders() }
    );
  }

  getAllInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptions`, { headers: this.getHeaders() });
  }

  getInscriptionsByFormation(formationId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/formations/${formationId}/inscriptions`, { headers: this.getHeaders() });
  }

  getInscriptionsByUser(email: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptions/user?email=${email}`, {
      headers: this.getHeaders()
    });
  }

  updateInscription(id: number, inscription: Inscription): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/inscriptions/${id}`, inscription, { headers: this.getHeaders() });
  }

  deleteInscription(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/inscriptions/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json' 
    });
  }

  // ========== ARCHIVAGE ==========
  archiverInscription(id: number): Observable<Inscription> {
    return this.http.patch<Inscription>(`${this.apiUrl}/inscriptions/${id}/archiver`, null, {
      headers: this.getHeaders()
    });
  }

  desarchiverInscription(id: number): Observable<Inscription> {
    return this.http.patch<Inscription>(`${this.apiUrl}/inscriptions/${id}/desarchiver`, null, {
      headers: this.getHeaders()
    });
  }

  getInscriptionsArchivees(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptions/archivees`, {
      headers: this.getHeaders()
    });
  }

  getInscriptionsActives(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/inscriptions/actives`, {
      headers: this.getHeaders()
    });
  }

  archiverParEmail(email: string): Observable<Inscription[]> {
    return this.http.patch<Inscription[]>(`${this.apiUrl}/inscriptions/archiver-par-email?email=${email}`, null, {
      headers: this.getHeaders()
    });
  }

  // ========== GESTION DES AVIS ==========
  donnerAvis(avisData: { inscriptionId: number, ressenti: string, commentaire: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/avis/donner`, avisData, {
      headers: this.getHeaders()
    });
  }

  getAvisByInscription(inscriptionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis/inscription/${inscriptionId}`, {
      headers: this.getHeaders()
    });
  }

  getStatistiquesAvis(formationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis/formation/${formationId}/statistiques`, {
      headers: this.getHeaders()
    });
  }

  hasAvis(inscriptionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/avis/inscription/${inscriptionId}/existe`, {
      headers: this.getHeaders()
    });
  }

  getAllAvis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/avis/tous`, {
      headers: this.getHeaders()
    });
  }

  getAvisByFormation(formationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/avis/formation/${formationId}`, {
      headers: this.getHeaders()
    });
  }
}