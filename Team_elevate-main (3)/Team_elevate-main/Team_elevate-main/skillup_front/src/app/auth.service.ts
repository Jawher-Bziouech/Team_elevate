import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type Plan = 'FREE' | 'BASIC' | 'PRO';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:9090/users';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, credentials, { responseType: 'text' })
      .pipe(tap(token => localStorage.setItem('token', token)));
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private decodePayload(): any {
    const token = this.getToken();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
  }

  getRole(): string | null     { return this.decodePayload()?.role  ?? null; }
  getUserId(): number | null   { return this.decodePayload()?.id    ?? null; }
  getUsername(): string | null { return this.decodePayload()?.sub   ?? null; }
  getPlan(): Plan              { return (this.decodePayload()?.plan as Plan) ?? 'FREE'; }

  isLoggedIn(): boolean { return !!this.getToken(); }
  isAdmin(): boolean    { return this.getRole() === 'ADMIN'; }
  isTrainee(): boolean  { return this.getRole() === 'TRAINEE'; }
  isCompany(): boolean  { return this.getRole() === 'COMPANY'; }
  hasRole(role: string): boolean { return this.getRole() === role; }
  isPro(): boolean      { return this.getPlan() === 'PRO'; }
  isBasic(): boolean    { return this.getPlan() === 'BASIC'; }
  canSeePhone(): boolean { return this.isPro(); }
  canSeeEmail(): boolean { return this.isBasic() || this.isPro(); }

  upgradePlan(plan: Plan): Observable<string> {
    const id = this.getUserId();
    return this.http.put(`${this.apiUrl}/${id}/upgrade-plan`, null,
      { params: { plan }, responseType: 'text' }
    ).pipe(tap(newToken => localStorage.setItem('token', newToken)));
  }

  cancelPlan(): Observable<string> {
    const id = this.getUserId();
    return this.http.put(`${this.apiUrl}/${id}/cancel-plan`, null,
      { responseType: 'text' }
    ).pipe(tap(newToken => localStorage.setItem('token', newToken)));
  }
   getEmail(): string | null {
    return localStorage.getItem('userEmail') || this.extractEmailFromToken(this.getToken() || '');
  }
   private extractEmailFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || payload.sub || null;
    } catch (e) {
      return null;
    }
  }
   getCompleteEmail(): string {
    const email = this.getEmail();
    const username = this.getUsername();
    
    console.log('🔍 getEmail():', email);
    console.log('🔍 getUsername():', username);
    
    if (email && email.includes('@')) {
      return email;
    }
    if (username) {
      if (!username.includes('@')) {
        if (username === 'rania') {
          return 'rania.regei@esprit.tn';
        }
        return username + '@esprit.tn';
      }
      return username;
    }
    return 'user@test.com';
  }
 isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id,
        username: payload.sub,
        email: payload.email || payload.sub,
        role: payload.role
      };
    } catch (e) {
      return null;
    }
  }
}
