// stats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalFormations: number;
  formationsAvecPlaces: number;
  formationsCompletes: number;
  totalInscriptions: number;
  inscriptionsMois: number;
  inscriptionsSemaine: number;
  inscriptionsAujourdhui: number;
  topFormations: { [key: string]: number };
}

export interface InscriptionsJournalieres {
  periode: { debut: string, fin: string };
  totalInscriptions: number;
  parJour: { [key: string]: number };
  parFormation: { [key: string]: number };
  detailParJourEtFormation: { [key: string]: { [key: string]: number } };
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8084/api/stats';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getInscriptionsJournalieres(dateDebut?: string, dateFin?: string): Observable<InscriptionsJournalieres> {
    let url = `${this.apiUrl}/inscriptions-journalieres`;
    const params: string[] = [];
    if (dateDebut) params.push(`dateDebut=${dateDebut}`);
    if (dateFin) params.push(`dateFin=${dateFin}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    return this.http.get<InscriptionsJournalieres>(url);
  }
}