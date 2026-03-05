/*import { Injectable } from '@angular/core';
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
  rateTicket(ticketId: number, rating: { stars: number, comment: string }): Observable<any> {
    const trainerId = this.authService.getUserId();
    const trainerName = this.authService.getUsername();
    return this.http.post<any>(
      `${this.apiUrl}/${ticketId}/rate?trainerId=${trainerId}&trainerName=${trainerName}`,
      rating
    );
  }

  getTicketRating(ticketId: number, trainerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${ticketId}/rating?trainerId=${trainerId}`);
  }

  getAllTicketRatings(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${ticketId}/ratings`);
  }

  deleteRating(ratingId: number): Observable<void> {
    const trainerId = this.authService.getUserId();
    return this.http.delete<void>(`${this.apiUrl}/ratings/${ratingId}?trainerId=${trainerId}`);
  }

  getTrainerTicketsForRating(): Observable<Ticket[]> {
    const trainerId = this.authService.getUserId();
    return this.http.get<Ticket[]>(`${this.apiUrl}/trainer/${trainerId}/for-rating`);
  }
   uploadAttachments(ticketId: number, files: File[]): Observable<any[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post<any[]>(`${this.apiUrl}/${ticketId}/attachments`, formData);
  }

  getAttachments(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${ticketId}/attachments`);
  }

  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    const userId = this.authService.getUserId();
    return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}?userId=${userId}`);
  }
   getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  getResponseTimeStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/stats/response-times`);
  }
  downloadFile(attachment: any) {
    this.downloadAttachment(attachment.attachmentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement:', err);
        alert('Erreur lors du téléchargement du fichier');
      }
    });
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📎';
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
}*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Ticket, RatingRequest } from './models/ticket.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:9090/tickets';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Créer un ticket (sans fichiers)
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

  // Évaluer un ticket
  rateTicket(ticketId: number, rating: number, comment?: string): Observable<Ticket> {
    const body = { 
      rating: rating, 
      comment: comment || '' 
    };
    
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/rate?userId=${this.authService.getUserId()}&userRole=${this.authService.getRole()}`,
      body
    );
  }

  // Récupérer mes tickets
  getMyTickets(): Observable<Ticket[]> {
    const userId = this.authService.getUserId();
    return this.http.get<Ticket[]>(`${this.apiUrl}/user/${userId}`);
  }
getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/admin/all-simple`);
  }
  // Récupérer tous les tickets (admin) avec pagination
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

  // Répondre à un ticket (admin)
  respondToTicket(ticketId: number, response: string): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/respond?adminId=${this.authService.getUserId()}&adminName=${this.authService.getUsername()}`,
      { response: response }
    );
  }

  // Modifier une réponse (admin)
  editResponse(ticketId: number, newResponse: string): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}/${ticketId}/edit-response?adminId=${this.authService.getUserId()}`,
      newResponse
    );
  }

  // Résoudre un ticket
  resolveTicket(ticketId: number, resolution: string): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/resolve?userId=${this.authService.getUserId()}&userRole=${this.authService.getRole()}`,
      resolution
    );
  }

  // Fermer un ticket
  closeTicket(ticketId: number): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.apiUrl}/${ticketId}/close?userId=${this.authService.getUserId()}&userRole=${this.authService.getRole()}`,
      {}
    );
  }
}