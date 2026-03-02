/*import { Component, OnInit } from '@angular/core';
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
*/import { Component, OnInit } from '@angular/core';
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
  
  // Gestion des évaluations
  ratingValue: { [key: number]: number } = {};
  hoverRating: { [key: number]: number } = {};
  ratingComment: { [key: number]: string } = {};
  isSubmittingRating: { [key: number]: boolean } = {};

  // Labels pour les statuts
  private statusLabels: { [key: string]: string } = {
    'OPEN': 'Ouvert',
    'IN_PROGRESS': 'En cours',
    'RESOLVED': 'Résolu',
    'CLOSED': 'Fermé'
  };

  // Labels pour les notes
  private ratingLabels: { [key: number]: string } = {
    1: 'Très insatisfait',
    2: 'Insatisfait',
    3: 'Moyen',
    4: 'Satisfait',
    5: 'Très satisfait'
  };

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
        
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Retourne les tickets par statut
  getTicketsByStatus(status: string): Ticket[] {
    return this.tickets.filter(t => t.status === status);
  }

  // Retourne le label du statut
  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  // Retourne le label de la note
  getRatingLabel(rating: number): string {
    return this.ratingLabels[rating] || '';
  }

  // Retourne la classe CSS pour le statut
  getStatusClass(status: string): string {
    switch(status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }

  // Définit la note sélectionnée
  setRating(ticketId: number, rating: number) {
    this.ratingValue[ticketId] = rating;
  }

  // Soumet l'évaluation
  submitRating(ticketId: number) {
    const rating = this.ratingValue[ticketId];
    if (!rating) {
      this.showNotification('Veuillez sélectionner une note', 'warning');
      return;
    }

    this.isSubmittingRating[ticketId] = true;
    const comment = this.ratingComment[ticketId] || '';

    this.ticketService.rateTicket(ticketId, rating, comment).subscribe({
      next: () => {
        this.showNotification('Merci pour votre évaluation !', 'success');
        this.isSubmittingRating[ticketId] = false;
        this.loadTickets(); // Recharger pour afficher l'évaluation
      },
      error: (error) => {
        console.error('Erreur évaluation:', error);
        this.showNotification('Erreur lors de l\'envoi de l\'évaluation', 'error');
        this.isSubmittingRating[ticketId] = false;
      }
    });
  }

  // Fermer un ticket
  closeTicket(ticketId: number) {
    if (confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) {
      this.ticketService.closeTicket(ticketId).subscribe({
        next: () => {
          this.showNotification('Ticket fermé avec succès', 'success');
          this.loadTickets();
        },
        error: (error) => {
          console.error('Erreur fermeture:', error);
          this.showNotification('Erreur lors de la fermeture du ticket', 'error');
        }
      });
    }
  }

  // Affiche une notification (vous pouvez remplacer par votre système de toast)
  private showNotification(message: string, type: 'success' | 'error' | 'warning') {
    // Pour l'instant, on utilise alert
    alert(message);
    // Idéalement, utilisez un système de toast comme ngx-toastr
  }
}