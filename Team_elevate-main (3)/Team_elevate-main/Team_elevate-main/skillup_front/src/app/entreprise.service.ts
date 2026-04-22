import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entreprise } from './models/entreprise.model';

@Injectable({ providedIn: 'root' })
export class EntrepriseService {

  private apiUrl = 'http://localhost:9090/api/entreprises';

  constructor(private http: HttpClient) {}

  // ── Admin / back-office (full data) ────────────────
  getAll(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(this.apiUrl);
  }

  getApproved(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/approved`);
  }

  getById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.apiUrl}/${id}`);
  }

  create(entreprise: Entreprise): Observable<Entreprise> {
    return this.http.post<Entreprise>(this.apiUrl, entreprise);
  }

  update(id: number, entreprise: Entreprise): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}`, entreprise);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(nom?: string, secteur?: string): Observable<Entreprise[]> {
    const params: any = {};
    if (nom) params.nom = nom;
    if (secteur) params.secteur = secteur;
    return this.http.get<Entreprise[]>(`${this.apiUrl}/search`, { params });
  }

  getBySecteur(secteur: string): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/secteur/${secteur}`);
  }

  updateStatus(id: number, status: string): Observable<Entreprise> {
    return this.http.put<Entreprise>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }

  getSecteurs(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/secteurs`);
  }

  // ── Plan-aware public endpoints ─────────────────────
  getApprovedForRole(role: string, plan: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approved/public`, { params: { role, plan } });
  }

  getByIdForRole(id: number, role: string, plan: string, userId?: number, username?: string): Observable<any> {
    const params: any = { role, plan };
    if (userId != null) params.userId = userId;
    if (username != null) params.username = username;
    return this.http.get<any>(`${this.apiUrl}/${id}/view`, { params });
  }
}
