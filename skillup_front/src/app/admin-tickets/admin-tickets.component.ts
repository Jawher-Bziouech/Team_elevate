import { Component, OnInit } from '@angular/core';
import { TicketService } from '../ticket.service';
import { Ticket } from '../models/ticket.model';

@Component({
  selector: 'app-admin-tickets',
  templateUrl: './admin-tickets.component.html',
  styleUrls: ['./admin-tickets.component.css']
})
export class AdminTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  responseText: { [key: number]: string } = {};
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  Math = Math;
  
  // Filtres
  filters = {
    startDate: '',
    endDate: '',
    ticketId: null as number | null,
    trainerName: '',
    status: ''
  };
  
  statusOptions: string[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getAllTicketsPaginated(
      this.currentPage, 
      this.pageSize,
      {
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        ticketId: this.filters.ticketId || undefined,
        trainerName: this.filters.trainerName || undefined,
        status: this.filters.status || undefined
      }
    ).subscribe({
      next: (response: any) => {
        this.tickets = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
      },
      error: (error: any) => {
        console.error('Erreur chargement:', error);
        alert('Erreur lors du chargement des tickets');
      }
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadTickets();
  }

  resetFilters() {
    this.filters = {
      startDate: '',
      endDate: '',
      ticketId: null,
      trainerName: '',
      status: ''
    };
    this.currentPage = 0;
    this.loadTickets();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadTickets();
  }

  onPageSizeChange(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 0;
    this.loadTickets();
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i);
  }

  respond(ticketId: number) {
    if (!this.responseText[ticketId] || this.responseText[ticketId].trim() === '') {
      alert('Veuillez entrer une réponse');
      return;
    }

    this.ticketService.respondToTicket(ticketId, this.responseText[ticketId])
      .subscribe({
        next: () => {
          alert('Réponse envoyée avec succès');
          this.responseText[ticketId] = '';
          this.loadTickets();
        },
        error: (error: any) => {
          console.error('Erreur réponse:', error);
          alert('Erreur lors de l\'envoi de la réponse');
        }
      });
  }

  editResponse(ticket: Ticket) {
    const newResponse = prompt('Modifier votre réponse:', ticket.adminResponse);
    if (newResponse && newResponse !== ticket.adminResponse) {
      this.ticketService.editResponse(ticket.ticketId!, newResponse)
        .subscribe({
          next: () => {
            alert('Réponse modifiée avec succès');
            this.loadTickets();
          },
          error: (error: any) => {
            console.error('Erreur modification:', error);
            alert(error.error || 'Erreur lors de la modification');
          }
        });
    }
  }

  resolveTicket(ticket: Ticket) {
    const resolution = prompt('Description de la résolution:');
    if (resolution) {
      this.ticketService.resolveTicket(ticket.ticketId!, resolution)
        .subscribe({
          next: () => {
            alert('Ticket résolu avec succès');
            this.loadTickets();
          },
          error: (error: any) => {
            console.error('Erreur résolution:', error);
            alert('Erreur lors de la résolution');
          }
        });
    }
  }

  closeTicket(ticketId: number) {
    if (confirm('Êtes-vous sûr de vouloir fermer ce ticket ?')) {
      this.ticketService.closeTicket(ticketId)
        .subscribe({
          next: () => {
            alert('Ticket fermé avec succès');
            this.loadTickets();
          },
          error: (error: any) => {
            console.error('Erreur fermeture:', error);
            alert('Erreur lors de la fermeture');
          }
        });
    }
  }
}