import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  
  private apiUrl = 'http://localhost:9090/api/badges'; // Via Gateway

  constructor(private http: HttpClient) {}

  // Récupérer les badges d'un utilisateur
  getUserBadges(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  // Ajouter un badge
  addBadge(userId: number, badge: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}/add?badge=${badge}`, {});
  }

  // Liste de tous les badges
  getAllBadges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
}