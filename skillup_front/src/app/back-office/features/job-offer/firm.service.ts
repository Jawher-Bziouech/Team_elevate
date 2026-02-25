import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Firm {
  id: number;
  nom: string;
  specialite: string;
}

@Injectable({ providedIn: 'root' })
export class FirmService {
  private apiUrl = 'http://localhost:8083/api/firms';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Firm[]> {
    return this.http.get<Firm[]>(this.apiUrl);
  }
}
