import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';

@Component({
    selector: 'app-application-modal',
    templateUrl: './application-modal.component.html',
    styleUrls: ['./application-modal.component.css']
})
export class ApplicationModalComponent implements OnInit {
    @Input() jobOfferId!: number;
    @Input() jobTitle: string = '';
    @Output() closed = new EventEmitter<void>();
    @Output() applied = new EventEmitter<void>();

    form!: FormGroup;
    selectedFile: File | null = null;
    fileError: string = '';
    submitting = false;
    submitSuccess = false;
    submitError = '';

    private maxFileSize = 5 * 1024 * 1024; // 5MB
    private allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    constructor(private fb: FormBuilder, private jobApplicationService: JobApplicationService) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            coverLetter: ['', [Validators.maxLength(1000)]]
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.fileError = '';
        this.selectedFile = null;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            if (!this.allowedTypes.includes(file.type)) {
                this.fileError = 'Only PDF, DOC, and DOCX files are accepted.';
                input.value = '';
                return;
            }

            if (file.size > this.maxFileSize) {
                this.fileError = 'File size must be less than 5 MB.';
                input.value = '';
                return;
            }

            this.selectedFile = file;
        }
    }

    removeFile(): void {
        this.selectedFile = null;
        this.fileError = '';
    }

    getFileSizeFormatted(): string {
        if (!this.selectedFile) return '';
        const kb = this.selectedFile.size / 1024;
        return kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb.toFixed(0) + ' KB';
    }

    onSubmit(): void {
        if (this.form.invalid || !this.selectedFile) {
            this.form.markAllAsTouched();
            if (!this.selectedFile) {
                this.fileError = 'Please upload your CV.';
            }
            return;
        }

        this.submitting = true;
        this.submitError = '';

        const formData = new FormData();
        formData.append('jobOfferId', this.jobOfferId.toString());
        formData.append('fullName', this.form.value.fullName);
        formData.append('email', this.form.value.email);
        if (this.form.value.phone) {
            formData.append('phone', this.form.value.phone);
        }
        if (this.form.value.coverLetter) {
            formData.append('coverLetter', this.form.value.coverLetter);
        }
        formData.append('cvFile', this.selectedFile, this.selectedFile.name);

        this.jobApplicationService.submit(formData).subscribe({
            next: () => {
                this.submitting = false;
                this.submitSuccess = true;
                setTimeout(() => {
                    this.applied.emit();
                    this.close();
                }, 2000);
            },
            error: (err) => {
                this.submitting = false;
                this.submitError = err?.error?.message || 'Something went wrong. Please try again.';
                console.error('Application submit error:', err);
            }
        });
    }

    close(): void {
        this.closed.emit();
    }
}
