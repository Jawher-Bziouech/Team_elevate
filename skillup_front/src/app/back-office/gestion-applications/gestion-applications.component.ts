import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from '../../services/job-application.service';
import { JobApplication } from '../../models/job-application.model';

@Component({
    selector: 'app-gestion-applications',
    templateUrl: './gestion-applications.component.html',
    styleUrls: ['./gestion-applications.component.css']
})
export class GestionApplicationsComponent implements OnInit {
    applications: JobApplication[] = [];
    loading = true;
    selectedApp: JobApplication | null = null;

    constructor(private jobApplicationService: JobApplicationService) { }

    ngOnInit(): void {
        this.loadApplications();
    }

    loadApplications(): void {
        this.loading = true;
        this.jobApplicationService.getAll().subscribe({
            next: (data) => {
                this.applications = data || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading applications:', err);
                this.loading = false;
            }
        });
    }

    viewDetails(app: JobApplication): void {
        this.selectedApp = app;
    }

    closeDetails(): void {
        this.selectedApp = null;
    }

    downloadCv(app: JobApplication): void {
        if (app.cvFilePath) {
            this.jobApplicationService.downloadCv(app.id);
        }
    }

    getInitials(name: string): string {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    }

    formatDate(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatTime(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
}
