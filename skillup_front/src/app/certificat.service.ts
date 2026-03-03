import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificat } from './models/certificat.model';

@Injectable({
  providedIn: 'root'
})
export class CertificatService {
  private apiUrl = 'http://localhost:9090/certificats'; // Gateway URL

  constructor(private http: HttpClient) { }

  // Get all certificates
  getAll(): Observable<Certificat[]> {
    return this.http.get<Certificat[]>(this.apiUrl);
  }

  // Get certificates for a specific user
  getByUserId(userId: number): Observable<Certificat[]> {
    return this.http.get<Certificat[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get certificates by status (PENDING, APPROVED, REJECTED)
  getByStatus(status: string): Observable<Certificat[]> {
    return this.http.get<Certificat[]>(`${this.apiUrl}/status/${status}`);
  }

  // Submit a new certificate request (status defaults to PENDING in backend)
  requestCertificat(certificat: Certificat): Observable<Certificat> {
    return this.http.post<Certificat>(this.apiUrl, certificat);
  }

  // Admin: Approve a certificate request
  approve(id: number): Observable<Certificat> {
    return this.http.put<Certificat>(`${this.apiUrl}/${id}/approve`, {});
  }

  // Admin: Reject a certificate request
  reject(id: number): Observable<Certificat> {
    return this.http.put<Certificat>(`${this.apiUrl}/${id}/reject`, {});
  }

  // Delete a certificate
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
    // Get user info via OpenFeign (backend calls User microservice)
  getUserInfo(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user-info/${userId}`);
  }
}