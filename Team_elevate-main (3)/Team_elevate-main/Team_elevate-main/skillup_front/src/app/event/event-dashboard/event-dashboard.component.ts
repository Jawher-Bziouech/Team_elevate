import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { appEvent, EventStats } from '../../models/event.model';
import { EventService } from '../../event.service';
import {ExportService} from '../../export.service';  // ← Chemin corrigé
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.css'],
  animations: [
    trigger('menuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class EventDashboardComponent implements OnInit {
  // Propriétés principales
  events: appEvent[] = [];
  isLoading = true;
  viewMode: 'grid' | 'calendar' | 'list' = 'grid';

  // Statistiques (initialisées pour éviter undefined)
  stats: EventStats = {
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    completedEvents: 0,
    totalParticipants: 0,
    averageRating: 0,
    revenue: 0,
    popularCategories: [],
    eventsByMonth: [],
    reviews: 0
  };

  // Statistiques calculées
  totalRevenue = 0;
  participationRate = 0;
  popularCategories: { name: string; count: number }[] = [];

  // Options pour les filtres
  statusOptions: string[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
  categoryOptions: string[] = ['Conférence', 'Workshop', 'Formation', 'Séminaire', 'Webinaire'];

  // Filtres sélectionnés
  selectedStatus: string = '';
  selectedCategory: string = '';

  constructor(
    private eventService: EventService,
    private router: Router , // ← Ajouté pour la navigation
  private exportService: ExportService  // ← AJOUTER

) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Charger les données
  loadData(): void {
    this.isLoading = true;

    // Charger tous les événements
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        console.log('Événements reçus:', events);
      this.events=events || [];
        this.calculateStats(this.events);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
        this.isLoading = false;
        // En cas d'erreur, charger des données mock pour tester l'interface
        this.loadMockData();
      }
    });

    // Charger les statistiques avancées
    this.eventService.getEventStats().subscribe({
      next: (stats) => {
        console.log('Statistiques reçues:', stats);
        if (stats) {
          this.stats = stats;
        }
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  // Données de test (si le backend ne répond pas)
  loadMockData(): void {
    console.log('Chargement des données de test');
    this.events = [
      {
        eventId: 1,
        title: 'Conférence Angular',
        type: 'Conférence',
        description: 'Découvrez les dernières fonctionnalités d\'Angular',
        location: 'Tunis',
        startDate: new Date('2024-03-15T09:00:00'),
        endDate: new Date('2024-03-15T17:00:00'),
        capacity: 100,
        registeredCount: 75,
        status: 'UPCOMING',
        priority: 'HIGH',
        category: 'Conférence',
        tags: ['Angular', 'Frontend'],
        price: 50,
        currency: 'TND',
        rating: 4.5,
        reviews: 12,
        isFeatured: true,
        organizer: { name: 'TechCorp', email: 'contact@techcorp.tn' }
      },
      {
        eventId: 2,
        title: 'Workshop Spring Boot',
        type: 'Workshop',
        description: 'Maîtrisez Spring Boot en 2 jours',
        location: 'En ligne',
        startDate: new Date('2024-03-20T10:00:00'),
        endDate: new Date('2024-03-21T16:00:00'),
        capacity: 50,
        registeredCount: 30,
        status: 'UPCOMING',
        priority: 'MEDIUM',
        category: 'Workshop',
        tags: ['Java', 'Spring'],
        price: 30,
        currency: 'TND',
        rating: 4.8,
        reviews: 8,
        isFeatured: false,
        organizer: { name: 'SpringExperts', email: 'info@springexperts.com' }
      }
    ];
    this.calculateStats(this.events);
  }

  // Calculer les statistiques
  calculateStats(events: appEvent[]): void {
    if (!Array.isArray(events) || events.length === 0) {
      this.totalRevenue = 0;
      this.participationRate = 0;
      this.popularCategories = [];
      return;
    }

    // Calcul du revenu total
    this.totalRevenue = events.reduce((sum, event) => {
      const price = event?.price ?? 0;
      const registered = event?.registeredCount ?? 0;
      return sum + (price * registered);
    }, 0);

    // Taux de participation moyen
    const totalCapacity = events.reduce((sum, e) => sum + (e?.capacity ?? 0), 0);
    const totalRegistered = events.reduce((sum, e) => sum + (e?.registeredCount ?? 0), 0);
    this.participationRate = totalCapacity > 0 ? (totalRegistered / totalCapacity) * 100 : 0;

    // Catégories populaires
    const categoryCount: Record<string, number> = {};
    events.forEach(event => {
      const category = event?.category || event?.type || 'Autres';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    this.popularCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Gestion de la vue
  setViewMode(mode: 'grid' | 'calendar' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('eventViewMode', mode);
  }

  // Filtres
  applyFilters(): void {
    console.log('Filtres appliqués:', {
      status: this.selectedStatus,
      category: this.selectedCategory
    });

    // TODO: Implémenter la logique de filtrage avec le service
    // this.eventService.getFilteredEvents(this.selectedStatus, this.selectedCategory)
    //   .subscribe(filteredEvents => this.events = filteredEvents);
  }

  // Rafraîchir les données
  refreshData(): void {
    this.loadData();
  }

  // Actions sur les événements
  viewEventDetails(id: number): void {
    this.router.navigate(['/events', id]);
  }

  editEvent(id: number): void {
    this.router.navigate(['/events/edit', id]);
  }

  deleteEvent(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          alert('Événement supprimé avec succès');
          this.events = this.events.filter(e => e.eventId !== id);
          this.calculateStats(this.events);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  shareEvent(id: number): void {
    const url = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Lien copié dans le presse-papiers !');
    }).catch(() => {
      prompt('Copiez ce lien:', url);
    });
  }

  // Export
  // Propriétés pour le menu
  showExportMenu: boolean = false;
  lastUpdate: Date = new Date();

// Animation du menu
  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;

    // Fermer le menu si on clique ailleurs
    if (this.showExportMenu) {
      setTimeout(() => {
        document.addEventListener('click', this.closeExportMenu.bind(this));
      }, 0);
    }
  }

  closeExportMenu(event?: MouseEvent): void {
    if (event && (event.target as Element).closest('#exportMenu')) {
      return;
    }
    this.showExportMenu = false;
    document.removeEventListener('click', this.closeExportMenu.bind(this));
  }

// Obtenir le nombre d'événements filtrés
  getFilteredCount(): number {
    let filtered = [...this.events];

    if (this.selectedStatus) {
      filtered = filtered.filter(e => e.status === this.selectedStatus);
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(e => (e.category || e.type) === this.selectedCategory);
    }

    return filtered.length;
  }

// Exporter avec différents formats
  exportEvent(format: 'pdf' | 'excel' | 'csv' | 'print', scope: 'all' | 'filtered'): void {
    // Déterminer quels événements exporter
    let eventsToExport = [...this.events];
    let filename = 'evenements';

    if (scope === 'filtered') {
      if (this.selectedStatus) {
        eventsToExport = eventsToExport.filter(e => e.status === this.selectedStatus);
        filename += `_${this.selectedStatus.toLowerCase()}`;
      }

      if (this.selectedCategory) {
        eventsToExport = eventsToExport.filter(e => (e.category || e.type) === this.selectedCategory);
        filename += `_${this.selectedCategory.toLowerCase()}`;
      }
    }

    if (eventsToExport.length === 0) {
      alert('Aucun événement à exporter');
      return;
    }

    filename += `_${new Date().toISOString().slice(0,10)}`;

    switch(format) {
      case 'pdf':
        this.exportService.exportToPDF(eventsToExport, filename);
        break;
      case 'excel':
        this.exportService.exportToExcel(eventsToExport, filename);
        break;
      case 'csv':
        this.exportService.exportToCSV(eventsToExport, filename);
        break;
      case 'print':
        this.printEvents(eventsToExport);
        break;
    }

    // Mettre à jour la dernière utilisation
    this.lastUpdate = new Date();
  }

// Version imprimable
  printEvents(events:appEvent[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les popups');
      return;
    }

    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Liste des événements</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #2563eb; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9fafb; }
        .stats { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1>Liste des événements</h1>
      <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>

      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Type</th>
            <th>Lieu</th>
            <th>Date</th>
            <th>Inscrits</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${events.map(event => `
            <tr>
              <td>${event.title}</td>
              <td>${event.type}</td>
              <td>${event.location}</td>
              <td>${new Date(event.startDate).toLocaleDateString('fr-FR')}</td>
              <td>${event.registeredCount || 0}/${event.capacity}</td>
              <td>${this.getStatusFrench(event.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="stats">
        <h3>Résumé statistique</h3>
        <p>Total événements: ${events.length}</p>
        <p>Total participants: ${events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)}</p>
        <p>À venir: ${events.filter(e => e.status === 'UPCOMING').length}</p>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

// Traduction des statuts
  getStatusFrench(status?: string): string {
    const statusMap: Record<string, string> = {
      'UPCOMING': 'À venir',
      'ONGOING': 'En cours',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé',
      'DRAFT': 'Brouillon'
    };
    return status ? (statusMap[status] || status) : 'N/A';
  }

  // Couleurs et styles
  getStatusColor(status?: string): string {
    if (!status) return 'bg-gray-500';
    const colors: Record<string, string> = {
      'UPCOMING': 'bg-blue-500',
      'ONGOING': 'bg-green-500',
      'COMPLETED': 'bg-gray-500',
      'CANCELLED': 'bg-red-500',
      'DRAFT': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  getPriorityBadge(priority?: string): string {
    if (!priority) return 'bg-gray-100 text-gray-800';
    const badges: Record<string, string> = {
      'HIGH': 'bg-red-100 text-red-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-green-100 text-green-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status?: string): string {
    const statusMap: Record<string, string> = {
      'UPCOMING': 'À venir',
      'ONGOING': 'En cours',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé',
      'DRAFT': 'Brouillon'
    };
    return status ? (statusMap[status] || status) : 'Inconnu';
  }
  navigateToCreate(): void {
  this.router.navigate(['/back-office'], { queryParams: { view: 'event-form' } });
}

}
