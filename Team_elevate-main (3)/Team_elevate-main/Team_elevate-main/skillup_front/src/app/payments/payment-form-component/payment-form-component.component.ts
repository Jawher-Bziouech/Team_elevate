import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PaymentService } from '../../payment.service';
import { PaymentRequest } from '../../models/payment.model';
import { FormationService, Formation } from '../../formation.service';
import { InscriptionService, Inscription } from '../../services/inscription.service';

interface PaymentRecipient {
  userId: number;
  userName: string;
  userEmail: string;
}

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form-component.component.html',
  styleUrls: ['./payment-form-component.component.css']
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;
  isEditMode = false;
  paymentId?: number;
  @Input() inputPaymentId = 0;
  loading = false;
  submitting = false;
  formationId?: number;
  loadingFormations = false;
  formationLoadError = '';
  formSuccessMessage = '';
  generatedInvoiceNumber = '';
  readonly pendingUserChoiceMethod = 'USER_CHOICE';
  readonly allowedPaymentMethods = ['Carte de credit', 'PayPal', 'Virement bancaire', 'Mobile Money', 'Especes'];

  formations: Formation[] = [];
  selectedFormation?: Formation;
  discountRate = 0;
  recognizedDiscountCode = '';
  recipients: PaymentRecipient[] = [];
  loadingRecipients = false;
  recipientLoadError = '';
  creationSummary?: {
    formationName: string;
    recipientCount: number;
    amountPerUser: number;
    totalAmount: number;
    invoiceNumber: string;
  };

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private formationService: FormationService,
    private inscriptionService: InscriptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFormations();
    this.listenToFormChanges();
    this.checkRouteParams();
  }

  loadFormations(): void {
    this.loadingFormations = true;
    this.formationLoadError = '';

    this.formationService.getAllFormations().subscribe({
      next: (formations) => {
        this.formations = formations ?? [];
        this.loadingFormations = false;

        if (this.formationId) {
          this.syncSelectedFormation(this.formationId);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des formations:', err);
        this.formationLoadError = 'Impossible de charger les formations pour le moment.';
        this.loadingFormations = false;
      }
    });
  }

  onFormationChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedId = Number(target.value);

    if (!selectedId) {
      this.clearFormationSelection();
      return;
    }

    this.syncSelectedFormation(selectedId);
  }

  syncSelectedFormation(formationId: number): void {
    const localFormation = this.formations.find((formation) => formation.id === formationId);

    if (localFormation) {
      this.applyFormationToForm(localFormation);
      return;
    }

    this.formationService.getFormationById(formationId).subscribe({
      next: (formation) => {
        this.applyFormationToForm(formation);
      },
      error: (err) => {
        console.error('Erreur lors de la recuperation de la formation:', err);
        this.formationLoadError = 'Formation introuvable.';
        this.clearFormationSelection();
      }
    });
  }

  applyFormationToForm(formation: Formation): void {
    this.selectedFormation = formation;
    this.formationLoadError = '';
    this.paymentForm.patchValue({
      formationId: formation.id ?? '',
      formationName: formation.titre,
      amount: formation.prix
    }, { emitEvent: false });
    if (formation.id) {
      this.loadRecipientsForFormation(formation.id);
    }
    this.calculateFinalAmount();
  }

  clearFormationSelection(): void {
    this.selectedFormation = undefined;
    this.paymentForm.patchValue({
      formationId: '',
      formationName: '',
      amount: '',
      finalAmount: '0.00'
    }, { emitEvent: false });
    this.discountRate = 0;
    this.recognizedDiscountCode = '';
    this.recipients = [];
    this.loadingRecipients = false;
    this.recipientLoadError = '';
  }

  loadRecipientsForFormation(formationId: number): void {
    this.loadingRecipients = true;
    this.recipientLoadError = '';
    this.recipients = [];

    this.inscriptionService.getInscriptionsByFormation(formationId).subscribe({
      next: (inscriptions) => {
        this.recipients = (inscriptions ?? [])
          .map((inscription, index) => this.mapInscriptionToRecipient(inscription, index))
          .filter((recipient): recipient is PaymentRecipient => recipient !== null);

        if (this.recipients.length === 0) {
          this.recipientLoadError = 'Aucun utilisateur inscrit pour cette formation.';
        }

        this.loadingRecipients = false;
      },
      error: (err) => {
        console.error('Erreur chargement destinataires', err);
        this.recipientLoadError = 'Impossible de charger les utilisateurs de cette formation.';
        this.loadingRecipients = false;
      }
    });
  }

  private mapInscriptionToRecipient(inscription: Inscription, index: number): PaymentRecipient | null {
    const userEmail = inscription.email?.trim();
    if (!userEmail) {
      return null;
    }

    const userName = [inscription.prenom, inscription.nom].filter(Boolean).join(' ').trim() || userEmail;

    return {
      userId: inscription.id ?? index + 1,
      userName,
      userEmail
    };
  }

  listenToFormChanges(): void {
    this.paymentForm.get('discountCode')?.valueChanges.subscribe(() => {
      this.calculateFinalAmount();
    });
  }

  calculateFinalAmount(): void {
    const amount = Number(this.paymentForm.get('amount')?.value || 0);
    const discountCode = String(this.paymentForm.get('discountCode')?.value || '').trim().toUpperCase();
    const discounts: Record<string, number> = {
      WELCOME10: 0.1,
      STUDENT20: 0.2,
      EARLYBIRD15: 0.15
    };

    this.discountRate = discounts[discountCode] || 0;
    this.recognizedDiscountCode = this.discountRate ? discountCode : '';

    const finalAmount = amount * (1 - this.discountRate);
    this.paymentForm.get('finalAmount')?.setValue(finalAmount ? finalAmount.toFixed(2) : '0.00', { emitEvent: false });
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      formationId: ['', [Validators.required]],
      formationName: ['', [Validators.required, Validators.maxLength(255)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      discountCode: [''],
      finalAmount: [{ value: '0.00', disabled: true }],
      sendConfirmationEmail: [true]
    });
  }

  checkRouteParams(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    const id = routeId ? +routeId : this.inputPaymentId;
    if (id) {
      this.isEditMode = true;
      this.paymentId = id;
      this.loadPayment(this.paymentId);
    }

    this.formationId = Number(this.route.snapshot.params['formationId']);
    if (this.formationId) {
      this.paymentForm.patchValue({ formationId: this.formationId });
      if (this.formations.length > 0) {
        this.syncSelectedFormation(this.formationId);
      }
    }
  }

  loadPayment(id: number): void {
    this.loading = true;
    this.paymentService.getPaymentById(id).subscribe({
      next: (payment) => {
        this.paymentForm.patchValue({
          formationId: payment.formationId,
          formationName: payment.formationName,
          amount: payment.amount,
          sendConfirmationEmail: true
        });
        this.syncSelectedFormation(payment.formationId);
        this.calculateFinalAmount();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement paiement', error);
        alert('Erreur lors du chargement du paiement');
        this.loading = false;
        this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    if ((this.selectedFormation?.placesDisponibles ?? 1) <= 0) {
      alert('Cette formation est complete. Aucun paiement ne peut etre cree.');
      return;
    }

    this.submitting = true;
    this.formSuccessMessage = '';
    this.creationSummary = undefined;

    const rawValue = this.paymentForm.getRawValue();
    const amountPerUser = rawValue.finalAmount ? parseFloat(rawValue.finalAmount) : Number(rawValue.amount);

    if (this.isEditMode && this.paymentId) {
      this.updatePaymentStatus();
      return;
    }

    if (!this.recipients.length) {
      this.recipientLoadError = 'Aucun utilisateur a facturer pour cette formation.';
      this.submitting = false;
      return;
    }

    const paymentRequests: PaymentRequest[] = this.recipients.map((recipient) => ({
      userId: recipient.userId,
      userName: recipient.userName,
      userEmail: recipient.userEmail,
      formationId: Number(rawValue.formationId),
      formationName: rawValue.formationName,
      amount: amountPerUser,
      paymentMethod: this.pendingUserChoiceMethod
    }));

    forkJoin(
      paymentRequests.map((request) =>
        this.paymentService.createPayment(request).pipe(
          catchError((error) => {
            console.error('Erreur creation paiement', request.userEmail, error);
            return of(null);
          })
        )
      )
    ).subscribe({
      next: (results) => {
        const successfulCreations = results.filter((result) => result !== null).length;

        if (!successfulCreations) {
          alert('Erreur lors de la creation des demandes de paiement');
          this.submitting = false;
          return;
        }

        this.generatedInvoiceNumber = this.buildInvoiceNumber();
        this.creationSummary = {
          formationName: rawValue.formationName,
          recipientCount: successfulCreations,
          amountPerUser,
          totalAmount: successfulCreations * amountPerUser,
          invoiceNumber: this.generatedInvoiceNumber
        };
        this.formSuccessMessage = `Demandes de paiement creees pour ${successfulCreations} utilisateur(s). Chaque utilisateur choisira ensuite sa methode de paiement.`;

        if (rawValue.sendConfirmationEmail) {
          this.sendConfirmationEmail(paymentRequests.slice(0, successfulCreations));
        }

        this.generateInvoice(successfulCreations, amountPerUser, rawValue.formationName);
        this.submitting = false;
        this.resetCreationForm();
      },
      error: (error) => {
        console.error('Erreur creation paiement', error);
        alert('Erreur lors de la creation du paiement');
        this.submitting = false;
      }
    });
  }

  updatePaymentStatus(): void {
    const newStatus = prompt('Entrez le nouveau statut (PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED):', 'COMPLETED');

    if (newStatus && this.paymentId) {
      this.paymentService.updatePaymentStatus(this.paymentId, newStatus).subscribe({
        next: () => {
          alert('Statut mis a jour avec succes !');
          this.submitting = false;
          this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
        },
        error: (error) => {
          console.error('Erreur mise a jour statut', error);
          alert('Erreur lors de la mise a jour du statut');
          this.submitting = false;
        }
      });
    } else {
      this.submitting = false;
    }
  }

  resetCreationForm(): void {
    this.paymentForm.reset({
      formationId: '',
      formationName: '',
      amount: '',
      discountCode: '',
      finalAmount: '0.00',
      sendConfirmationEmail: true
    });
    this.selectedFormation = undefined;
    this.discountRate = 0;
    this.recognizedDiscountCode = '';
    this.recipients = [];
    this.loadingRecipients = false;
    this.recipientLoadError = '';
  }

  onCancel(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get formationIdError(): string {
    const control = this.paymentForm.get('formationId');
    if (control?.hasError('required') && control.touched) {
      return 'Veuillez choisir une formation';
    }
    return '';
  }

  get formationNameError(): string {
    const control = this.paymentForm.get('formationName');
    if (control?.hasError('required') && control.touched) {
      return 'Le nom de la formation est requis';
    }
    return '';
  }

  get amountError(): string {
    const control = this.paymentForm.get('amount');
    if (control?.hasError('required') && control.touched) {
      return 'Le montant est requis';
    }
    if (control?.hasError('min') && control.touched) {
      return 'Le montant doit etre superieur a 0';
    }
    return '';
  }

  get finalAmountValue(): number {
    return Number(this.paymentForm.get('finalAmount')?.value || 0);
  }

  get discountAmount(): number {
    const amount = Number(this.paymentForm.get('amount')?.value || 0);
    return amount - this.finalAmountValue;
  }

  get paymentMethodsPreview(): string {
    return this.allowedPaymentMethods.join(', ');
  }

  get recipientPreview(): PaymentRecipient[] {
    return this.recipients.slice(0, 5);
  }

  get formationAvailabilityLabel(): string {
    if (!this.selectedFormation) {
      return 'Aucune formation selectionnee';
    }

    const placesDisponibles = this.selectedFormation.placesDisponibles ?? 0;
    if (placesDisponibles <= 0) {
      return 'Complet';
    }
    if (placesDisponibles <= 3) {
      return `Urgent: ${placesDisponibles} place(s) restante(s)`;
    }
    return `${placesDisponibles} place(s) disponible(s)`;
  }

  buildInvoiceNumber(): string {
    return `INV-${Date.now()}`;
  }

  sendConfirmationEmail(paymentDataList: PaymentRequest[]): void {
    console.log('Envoi d email de confirmation a', paymentDataList.map((payment) => payment.userEmail));
    alert(`Emails de confirmation envoyes a ${paymentDataList.length} utilisateur(s)`);
  }

  generateInvoice(recipientCount: number, amountPerUser: number, formationName: string): void {
    const invoiceData = {
      invoiceNumber: this.generatedInvoiceNumber || this.buildInvoiceNumber(),
      formation: formationName,
      recipientCount,
      amountPerUser,
      totalAmount: recipientCount * amountPerUser,
      paymentMethod: this.pendingUserChoiceMethod,
      date: new Date().toLocaleDateString()
    };
    console.log('Facture generee:', invoiceData);
    alert('Facture generee: ' + invoiceData.invoiceNumber);
  }
}
