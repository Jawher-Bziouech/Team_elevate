import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment } from '../../models/payment.model';
import { PaymentService } from '../../payment.service';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.css']
})
export class PaymentDetailComponent implements OnInit {

  payment?: Payment;
  loading = false;
  paymentId?: number;
  @Input() inputPaymentId: number = 0;

  // Configuration pour l'affichage
  statusConfig = {
    'PENDING': { class: 'warning', icon: 'fa-clock', label: 'En attente' },
    'COMPLETED': { class: 'success', icon: 'fa-check-circle', label: 'ComplÃ©tÃ©' },
    'FAILED': { class: 'danger', icon: 'fa-times-circle', label: 'Ã‰chouÃ©' },
    'REFUNDED': { class: 'info', icon: 'fa-undo-alt', label: 'RemboursÃ©' },
    'CANCELLED': { class: 'secondary', icon: 'fa-ban', label: 'AnnulÃ©' }
  };

  paymentMethodConfig = {
    'USER_CHOICE': { icon: 'fa-wallet', label: 'Choisie par l utilisateur' },
    'CREDIT_CARD': { icon: 'fa-credit-card', label: 'Carte de CrÃ©dit' },
    'PAYPAL': { icon: 'fa-paypal', label: 'PayPal' },
    'BANK_TRANSFER': { icon: 'fa-university', label: 'Virement Bancaire' },
    'MOBILE_MONEY': { icon: 'fa-mobile-alt', label: 'Mobile Money' },
    'CASH': { icon: 'fa-money-bill-wave', label: 'EspÃ¨ces' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    const id = routeId ? +routeId : this.inputPaymentId;
    if (id) {
      this.paymentId = id;
      this.loadPayment(this.paymentId);
    }
  }

  // Charger les dÃ©tails du paiement
  loadPayment(id: number): void {
    this.loading = true;
    this.paymentService.getPaymentById(id).subscribe({
      next: (data) => {
        this.payment = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement paiement', error);
        alert('Erreur lors du chargement des dÃ©tails du paiement');
        this.loading = false;
        this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
      }
    });
  }

  // Obtenir la configuration du statut
  getStatusConfig(status: string): any {
    return this.statusConfig[status as keyof typeof this.statusConfig] ||
      { class: 'secondary', icon: 'fa-question-circle', label: status };
  }

  // Obtenir la configuration de la mÃ©thode de paiement
  getPaymentMethodConfig(method: string): any {
    return this.paymentMethodConfig[method as keyof typeof this.paymentMethodConfig] ||
      { icon: 'fa-credit-card', label: method };
  }

  // Formater le montant
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  // Modifier le paiement
  editPayment(): void {
    if (this.paymentId) {
      this.router.navigate(['/back-office'], { queryParams: { view: 'payment-form', id: this.paymentId } });
    }
  }

  // Supprimer le paiement
  deletePayment(): void {
    if (this.paymentId && confirm('ÃŠtes-vous sÃ»r de vouloir supprimer ce paiement ?')) {
      this.loading = true;
      this.paymentService.deletePayment(this.paymentId).subscribe({
        next: () => {
          alert('Paiement supprimÃ© avec succÃ¨s');
          this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
        },
        error: (error) => {
          console.error('Erreur suppression paiement', error);
          alert('Erreur lors de la suppression');
          this.loading = false;
        }
      });
    }
  }

  // Changer le statut
  changeStatus(): void {
    if (!this.paymentId) return;

    const newStatus = prompt(
      'Entrez le nouveau statut (PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED):',
      this.payment?.status
    );

    if (newStatus && newStatus !== this.payment?.status) {
      this.loading = true;
      this.paymentService.updatePaymentStatus(this.paymentId, newStatus).subscribe({
        next: (updatedPayment) => {
          this.payment = updatedPayment;
          this.loading = false;
          alert('Statut mis Ã  jour avec succÃ¨s');
        },
        error: (error) => {
          console.error('Erreur mise Ã  jour statut', error);
          alert('Erreur lors de la mise Ã  jour du statut');
          this.loading = false;
        }
      });
    }
  }

  // Retour Ã  la liste
  goBack(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payments' } });
  }

  // Voir la formation associÃ©e
  viewFormation(): void {
    if (this.payment?.formationId) {
      this.router.navigate(['/formation', this.payment.formationId]);
    }
  }

  // Voir l'utilisateur associÃ©
  viewUser(): void {
    if (this.payment?.userId) {
      this.router.navigate(['/user/paiements', this.payment.userId]);
    }
  }

  // Imprimer la facture (simulÃ©)
  printInvoice(): void {
    window.print();
  }
}

