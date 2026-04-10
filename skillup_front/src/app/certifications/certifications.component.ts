import { Component, OnInit } from '@angular/core';
import { CertificatService } from '../certificat.service';
import { AuthService } from '../auth.service';
import { Certificat } from '../models/certificat.model';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';



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
    selectedPdfTheme: string = 'CLASSIC';

    // Predefined list of certificates
  availableCertificates = [
    { nom: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' },
    { nom: 'AWS Certified Developer', issuer: 'Amazon Web Services' },
    { nom: 'Azure Fundamentals', issuer: 'Microsoft' },
    { nom: 'Azure Developer Associate', issuer: 'Microsoft' },
    { nom: 'Google Cloud Engineer', issuer: 'Google' },
    { nom: 'Spring Professional', issuer: 'VMware' },
    { nom: 'Angular Developer', issuer: 'Google' },
    { nom: 'Cisco CCNA', issuer: 'Cisco' }
  ];


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
  // Show all valid, expiring soon, and expired certs in the main tab
  this.myCertificats = data.filter(c => 
    c.status === 'APPROVED' || 
    c.status === 'EXPIRING_SOON' || 
    c.status === 'EXPIRED'
  );
  
  // Keep pending and rejected in the requests tab
  this.myRequests = data.filter(c => c.status === 'PENDING' || c.status === 'REJECTED');
});

  }
      exportToPDF(cert: Certificat): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
const userName = this.authService.getUsername() || 'Student';


    // 1. DEFINE THE COLOR PALETTES FOR YOUR THEMES
    let bgColor = [255, 255, 255]; // Default white
    let textColor = [0, 0, 0];
    let titleColor = [37, 99, 235]; // Default blue
    let borderColor = [200, 200, 200];
    
    // Apply selected theme RGBs
    if (this.selectedPdfTheme === 'DARK') {
      bgColor = [30, 41, 59];       // Deep slate slate-800
      textColor = [248, 250, 252];  // Off-white text
      titleColor = [96, 165, 250];  // Neon light blue
      borderColor = [56, 189, 248]; // Sky blue boundary
    } else if (this.selectedPdfTheme === 'GOLD') {
      bgColor = [255, 255, 255];    // White
      textColor = [30, 30, 30];     // Dark grey
      titleColor = [212, 175, 55];  // Gold
      borderColor = [212, 175, 55]; // Gold boundary
    } else if (this.selectedPdfTheme === 'EMERALD') {
      bgColor = [240, 253, 244];    // Very light green
      textColor = [6, 78, 59];      // Forest green text
      titleColor = [16, 185, 129];  // Emerald green
      borderColor = [52, 211, 153]; // Light emerald boundary
    }

    // 2. PAINT THE MAIN BACKGROUND
    // @ts-ignore
    doc.setFillColor(...bgColor);
    doc.rect(0, 0, 297, 210, 'F');

    // 3. DRAW THE BORDERS
    // @ts-ignore
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(4);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);

    // 4. PRINT THE HEADER TEXT
    // @ts-ignore
    doc.setTextColor(...titleColor);
    doc.setFontSize(40);
    doc.text('CERTIFICATE OF ACHIEVEMENT', 148, 50, { align: 'center' });

    // 5. PRINT THE MAIN TEXT
    // @ts-ignore
    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.text('This is proudly presented to', 148, 80, { align: 'center' });

    // Print the dynamic user name
    doc.setFontSize(30);
doc.text(userName, 148, 100, { align: 'center' });

    doc.setFontSize(16);
    doc.text('For the successful completion of', 148, 120, { align: 'center' });

    // Print the dynamic certificate name in the theme HIGHLIGHT color
    // @ts-ignore
    doc.setTextColor(...titleColor); 
    doc.setFontSize(24);
    doc.text(cert.nom, 148, 140, { align: 'center' });

    // 6. PRINT FOOTER
    // @ts-ignore
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.text(`Issued By: ${cert.issuer}`, 30, 180);
    doc.text(`Date Issued: ${cert.date}`, 200, 180);

    // 7. HANDLE QR CODE VERIFICATION LINK
    if (cert.credentialId) {
      const verificationUrl = `http://localhost:4200/verify?id=${cert.credentialId}`;
      doc.setFontSize(10);
      doc.text(`Credential ID: ${cert.credentialId}`, 30, 190);
      doc.text('Scan to Verify ✅', 248, 155);

      // Generate base64 QR Code image and paint it
      // @ts-ignore
      QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'M', margin: 1 }, (err: any, url: string) => {
        if (!err) {
          doc.addImage(url, 'PNG', 245, 160, 30, 30);
        }
        doc.save(`${cert.nom.replace(/\s+/g, '_')}_${this.selectedPdfTheme}.pdf`);
      });
    } else {
      // Legacy fallback saving (if a really old certificate doesn't have an ID)
      doc.save(`${cert.nom.replace(/\s+/g, '_')}_${this.selectedPdfTheme}.pdf`);
    }
  }

    // NEW: Share directly to LinkedIn
  shareToLinkedIn(cert: Certificat): void {
    const baseUrl = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';
    
    // 1. Certificate Name
    const name = encodeURIComponent(cert.nom);
    // 2. Issuing Organization
    const organizationName = encodeURIComponent(cert.issuer || 'SkillUp Academy');
    
    // 3. Extract the Year and Month from the date (assuming format YYYY-MM-DD)
    let issueYear = '';
    let issueMonth = '';
    if (cert.date) {
      const parts = cert.date.split('-');
      if (parts.length >= 2) {
        issueYear = parts[0];
        issueMonth = parts[1]; // LinkedIn prefers 1-12 format
      }
    }

    // 4. The Verification URL (so employers can verify it on LinkedIn)
    const verificationUrl = cert.credentialId 
      ? encodeURIComponent(`http://localhost:4200/verify?id=${cert.credentialId}`)
      : encodeURIComponent(cert.certificateUrl || '');

    // 5. Build the final formatted URL
    const linkedInUrl = `${baseUrl}&name=${name}&organizationName=${organizationName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${verificationUrl}&certId=${cert.credentialId || ''}`;

    // Open LinkedIn in a new browser tab!
    window.open(linkedInUrl, '_blank');
  }


  onSelectCertificate(event: Event): void {
    const selectedNom = (event.target as HTMLSelectElement).value;
    const certFound = this.availableCertificates.find(c => c.nom === selectedNom);
    
    if (certFound) {
      this.newRequest.nom = certFound.nom;
      this.newRequest.issuer = certFound.issuer;
    } else {
      // If "Select..." or empty is chosen
      this.newRequest.nom = '';
      this.newRequest.issuer = '';
    }
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

        this.newRequest.date = new Date().toISOString().split('T')[0];
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
    shareToForum(cert: Certificat): void {
    const userId = this.authService.getUserId();
    if (!userId || !cert.id) return;

    if (confirm("Do you want to post this achievement publicly to the Forum?")) {
      this.certService.shareToForum(cert.id, userId).subscribe({
        next: () => alert('Shared successfully! Go to the Forum to see your post! 🎉'),
        error: (err) => alert('Failed to share to forum.')
      });
    }
  }

}