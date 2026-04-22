/*import { Component, OnInit } from '@angular/core';
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
*/

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
  totalTickets: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  
  // Statistiques par statut
  ticketsByStatus: { [key: string]: number } = {};
  
  // Filtres
  filters = {
    startDate: '',
    endDate: '',
    ticketId: null as number | null,
    trainerName: '',
    status: ''
  };
  
  // UI States
  loading: boolean = false;
  error: string | null = null;
  showFilters: boolean = true;
  isRefreshing: boolean = false;
  currentDate: Date = new Date();
  
  // Labels pour les statuts
  private statusLabels: { [key: string]: string } = {
    'OPEN': 'Ouvert',
    'IN_PROGRESS': 'En cours',
    'RESOLVED': 'Résolu',
    'CLOSED': 'Fermé'
  };

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
    this.loadStatistics();
  }

  // Chargement des tickets
  loadTickets() {
    this.loading = true;
    this.error = null;
    
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
        this.totalTickets = response.totalElements;
        this.loading = false;
        this.isRefreshing = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement:', error);
        this.error = 'Erreur lors du chargement des tickets';
        this.loading = false;
        this.isRefreshing = false;
      }
    });
  }

  // Chargement des statistiques
  loadStatistics() {
    this.ticketService.getAllTickets().subscribe({
      next: (tickets: Ticket[]) => {
        this.ticketsByStatus = {
          'OPEN': tickets.filter((t: Ticket) => t.status === 'OPEN').length,
          'IN_PROGRESS': tickets.filter((t: Ticket) => t.status === 'IN_PROGRESS').length,
          'RESOLVED': tickets.filter((t: Ticket) => t.status === 'RESOLVED').length,
          'CLOSED': tickets.filter((t: Ticket) => t.status === 'CLOSED').length
        };
      },
      error: (error: any) => console.error('Erreur stats:', error)
    });
  }

  // Filtres
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

  filterByStatus(status: string) {
    if (status === 'ALL') {
      this.resetFilters();
    } else {
      this.filters.status = status;
      this.applyFilters();
    }
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.startDate || this.filters.endDate || 
              this.filters.ticketId || this.filters.trainerName || 
              this.filters.status);
  }

  // Pagination
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
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Actions sur les tickets
  respond(ticketId: number) {
    const response = this.responseText[ticketId]?.trim();
    if (!response) {
      alert('Veuillez entrer une réponse');
      return;
    }

    this.ticketService.respondToTicket(ticketId, response).subscribe({
      next: () => {
        alert('Réponse envoyée avec succès');
        this.responseText[ticketId] = '';
        this.loadTickets();
        this.loadStatistics();
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
      this.ticketService.editResponse(ticket.ticketId!, newResponse).subscribe({
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
      this.ticketService.resolveTicket(ticket.ticketId!, resolution).subscribe({
        next: () => {
          alert('Ticket résolu avec succès');
          this.loadTickets();
          this.loadStatistics();
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
      this.ticketService.closeTicket(ticketId).subscribe({
        next: () => {
          alert('Ticket fermé avec succès');
          this.loadTickets();
          this.loadStatistics();
        },
        error: (error: any) => {
          console.error('Erreur fermeture:', error);
          alert('Erreur lors de la fermeture');
        }
      });
    }
  }

  // Utilitaires
  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
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