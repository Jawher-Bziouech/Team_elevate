// ticket-detail.component.ts
/*import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Ticket } from '../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  ticketId!: number;
  ticket: Ticket | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ticketId = +params['id'];
      this.loadTicket();
    });
  }

  loadTicket(): void {
    this.loading = true;
    this.ticketService.getTicketById(this.ticketId).subscribe({
      next: (data) => {
        this.ticket = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de charger le ticket';
        this.loading = false;
      }
    });
  }

  closeTicket(): void {
    if (confirm('Voulez-vous fermer ce ticket ?')) {
      this.ticketService.closeTicket(this.ticketId).subscribe({
        next: () => {
          alert('Ticket fermé avec succès');
          this.loadTicket();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la fermeture');
        }
      });
    }
  }

  goBack(): void {
    const role = this.authService.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin-tickets']);
    } else {
      this.router.navigate(['/my-tickets']);
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'OPEN': return 'badge bg-warning';
      case 'IN_PROGRESS': return 'badge bg-info';
      case 'RESOLVED': return 'badge bg-success';
      case 'CLOSED': return 'badge bg-secondary';
      default: return 'badge bg-light';
    }
  }
 // Dans ticket-detail.component.ts

}





// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-dashboard',
  templateUrl: './ticket-dashboard.component.html',
  styleUrls: ['./ticket-dashboard.component.css']
})
export class TicketDashboardComponent implements OnInit {
  stats: any = {};
  responseTimes: any[] = [];
  loading = true;
  
  // Chart data
  categoryChartData: any[] = [];
  adminChartData: any[] = [];
  
  constructor(private ticketService: TicketService) {}
  
  ngOnInit() {
    this.loadStats();
    this.loadResponseTimes();
  }
  
  loadStats() {
    this.ticketService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
        this.loading = false;
      }
    });
  }
  
  loadResponseTimes() {
    this.ticketService.getResponseTimeStats().subscribe({
      next: (data) => {
        this.responseTimes = data;
      }
    });
  }
  
  prepareChartData() {
    // Données pour le graphique par catégorie
    this.categoryChartData = Object.keys(this.stats.averageResponseTimeByCategory || {}).map(key => ({
      name: key,
      value: Math.round(this.stats.averageResponseTimeByCategory[key])
    }));
    
    // Données pour le graphique par admin
    this.adminChartData = Object.keys(this.stats.averageResponseTimeByAdmin || {}).map(key => ({
      name: key,
      value: Math.round(this.stats.averageResponseTimeByAdmin[key])
    }));
  }
  
  getStatusClass(status: string): string {
    const classes: any = {
      'OPEN': 'badge-open',
      'IN_PROGRESS': 'badge-progress',
      'RESOLVED': 'badge-resolved',
      'CLOSED': 'badge-closed'
    };
    return classes[status] || '';
  }
  
  formatMinutes(minutes: number): string {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}*/