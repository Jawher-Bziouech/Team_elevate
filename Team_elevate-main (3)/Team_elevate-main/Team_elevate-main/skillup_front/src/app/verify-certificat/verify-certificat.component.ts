import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CertificatService } from '../certificat.service';
import { Certificat } from '../models/certificat.model';

@Component({
  selector: 'app-verify-certificat',
  templateUrl: './verify-certificat.component.html',
  styleUrls: ['./verify-certificat.component.css']
})
export class VerifyCertificatComponent implements OnInit {

  isLoading = true;
  isValid = false;
  certInfo: Certificat | null = null;
  holderName: string = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private certService: CertificatService
  ) { }

  ngOnInit(): void {
    // Grab the '?id=xxxx' from the URL
    this.route.queryParams.subscribe(params => {
      const credentialId = params['id'];

      if (credentialId) {
        this.verifyWithBackend(credentialId);
      } else {
        this.isLoading = false;
        this.isValid = false;
        this.errorMessage = 'No credential ID provided in the URL. Please scan a valid QR Code.';
      }
    });
  }

  verifyWithBackend(credentialId: string): void {
    this.certService.verifyCertificate(credentialId).subscribe({
      next: (response) => {
        // Backend returns 200 OK + the cert data
        this.isLoading = false;
        this.isValid = true;
         this.certInfo = response.certificate;
        this.holderName = response.holderName;
      },
      error: (err) => {
        // Backend throws 404 meaning it's fake or expired
        this.isLoading = false;
        this.isValid = false;
        this.errorMessage = 'This certificate is invalid, expired, or does not exist.';
        console.error('Verification failed', err);
      }
    });
  }
}
