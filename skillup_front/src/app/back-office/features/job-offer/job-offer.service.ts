import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer, JobOfferRequest, IndustryCount } from '../../../models/job-offer.model';

@Injectable({ providedIn: 'root' })
export class JobOfferService {
  private apiUrl = 'http://localhost:8083/api/joboffers'; // Direct to your microservice

  constructor(private http: HttpClient) { }

  getAll(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl);
  }
  getJobCountByIndustry(): Observable<IndustryCount[]> {
    return this.http.get<IndustryCount[]>(`${this.apiUrl}/stats/byIndustry`);
  }

  getById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`);
  }

  create(request: JobOfferRequest): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, request);
  }

  update(id: number, request: JobOfferRequest): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchByCompany(company: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search/byCompany?company=${company}`);
  }

  searchByIndustry(industry: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search/byIndustry?industry=${industry}`);
  }

  searchByLocation(location: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search/byLocation?location=${location}`);
  }

  searchBySalaryRange(min: string, max: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search/bySalaryRange?min=${min}&max=${max}`);
  }

  // NEW: Combined search with optional parameters
  searchAll(company?: string, industry?: string, location?: string, minSalary?: number, maxSalary?: number): Observable<JobOffer[]> {
    let params = new HttpParams();
    if (company) params = params.set('company', company);
    if (industry) params = params.set('industry', industry);
    if (location) params = params.set('location', location);
    if (minSalary != null) params = params.set('minSalary', minSalary.toString());
    if (maxSalary != null) params = params.set('maxSalary', maxSalary.toString());
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search/all`, { params });
  }
}
