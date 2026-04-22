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

}*/
