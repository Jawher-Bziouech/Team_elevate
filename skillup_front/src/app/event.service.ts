import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { appEvent, EventStats } from './models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:8082/events';

  // BehaviorSubject pour les filtres en temps réel
  private filtersSubject = new BehaviorSubject<any>({});
  filters$ = this.filtersSubject.asObservable();

  // BehaviorSubject pour les événements
  private eventsSubject = new BehaviorSubject<appEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // CRUD de base
  getAllEvents(): Observable<appEvent[]> {
    return this.http.get<appEvent[]>(this.apiUrl).pipe(
      map(events => {
        this.eventsSubject.next(events);
        return events;
      })
    );
  }

  getEventById(id: number): Observable<appEvent> {
    return this.http.get<appEvent>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: appEvent): Observable<appEvent> {
    return this.http.post<appEvent>(`${this.apiUrl}/add`, event);
  }

  updateEvent(id: number, event: appEvent): Observable<appEvent> {
    return this.http.put<appEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 📊 STATISTIQUES AVANCÉES
  getEventStats(): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/stats`);
  }

  // 🔍 RECHERCHE AVANCÉE
  searchEvents(filters: any): Observable<appEvent[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    });
    return this.http.get<appEvent[]>(`${this.apiUrl}/search`, { params });
  }

  // 📅 ÉVÉNEMENTS PAR PÉRIODE
  getEventsByDateRange(start: Date, end: Date): Observable<appEvent[]> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<appEvent[]>(`${this.apiUrl}/range`, { params });
  }

  // 📈 ÉVÉNEMENTS TENDANCE
  getTrendingEvents(limit: number = 5): Observable<appEvent[]> {
    return this.http.get<appEvent[]>(`${this.apiUrl}/trending?limit=${limit}`);
  }

  // 🏷️ ÉVÉNEMENTS PAR CATÉGORIE
  getEventsByCategory(category: string): Observable<appEvent[]> {
    return this.http.get<appEvent[]>(`${this.apiUrl}/category/${category}`);
  }

  // ⭐ ÉVÉNEMENTS LES MIEUX NOTÉS
  getTopRatedEvents(limit: number = 5): Observable<appEvent[]> {
    return this.http.get<appEvent[]>(`${this.apiUrl}/top-rated?limit=${limit}`);
  }

  // 📊 MISE À JOUR DES FILTRES
  updateFilters(filters: any): void {
    this.filtersSubject.next(filters);
  }

  // 📤 EXPORT
  exportEvents(format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${format}`, {
      responseType: 'blob'
    });
  }

  // 🔄 CHANGER LE STATUT (DRAG & DROP)
  updateEventStatus(id: number, status: string): Observable<appEvent> {
    return this.http.patch<appEvent>(`${this.apiUrl}/${id}/status`, { status });
  }
}
