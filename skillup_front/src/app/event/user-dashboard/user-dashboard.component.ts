import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { EventService } from '../../event.service';
import { appEvent } from '../../models/event.model';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  username: string | null = '';
  upcomingEvents: appEvent[] = [];
  recommendedEvents: appEvent[] = [];

  // Statistiques simples
  stats = {
    totalEvents: 0,
    upcomingCount: 0,
    completedCount: 0
  };

  constructor(
    public authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.loadUserData();
  }

  loadUserData(): void {
    // Charger tous les événements
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        // Filtrer les événements à venir
        const now = new Date();

        // Événements à venir (prochains)
        this.upcomingEvents = events
          .filter(e => e.status === 'UPCOMING' && new Date(e.startDate) > now)
          .slice(0, 3);

        // Recommandations (événements populaires avec places disponibles)
        this.recommendedEvents = events
          .filter(e => e.status === 'UPCOMING' && (e.registeredCount || 0) < (e.capacity || 0))
          .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
          .slice(0, 3);

        // Mettre à jour les statistiques
        this.stats.totalEvents = events.length;
        this.stats.upcomingCount = events.filter(e => e.status === 'UPCOMING').length;
        this.stats.completedCount = events.filter(e => e.status === 'COMPLETED').length;
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
      }
    });
  }

  // Formater la date
  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  }

  // Obtenir le mois en toutes lettres
  getMonth(date: any): string {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short' });
  }

  // Obtenir le jour
  getDay(date: any): string {
    return new Date(date).getDate().toString();
  }
}
