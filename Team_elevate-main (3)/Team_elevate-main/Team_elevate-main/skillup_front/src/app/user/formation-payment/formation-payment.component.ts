import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../payment.service';
import { AuthService } from '../../auth.service';
import { InscriptionService } from '../../services/inscription.service';
import { FormationService } from '../../formation.service';

@Component({
  selector: 'app-formation-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formation-payment.component.html',
  styleUrls: ['./formation-payment.component.css']
})
export class FormationPaymentComponent implements OnInit {
  formation: any = null;
  formationId: number = 0;
  paymentForm: FormGroup;
  submitted = false;
  loading = false;
  loadingFormation = true;
  success = false;
  errorMessage = '';

  paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Carte Bancaire', icon: 'fa-credit-card' },
    { value: 'PAYPAL', label: 'PayPal', icon: 'fa-paypal' },
    { value: 'BANK_TRANSFER', label: 'Virement Bancaire', icon: 'fa-university' },
    { value: 'CASH', label: 'Espèces', icon: 'fa-money-bill-wave' }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private inscriptionService: InscriptionService,
    private formationService: FormationService,
    public authService: AuthService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      acceptConditions: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('formationId');
    if (idParam) {
      this.formationId = +idParam;
      this.loadFormation(this.formationId);
    } else {
      this.errorMessage = 'ID de formation manquant';
      this.loadingFormation = false;
    }
  }

  loadFormation(id: number): void {
    this.loadingFormation = true;
    this.formationService.getFormationById(id).subscribe({
      next: (data: any) => {
        this.formation = data;
        this.loadingFormation = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement formation:', err);
        this.errorMessage = 'Erreur lors du chargement de la formation';
        this.loadingFormation = false;
      }
    });
  }

  get f() { return this.paymentForm.controls; }

  selectPaymentMethod(method: string): void {
    this.paymentForm.patchValue({ paymentMethod: method });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.paymentForm.invalid || !this.formation) return;

    this.loading = true;
    const userId = this.authService.getUserId();
    const username = this.authService.getUsername();

    if (!userId || !username) {
      this.loading = false;
      this.errorMessage = 'Erreur: utilisateur non authentifié';
      return;
    }

    const paymentRequest = {
      formationId: this.formation.id,
      formationName: this.formation.titre,
      userId: userId,
      userName: username,
      userEmail: this.authService.getCompleteEmail(),
      amount: this.formation.prix,
      paymentMethod: this.f['paymentMethod'].value
    };

    console.log('📝 Envoi paiement:', paymentRequest);

    this.paymentService.createPayment(paymentRequest).subscribe({
      next: (payment) => {
        console.log('✅ Paiement créé:', payment);
        
        // ✅ CORRECTION : Appel à inscrire avec formationId seulement
        this.inscriptionService.inscrire(this.formation.id).subscribe({
          next: (inscription) => {
            console.log('✅ Inscription créée:', inscription);
            this.loading = false;
            this.success = true;
            this.paymentForm.reset();
            this.submitted = false;
            
            setTimeout(() => {
              this.router.navigate(['/formations']);
            }, 3000);
          },
          error: (err) => {
            this.loading = false;
            console.error('❌ Erreur inscription:', err);
            // Afficher le message d'erreur du backend
            if (err.error && typeof err.error === 'string') {
              this.errorMessage = err.error;
            } else if (err.error && err.error.message) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = 'Erreur lors de l\'inscription';
            }
          }
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Erreur paiement:', err);
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors du paiement';
        }
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.paymentForm.reset();
    this.errorMessage = '';
  }
}