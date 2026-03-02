// formation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Formation {
  id?: number;
  titre: string;
  description: string;
  categorie: string;
  dureeHeures: number;
  dateDebut: Date | string;
  dateFin: Date | string;
  prix: number;
  placesDisponibles: number;
  couleur?: string;
  imageUrl?: string;  
  imagePreview?: string;
  videoUrl?: string;  
  technologies?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  
  private apiUrl = 'http://localhost:8084/api/formations';

  constructor(private http: HttpClient) { }

  // ✅ GET all formations
  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}`);
  }

  // ✅ GET formation by id
  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`);
  }

  // ✅ GET categories
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  // ✅ POST formation (JSON)
  addFormationJson(formation: Formation): Observable<Formation> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<Formation>(`${this.apiUrl}`, formation, { headers });
  }

  // ✅ PUT formation (JSON)
  updateFormationJson(id: number, formation: Formation): Observable<Formation> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation, { headers });
  }

  // ✅ DELETE formation
  deleteFormation(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  // ✅ NOUVELLE MÉTHODE - Vérifier le nombre d'inscriptions
  getInscriptionsCount(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/inscriptions/count`);
  }

  // ✅ NOUVELLE MÉTHODE - Vérifier si une formation a des inscriptions
  hasInscriptions(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${id}/hasInscriptions`);
  }

 
// formation.service.ts - Ajoutez cette méthode
deleteFormationWithInscriptions(id: number): Observable<string> {
  return this.http.delete<string>(`${this.apiUrl}/${id}/force`, { 
    responseType: 'text' as 'json' 
  });
}
  // ✅ Méthode utilitaire pour formater les dates
  formatDateForBackend(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // ✅ Méthode utilitaire pour préparer une formation avant envoi
  prepareFormationForBackend(formation: Formation): any {
    return {
      id: formation.id,
      titre: formation.titre,
      description: formation.description,
      categorie: formation.categorie,
      dureeHeures: formation.dureeHeures,
      prix: formation.prix,
      dateDebut: this.formatDateForBackend(formation.dateDebut),
      dateFin: this.formatDateForBackend(formation.dateFin),
      placesDisponibles: formation.placesDisponibles,
      couleur: formation.couleur,
      imageUrl: formation.imageUrl,
      videoUrl: formation.videoUrl,
      technologies: formation.technologies || []
    };
  }
}