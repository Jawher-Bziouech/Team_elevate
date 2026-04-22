import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ApplicationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ACCEPTED_BY_COMPANY'
  | 'REJECTED';

export interface InternshipOffer {
  id: number;
  title: string;
  description: string;
  requiredSkills: string;
  requiredStudyLevel: string;
  startDate: string;
  endDate: string;
  location: string;
  remuneration?: string;
  supervisorName: string;
  companyUserId: number;
  companyName?: string;
  publishDate: string;
  expiryDate: string;
  active: boolean;
}

export interface InternshipOfferRequest {
  title: string;
  description: string;
  requiredSkills: string;
  requiredStudyLevel: string;
  startDate: string;
  endDate: string;
  location: string;
  remuneration?: string;
  supervisorName: string;
  expiryDate: string;
  active?: boolean;
}

export interface InternshipApplication {
  id: number;
  internshipOfferId: number;
  studentUserId: number;
  studentName?: string;
  cvFileName: string;
  motivationLetter: string;
  applicationDate: string;
  status: ApplicationStatus;
  evaluationGrade?: number | null;
  offerTitle?: string;
  companyName?: string;
}

export interface ChatMessage {
  id: number;
  applicationId: number;
  senderId: number;
  content: string;
  timestamp: string;
}

export interface InternshipApplicationRequest {
  cvData: string;
  cvFileName: string;
  motivationLetter: string;
  studentUserId?: number;
}

export interface EvaluationRequest {
  grade: number;
  comment: string;
}

export interface EvaluationResponse {
  id: number;
  internshipApplicationId: number;
  grade: number;
  comment: string;
  evaluationDate: string;
}

export interface AdminStats {
  [key: string]: number | string | boolean | null;
}

export interface AdminInternshipStats {
  totalInternships: number;
  totalApplications: number;
  pendingApprovals: number;
  averageGrade: number;
  totalEvaluations: number;
}

@Injectable({
  providedIn: 'root'
})
export class InternshipService {
  private readonly baseUrl = 'http://localhost:9090/api';

  constructor(private http: HttpClient) { }

  getInternships(): Observable<InternshipOffer[]> {
    return this.http.get<InternshipOffer[]>(`${this.baseUrl}/internships`);
  }

  getInternshipById(id: number): Observable<InternshipOffer> {
    return this.http.get<InternshipOffer>(`${this.baseUrl}/internships/${id}`);
  }

  createInternship(data: InternshipOfferRequest): Observable<InternshipOffer> {
    return this.http.post<InternshipOffer>(`${this.baseUrl}/internships`, data);
  }

  updateInternship(id: number, data: Partial<InternshipOfferRequest>): Observable<InternshipOffer> {
    return this.http.put<InternshipOffer>(`${this.baseUrl}/internships/${id}`, data);
  }

  deleteInternship(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/internships/${id}`);
  }

  applyToInternship(offerId: number, data: InternshipApplicationRequest): Observable<InternshipApplication> {
    return this.http.post<InternshipApplication>(`${this.baseUrl}/internships/${offerId}/apply`, data);
  }

  getMyApplications(): Observable<InternshipApplication[]> {
    return this.http.get<InternshipApplication[]>(`${this.baseUrl}/internship-applications/my`);
  }

  getMyOffers(): Observable<InternshipOffer[]> {
    return this.http.get<InternshipOffer[]>(`${this.baseUrl}/internships/my-offers`);
  }

  getApplicationsByOfferUrl(offerId: number): string {
    return `${this.baseUrl}/internships/${offerId}/applications`;
  }

  getApplicationsByOffer(offerId: number): Observable<InternshipApplication[]> {
    return this.http.get<InternshipApplication[]>(this.getApplicationsByOfferUrl(offerId));
  }

  acceptByCompany(appId: number): Observable<InternshipApplication> {
    return this.http.put<InternshipApplication>(`${this.baseUrl}/internship-applications/${appId}/accept-company`, {});
  }

  rejectApplication(appId: number): Observable<InternshipApplication> {
    return this.http.put<InternshipApplication>(`${this.baseUrl}/internship-applications/${appId}/reject`, {});
  }

  submitEvaluation(appId: number, data: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(`${this.baseUrl}/internship-applications/${appId}/evaluate`, data);
  }

  parseResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/internships/resume/parse`, formData);
  }

  updateInternshipAdmin(id: number, data: Partial<InternshipOfferRequest>): Observable<InternshipOffer> {
    return this.http.put<InternshipOffer>(`${this.baseUrl}/admin/internships/${id}`, data);
  }

  deleteInternshipAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/internships/${id}`);
  }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/admin/stats`);
  }

  getAdminInternshipStats(): Observable<AdminInternshipStats> {
    return this.http.get<AdminInternshipStats>(`${this.baseUrl}/admin/stats/internships`);
  }

  getAllInternshipsAdmin(): Observable<InternshipOffer[]> {
    return this.http.get<InternshipOffer[]>(`${this.baseUrl}/admin/internships`);
  }

  getAllApplicationsAdmin(): Observable<InternshipApplication[]> {
    return this.http.get<InternshipApplication[]>(`${this.baseUrl}/admin/internship-applications`);
  }

  getChatMessages(applicationId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/internship-applications/${applicationId}/chat`);
  }

  sendChatMessage(applicationId: number, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/internship-applications/${applicationId}/chat`, { content });
  }
}
