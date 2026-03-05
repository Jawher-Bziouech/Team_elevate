import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentRequest, PaymentStats, PageResponse } from './models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private apiUrl = 'http://localhost:8075/api/payments'; // URL de votre backend

  constructor(private http: HttpClient) {}

  // 1. Récupérer tous les paiements (avec pagination)
  getAllPayments(page: number = 0, size: number = 10): Observable<PageResponse<Payment>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'paymentDate')
      .set('sortDir', 'desc');

    return this.http.get<PageResponse<Payment>>(this.apiUrl, { params });
  }

  // 2. Récupérer un paiement par ID
  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  // 3. Créer un nouveau paiement
  createPayment(payment: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  // 4. Mettre à jour le statut
  updatePaymentStatus(id: number, status: string): Observable<Payment> {
    let params = new HttpParams().set('status', status);
    return this.http.patch<Payment>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  // 5. Supprimer un paiement
  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 6. Rechercher des paiements
  searchPayments(searchTerm: string, page: number = 0, size: number = 10): Observable<PageResponse<Payment>> {
    let params = new HttpParams()
      .set('q', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Payment>>(`${this.apiUrl}/search`, { params });
  }

  // 7. Récupérer les paiements d'un utilisateur
  getPaymentsByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<Payment>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Payment>>(`${this.apiUrl}/user/${userId}`, { params });
  }

  // 8. Récupérer les statistiques
  getStats(): Observable<PaymentStats> {
    return this.http.get<PaymentStats>(`${this.apiUrl}/stats`);
  }

  // 9. Test de connexion
  ping(): Observable<string> {
    return this.http.get(`${this.apiUrl}/ping`, { responseType: 'text' });
  }
}