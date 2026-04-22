import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {
  InternshipApplication,
  InternshipApplicationRequest,
  InternshipOffer,
  InternshipService
} from '../services/internship.service';

@Component({
  selector: 'app-internship-detail',
  templateUrl: './internship-detail.component.html',
  styleUrls: ['./internship-detail.component.css']
})
export class InternshipDetailComponent implements OnInit {
  internship: InternshipOffer | null = null;
  loading = false;
  errorMessage = '';

  showApplyModal = false;
  applying = false;
  uploadingCv = false;
  applySuccessMessage = '';
  applyErrorMessage = '';
  selectedCvInfo = '';
  selectedCvFileSize = '';

  applicationForm: InternshipApplicationRequest = {
    cvData: '',
    cvFileName: '',
    motivationLetter: ''
  };

  parsingResume = false;
  selectedFile: File | null = null;
  parsedData: any = {
    name: '',
    email: '',
    skills: [],
    education: ''
  };

  private readonly maxCvSizeBytes = 5 * 1024 * 1024;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private internshipService: InternshipService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Invalid internship id.';
      return;
    }

    this.fetchInternship(id);

    // Check if the user wants to apply directly
    this.route.queryParams.subscribe(params => {
      if (params['openApply'] === 'true' && this.authService.isLoggedIn() && this.authService.hasRole('TRAINEE')) {
        this.openApplyModal();
      }
    });
  }

  fetchInternship(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.internshipService.getInternshipById(id).subscribe({
      next: (offer) => {
        this.internship = offer;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load internship details.';
        this.loading = false;
      }
    });
  }

  backToList(): void {
    this.router.navigate(['/internships']);
  }

  canApply(): boolean {
    return this.authService.isLoggedIn() && this.authService.hasRole('TRAINEE') && !!this.internship;
  }

  openApplyModal(): void {
    this.applyErrorMessage = '';
    this.applySuccessMessage = '';
    this.uploadingCv = false;
    this.applying = false;
    this.parsingResume = false;
    this.selectedFile = null;
    this.parsedData = { name: '', email: '', skills: [], education: '' };
    this.resetApplicationForm();
    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.uploadingCv = false;
    this.applying = false;
    this.applyErrorMessage = '';
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.applyErrorMessage = '';
    this.applicationForm.cvData = '';
    this.applicationForm.cvFileName = '';
    this.selectedCvInfo = '';
    this.selectedCvFileSize = '';

    if (!file) {
      return;
    }

    this.selectedFile = file;

    if (!this.isAllowedCvFile(file)) {
      this.applyErrorMessage = 'Please select a PDF or DOCX file only.';
      input.value = '';
      return;
    }

    if (file.size > this.maxCvSizeBytes) {
      this.applyErrorMessage = 'PDF must be 5MB or smaller.';
      input.value = '';
      return;
    }

    this.uploadingCv = true;
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' ? this.extractBase64(result) : '';

      if (!base64) {
        this.applyErrorMessage = 'Unable to read the selected PDF file.';
        this.uploadingCv = false;
        return;
      }

      this.applicationForm.cvData = base64;
      this.applicationForm.cvFileName = file.name;
      this.selectedCvInfo = file.name;
      this.selectedCvFileSize = this.formatFileSize(file.size);
      this.uploadingCv = false;
    };

    reader.onerror = () => {
      this.applyErrorMessage = 'Unable to read the selected PDF file.';
      this.uploadingCv = false;
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  submitApplication(): void {
    if (!this.internship) {
      return;
    }

    if (this.uploadingCv || this.parsingResume) {
      this.applyErrorMessage = 'Please wait for the file processes to finish.';
      return;
    }

    if (!this.applicationForm.cvData || !this.applicationForm.cvFileName || !this.applicationForm.motivationLetter) {
      this.applyErrorMessage = 'Please upload a PDF or DOCX file and provide a motivation letter.';
      return;
    }

    this.applying = true;
    this.applyErrorMessage = '';

    this.internshipService.applyToInternship(this.internship.id, this.applicationForm).subscribe({
      next: (_: InternshipApplication) => {
        this.applying = false;
        this.applySuccessMessage = 'Application submitted successfully.';
        this.closeApplyModal();
        this.resetApplicationForm();
        this.router.navigate(['/internships']);
      },
      error: (err) => {
        this.applying = false;
        this.applyErrorMessage = err?.error?.message || 'Failed to submit application.';
      }
    });
  }

  private resetApplicationForm(): void {
    this.applicationForm = {
      cvData: '',
      cvFileName: '',
      motivationLetter: ''
    };
    this.selectedCvInfo = '';
    this.selectedCvFileSize = '';
  }

  private extractBase64(dataUrl: string): string {
    const separatorIndex = dataUrl.indexOf(',');
    return separatorIndex >= 0 ? dataUrl.slice(separatorIndex + 1) : dataUrl;
  }

  parseResume(): void {
    if (!this.selectedFile) {
      this.applyErrorMessage = 'Please select a file first.';
      return;
    }

    this.parsingResume = true;
    this.applyErrorMessage = '';
    
    this.internshipService.parseResume(this.selectedFile).subscribe({
      next: (data) => {
        this.parsingResume = false;
        this.parsedData = {
          name: data.name || '',
          email: data.email || '',
          skills: data.skills || [],
          education: data.education || ''
        };
      },
      error: (err) => {
        this.parsingResume = false;
        let errorMessage = 'Failed to parse resume.';
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this.applyErrorMessage = errorMessage;
      }
    });
  }

  private isAllowedCvFile(file: File): boolean {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.name.toLowerCase().endsWith('.docx');
    return isPdf || isDocx;
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) {
      return `${kilobytes.toFixed(1)} KB`;
    }

    return `${(kilobytes / 1024).toFixed(1)} MB`;
  }
}
