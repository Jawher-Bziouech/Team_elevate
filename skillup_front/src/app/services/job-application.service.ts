import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication } from '../models/job-application.model';

@Injectable({
    providedIn: 'root'
})
export class JobApplicationService {
    private apiUrl = 'http://localhost:8083/api/applications';

    constructor(private http: HttpClient) { }

    getAll(): Observable<JobApplication[]> {
        return this.http.get<JobApplication[]>(this.apiUrl);
    }

    submit(applicationData: FormData): Observable<any> {
        return this.http.post(this.apiUrl, applicationData);
    }

    downloadCv(id: number): void {
        window.open(`${this.apiUrl}/cv/${id}`, '_blank');
    }
}
