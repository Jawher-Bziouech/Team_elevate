import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobOfferService } from '../job-offer.service';
import { JobOffer, JobOfferRequest } from '../../../../models/job-offer.model';
import { FirmService, Firm } from '../firm.service';

@Component({
  selector: 'app-job-offer-form',
  templateUrl: './job-offer-form.component.html',
  styleUrls: ['./job-offer-form.component.css']
})
export class JobOfferFormComponent implements OnInit {
  @Input() offerId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  isEdit = false;
  firms: Firm[] = [];

  constructor(
    private fb: FormBuilder,
    private jobOfferService: JobOfferService,
    private firmService: FirmService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      firmId: ['', Validators.required],
      industry: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      salaryRange: ['', [Validators.required, Validators.pattern(/^\d+-\d+$/)]]
    });
  }

  ngOnInit(): void {
    this.loadFirms();
    if (this.offerId) {
      this.isEdit = true;
      this.loadOffer(this.offerId);
    }
  }

  loadFirms(): void {
    console.log('⏳ Loading firms...');
    this.firmService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Firms loaded:', data);
        this.firms = data;
      },
      error: (err) => {
        console.error('❌ Error loading firms:', err);
        this.snackBar.open('Failed to load firms', 'Close', { duration: 3000 });
      }
    });
  }

  loadOffer(id: number): void {
    this.jobOfferService.getById(id).subscribe({
      next: (offer) => {
        this.form.patchValue({
          jobTitle: offer.jobTitle,
          firmId: offer.firm.id,
          industry: offer.industry,
          location: offer.location,
          salaryRange: offer.salaryRange
        });
      },
      error: () => this.snackBar.open('Error loading offer', 'Close', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request = this.form.value;
    if (this.isEdit && this.offerId) {
      this.jobOfferService.update(this.offerId, request).subscribe({
        next: () => {
          this.snackBar.open('Offer updated', 'Close', { duration: 2000 });
          this.saved.emit(); // notify parent
        },
        error: () => this.snackBar.open('Update failed', 'Close', { duration: 3000 })
      });
    } else {
      this.jobOfferService.create(request).subscribe({
        next: () => {
          this.snackBar.open('Offer created', 'Close', { duration: 2000 });
          this.saved.emit();
        },
        error: () => this.snackBar.open('Creation failed', 'Close', { duration: 3000 })
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
