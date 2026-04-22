import { Component, OnInit } from '@angular/core';
import { InternshipApplication, InternshipService } from '../services/internship.service';

interface MyApplicationView extends InternshipApplication {
  internshipTitle?: string;
  companyName?: string;
}

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: MyApplicationView[] = [];
  loading = false;
  errorMessage = '';

  constructor(private internshipService: InternshipService) { }

  ngOnInit(): void {
    this.loadMyApplications();
  }

  loadMyApplications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.internshipService.getMyApplications().subscribe({
      next: (items) => {
        this.applications = items.map((item) => {
          const raw = item as InternshipApplication & {
            internshipTitle?: string;
            offerTitle?: string;
            companyName?: string;
          };

          return {
            ...item,
            status: item.status ?? 'PENDING',
            internshipTitle: raw.internshipTitle ?? raw.offerTitle ?? `Offer #${item.internshipOfferId}`,
            companyName: raw.companyName ?? '-'
          };
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load your applications.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'text-bg-warning';
      case 'ACCEPTED':
      case 'ACCEPTED_BY_COMPANY':
        return 'text-bg-success';
      case 'REJECTED':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  downloadCertificate(): void {
    alert('Certificate download will be implemented');
  }
}

