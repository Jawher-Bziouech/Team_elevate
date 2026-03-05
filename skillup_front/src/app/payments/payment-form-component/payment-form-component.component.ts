import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from '../../payment.service';
@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form-component.component.html',
  styleUrls: ['./payment-form-component.component.css']
})
export class PaymentFormComponent implements OnInit {

  paymentForm!: FormGroup;
  isEditMode = false;
  paymentId?: number;
  @Input() inputPaymentId: number = 0;
  loading = false;
  submitting = false;
  formationId?: number;

  // Liste des méthodes de paiement
  paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Carte de Crédit', icon: 'fa-credit-card' },
    { value: 'PAYPAL', label: 'PayPal', icon: 'fa-paypal' },
    { value: 'BANK_TRANSFER', label: 'Virement Bancaire', icon: 'fa-university' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'fa-mobile-alt' },
    { value: 'CASH', label: 'Espèces', icon: 'fa-money-bill-wave' }
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkRouteParams();
  }

  // Initialiser le formulaire
  initForm(): void {
    this.paymentForm = this.fb.group({
      formationId: ['', [Validators.required]],
      formationName: ['', [Validators.required, Validators.maxLength(255)]],
      userId: ['', [Validators.required]],
      userName: ['', [Validators.required, Validators.maxLength(255)]],
      userEmail: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['', [Validators.required]]
    });
  }

  // Vérifier les paramètres de la route
  checkRouteParams(): void {
    // Vérifier si on est en mode édition (route param ou @Input)
    const routeId = this.route.snapshot.paramMap.get('id');
    const id = routeId ? +routeId : this.inputPaymentId;
    if (id) {
      this.isEditMode = true;
      this.paymentId = id;
      this.loadPayment(this.paymentId);
    }

    // Vérifier si on a un formationId (paiement direct depuis une formation)
    this.formationId = this.route.snapshot.params['formationId'];
    if (this.formationId) {
      this.paymentForm.patchValue({
        formationId: this.formationId
      });
      // Désactiver le champ formationId si vient de l'URL
      this.paymentForm.get('formationId')?.disable();
    }
  }

  // Charger un paiement existant (mode édition)
  loadPayment(id: number): void {
    this.loading = true;
    this.paymentService.getPaymentById(id).subscribe({
      next: (payment) => {
        this.paymentForm.patchValue({
          formationId: payment.formationId,
          formationName: payment.formationName,
          userId: payment.userId,
          userName: payment.userName,
          userEmail: payment.userEmail,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod
        });
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

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.submitting = true;
    const paymentData = this.paymentForm.getRawValue(); // Utilise getRawValue pour les champs désactivés

    if (this.isEditMode && this.paymentId) {
      // Mode édition - Mise à jour du statut seulement
      this.updatePaymentStatus();
    } else {
      // Mode création
      this.paymentService.createPayment(paymentData).subscribe({
        next: (response) => {
          alert('Paiement créé avec succès !');
          this.submitting = false;
          this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
        },
        error: (error) => {
          console.error('Erreur création paiement', error);
          alert('Erreur lors de la création du paiement');
          this.submitting = false;
        }
      });
    }
  }

  // Mettre à jour le statut (mode édition)
  updatePaymentStatus(): void {
    const newStatus = prompt('Entrez le nouveau statut (PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED):', 'COMPLETED');

    if (newStatus && this.paymentId) {
      this.paymentService.updatePaymentStatus(this.paymentId, newStatus).subscribe({
        next: () => {
          alert('Statut mis à jour avec succès !');
          this.submitting = false;
          this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
        },
        error: (error) => {
          console.error('Erreur mise à jour statut', error);
          alert('Erreur lors de la mise à jour du statut');
          this.submitting = false;
        }
      });
    } else {
      this.submitting = false;
    }
  }

  // Annuler
  onCancel(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
  }


  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour les messages d'erreur
  get formationIdError(): string {
    const control = this.paymentForm.get('formationId');
    if (control?.hasError('required') && control.touched) {
      return 'L\'ID de la formation est requis';
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

  get userNameError(): string {
    const control = this.paymentForm.get('userName');
    if (control?.hasError('required') && control.touched) {
      return 'Le nom de l\'utilisateur est requis';
    }
    return '';
  }

  get userEmailError(): string {
    const control = this.paymentForm.get('userEmail');
    if (control?.hasError('required') && control.touched) {
      return 'L\'email est requis';
    }
    if (control?.hasError('email') && control.touched) {
      return 'Format d\'email invalide';
    }
    return '';
  }

  get amountError(): string {
    const control = this.paymentForm.get('amount');
    if (control?.hasError('required') && control.touched) {
      return 'Le montant est requis';
    }
    if (control?.hasError('min') && control.touched) {
      return 'Le montant doit être supérieur à 0';
    }
    return '';
  }

  get paymentMethodError(): string {
    const control = this.paymentForm.get('paymentMethod');
    if (control?.hasError('required') && control.touched) {
      return 'La méthode de paiement est requise';
    }
    return '';
  }

  // Formater le montant en temps réel
  formatAmountOnBlur(): void {
    const amountControl = this.paymentForm.get('amount');
    if (amountControl?.value) {
      const value = parseFloat(amountControl.value);
      if (!isNaN(value)) {
        amountControl.setValue(value.toFixed(2));
      }
    }
  }
}
