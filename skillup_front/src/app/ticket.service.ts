import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Ticket } from './models/ticket.model';
import { tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  
  private apiUrl = 'http://localhost:9090/tickets';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  createTicket(ticket: Ticket): Observable<Ticket> {
    const ticketData = {
      description: ticket.description,
      category: ticket.category,
      createdBy: this.authService.getUserId(),
      createdByRole: this.authService.getRole(),
      createdByName: this.authService.getUsername()
    };
    return this.http.post<Ticket>(this.apiUrl, ticketData);
  }

  getMyTickets(): Observable<Ticket[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Ticket[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(tickets => {
        // Vérifier s'il y a des tickets avec des nouvelles réponses
        const ticketsWithResponses = tickets.filter(t => t.adminResponse);
        if (ticketsWithResponses.length > 0) {
          console.log('Tickets avec réponses chargés:', ticketsWithResponses.length);
        }
      })
    );
  }

  getAllTicketsPaginated(
    page: number = 0, 
    size: number = 10, 
    filters?: {
      startDate?: string,
      endDate?: string,
      ticketId?: number,
      trainerName?: string,
      status?: string
    }
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.ticketId) params = params.set('ticketId', filters.ticketId.toString());
      if (filters.trainerName) params = params.set('trainerName', filters.trainerName);
      if (filters.status) params = params.set('status', filters.status);
    }
    
    return this.http.get<any>(`${this.apiUrl}/admin/all`, { params });
  }

  respondToTicket(ticketId: number, response: string): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/respond?adminId=${this.authService.getUserId()}&adminName=${this.authService.getUsername()}`,
      { response: response }
    );
  }

  editResponse(ticketId: number, newResponse: string): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}/${ticketId}/edit-response?adminId=${this.authService.getUserId()}`,
      newResponse
    );
  }

  resolveTicket(ticketId: number, resolution: string): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/resolve?userId=${this.authService.getUserId()}&userRole=${this.authService.getRole()}`,
      resolution
    );
  }

  closeTicket(ticketId: number): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/close?userId=${this.authService.getUserId()}&userRole=${this.authService.getRole()}`,
      {}
    );
  }
}