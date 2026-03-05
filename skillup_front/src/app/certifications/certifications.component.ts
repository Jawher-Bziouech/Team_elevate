import { Component, OnInit } from '@angular/core';
import { CertificatService } from '../certificat.service';
import { AuthService } from '../auth.service';
import { Certificat } from '../models/certificat.model';

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.css']
})
export class CertificationsComponent implements OnInit {
  currentTab = 'my-certs'; // 'my-certs' | 'request' | 'my-requests'

  myCertificats: Certificat[] = [];
  myRequests: Certificat[] = [];
  isSubmitting = false;

  // Request form
  newRequest: Certificat = this.getEmptyRequest();

  constructor(
    private certService: CertificatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  getEmptyRequest(): Certificat {
    return {
      nom: '',
      issuer: '',
      date: '',
      description: '',
      certificateUrl: '',
      userId: 0
    };
  }

  loadData(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.certService.getByUserId(userId).subscribe(data => {
      this.myCertificats = data.filter(c => c.status === 'APPROVED');
      this.myRequests = data.filter(c => c.status === 'PENDING' || c.status === 'REJECTED');
    });
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }

  onSubmitRequest(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert('Session expired. Please login again.');
      return;
    }
    if (!this.newRequest.nom || !this.newRequest.description) {
      alert('Please fill in the certificate name and description.');
      return;
    }

    this.newRequest.userId = userId;
    this.isSubmitting = true;

    this.certService.requestCertificat(this.newRequest).subscribe({
      next: () => {
        alert('Certificate request submitted! ✅');
        this.newRequest = this.getEmptyRequest();
        this.isSubmitting = false;
        this.loadData();
        this.currentTab = 'my-requests';
      },
      error: (err) => {
        console.error('Error submitting request', err);
        this.isSubmitting = false;
      }
    });
  }
}