import { Component, OnInit } from '@angular/core';
import { TicketService } from '../ticket.service';
import { Ticket } from '../models/ticket.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-tickets',
  templateUrl: './user-tickets.component.html',
  styleUrls: ['./user-tickets.component.css']
})
export class UserTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private ticketService: TicketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.loading = true;
    this.error = null;
    
    this.ticketService.getMyTickets().subscribe({
      next: (data) => {
        console.log('Tickets chargés:', data);
        this.tickets = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement tickets:', error);
        this.error = 'Erreur lors du chargement de vos tickets';
        this.loading = false;
        
        // Vérifier si l'utilisateur est connecté
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  closeTicket(ticketId: number) {
    if (confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) {
      this.ticketService.closeTicket(ticketId).subscribe({
        next: () => {
          alert('Ticket fermé avec succès');
          this.loadTickets();
        },
        error: (error) => {
          console.error('Erreur fermeture:', error);
          alert('Erreur lors de la fermeture du ticket');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }
}