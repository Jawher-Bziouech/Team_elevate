import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   apiUrl = 'http://localhost:8024/users'; 
  // private apiUrl = 'http://localhost:9090/users';

  constructor(private http: HttpClient) { }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, credentials, { responseType: 'text' })
      .pipe(
        tap(token => {
          localStorage.setItem('token', token); // Store the "Badge" in the browser
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token'); // Throw away the badge
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isTrainee(): boolean {
    return this.getRole() === 'TRAINEE';
  }
  getUserId(): number | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || null; // This matches the "id" claim we added in Java
  } catch (e) {
    return null;
  }
}
getUsername(): string | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null; // "sub" is the standard JWT field for username
  } catch (e) {
    return null;
  }
}

}