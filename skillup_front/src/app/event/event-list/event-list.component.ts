import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../event.service';
import { appEvent } from '../../models/event.model';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit{
  events: appEvent[] = [];
  filteredEvents: appEvent[] = [];
  featuredEvents: appEvent[] = [];
  popularEvents: appEvent[] = [];

  // États
  isLoading = true;
  viewMode: 'grid' | 'list' = 'grid';

  // Filtres avancés
  searchTerm = '';
  selectedCategories: string[] = [];
  selectedTypes: string[] = [];
  priceRange: [number, number] = [0, 1000];
  selectedDate: string = 'all';
  selectedLocation: string = '';

  // Métier avancé
  categories: string[] = ['Développement', 'Design', 'Marketing', 'Management', 'Data Science', 'IA'];
  types: string[] = ['Conférence', 'Workshop', 'Formation', 'Séminaire', 'Webinaire'];
  locations: string[] = ['Tunis', 'Sfax', 'Sousse', 'En ligne', 'International'];
  testData(): void {
    console.log('📊 ÉTAT ACTUEL:', {
      isLoading: this.isLoading,
      events: this.events,
      eventsLength: this.events?.length,
      filteredEvents: this.filteredEvents,
      filteredLength: this.filteredEvents?.length,
      popularEvents: this.popularEvents,
      popularLength: this.popularEvents?.length,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      paginatedEvents: this.getPaginatedEvents()
    });

    if (this.events?.length > 0) {
      alert(`✅ ${this.events.length} événements chargés`);
    } else {
      alert('❌ Aucun événement chargé');
    }
  }
  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;

  // Animations
  hoveredEventId: number | null = null;

  // Statistiques en temps réel
  totalEvents = 0;
  availablePlaces = 0;
  popularCategories: { name: string; count: number; color: string }[] = [];

  constructor(
    private eventService: EventService,
    public authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    console.log('🟢 ngOnInit appelé - Début du chargement');
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    console.log('🟡 Chargement des événements...');

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        console.log('🟢 Événements reçus:', events);

        // Enrichir les événements avec des valeurs par défaut
        this.events = events.map(event => ({
          ...event,
          // Ajouter des propriétés manquantes avec des valeurs par défaut
          status: event.status || 'UPCOMING',  // Par défaut UPCOMING
          registeredCount: event.registeredCount || Math.floor(Math.random() * 30) + 10, // Valeur aléatoire entre 10 et 40
          price: event.price || 0, // Prix par défaut
          organizer: event.organizer || { name: 'Organisateur', email: 'contact@example.com' },
          tags: event.tags || [event.type?.toLowerCase() || 'evenement'],
          rating: event.rating || 4.5,
          category: event.category || event.type || 'Autre'
        }));

        console.log('✅ Événements enrichis:', this.events);

        // NE PAS FILTRER PAR STATUS - garder tous les événements
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('🔴 Erreur chargement:', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    // Événements en vedette (les mieux notés)
    this.featuredEvents = this.events
      .filter(e => e.rating && e.rating > 4.5)
      .slice(0, 3);

    // Événements populaires (plus d'inscriptions)
    this.popularEvents = [...this.events]
      .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
      .slice(0, 6);

    // Statistiques globales
    this.totalEvents = this.events.length;
    this.availablePlaces = this.events.reduce(
      (sum, e) => sum + (e.capacity - (e.registeredCount || 0)), 0
    );

    // Catégories populaires
    const categoryCount = this.events.reduce((acc: any, e) => {
      const cat = e.category || e.type || 'Autre';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    this.popularCategories = Object.entries(categoryCount)
      .map(([name, count], index) => ({
        name,
        count: count as number,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  applyFilters(): void {
    let filtered = [...this.events];

    // Recherche textuelle
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
e.location?.toLowerCase().includes(term)

      );
    }

    // Filtre par catégories
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(e =>
        this.selectedCategories.includes(e.category || e.type || '')
      );
    }

    // Filtre par types
    if (this.selectedTypes.length > 0) {
      filtered = filtered.filter(e => this.selectedTypes.includes(e.type));
    }

    // Filtre par prix
    filtered = filtered.filter(e =>
      (e.price || 0) >= this.priceRange[0] &&
      (e.price || 0) <= this.priceRange[1]
    );

    // Filtre par lieu
    if (this.selectedLocation) {
      filtered = filtered.filter(e => e.location === this.selectedLocation);
    }

    // Filtre par date
    const now = new Date();
    if (this.selectedDate === 'today') {
      filtered = filtered.filter(e =>
        new Date(e.startDate).toDateString() === now.toDateString()
      );
    } else if (this.selectedDate === 'week') {
      const nextWeek = new Date(now.setDate(now.getDate() + 7));
      filtered = filtered.filter(e => new Date(e.startDate) <= nextWeek);
    } else if (this.selectedDate === 'month') {
      const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
      filtered = filtered.filter(e => new Date(e.startDate) <= nextMonth);
    }

    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPaginatedEvents(): appEvent[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents.slice(start, end);
  }

  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.applyFilters();
  }

  toggleType(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index === -1) {
      this.selectedTypes.push(type);
    } else {
      this.selectedTypes.splice(index, 1);
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedTypes = [];
    this.priceRange = [0, 1000];
    this.selectedDate = 'all';
    this.selectedLocation = '';
    this.applyFilters();
  }

  viewEventDetails(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  quickRegister(event: appEvent): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/events/${event.eventId}` }
      });
      return;
    }

    // Simulation d'inscription rapide
    alert(`Inscription rapide à "${event.title}" !`);
    // Logique d'inscription réelle à implémenter
  }

  getAvailabilityClass(event: appEvent): string {
    const ratio = (event.registeredCount || 0) / (event.capacity || 1);
    if (ratio >= 0.9) return 'critical';
    if (ratio >= 0.7) return 'warning';
    return 'good';
  }

  getAvailabilityText(event: appEvent): string {
    const available = (event.capacity || 0) - (event.registeredCount || 0);
    if (available <= 0) return 'Complet';
    if (available <= 5) return `Plus que ${available} places !`;
    return `${available} places disponibles`;
  }

  formatPrice(price?: number): string {
    if (!price || price === 0) return 'Gratuit';
    return price + ' TND';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Développement': '#3b82f6',
      'Design': '#ec4899',
      'Marketing': '#f59e0b',
      'Management': '#8b5cf6',
      'Data Science': '#10b981',
      'IA': '#ef4444'
    };
    return colors[category] || '#6b7280';
  }
}
