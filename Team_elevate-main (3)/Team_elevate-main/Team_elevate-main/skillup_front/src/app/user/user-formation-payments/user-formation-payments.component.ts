import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Payment, PaymentService } from '../../payment.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-formation-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-formation-payments.component.html',
  styleUrls: ['./user-formation-payments.component.css']
})
export class UserFormationPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  loading = true;
  error = '';
  currentUser: number | null = null;

  // Enhanced statistics
  totalPaid = 0;
  completedPayments = 0;
  pendingPayments = 0;
  failedPayments = 0;
  refundedPayments = 0;
  averagePaymentAmount = 0;
  recentPayments: Payment[] = [];
  upcomingPayments: Payment[] = [];

  // Filtering
  statusFilter = 'ALL';
  searchTerm = '';

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserId();
    this.loadFormationPayments();
  }

  loadFormationPayments(): void {
    this.loading = true;
    this.error = '';

    if (!this.currentUser) {
      this.payments = [];
      this.loading = false;
      this.error = 'Utilisateur non authentifie. Veuillez vous reconnecter.';
      return;
    }

    this.paymentService.getPaymentsByUser(this.currentUser, 0, 100).subscribe({
      next: (response) => {
        this.payments = response.content || [];
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des paiements';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    if (!this.payments) return;

    this.totalPaid = this.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    this.completedPayments = this.payments.filter(p => p.status === 'COMPLETED').length;
    this.pendingPayments = this.payments.filter(p => p.status === 'PENDING').length;
    this.failedPayments = this.payments.filter(p => p.status === 'FAILED').length;
    this.refundedPayments = this.payments.filter(p => p.status === 'REFUNDED').length;

    const completedPayments = this.payments.filter(p => p.status === 'COMPLETED');
    this.averagePaymentAmount = completedPayments.length > 0
      ? completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length
      : 0;

    // Recent payments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.recentPayments = this.payments
      .filter(p => new Date(p.paymentDate) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);

    // Upcoming payments (pending payments)
    this.upcomingPayments = this.payments
      .filter(p => p.status === 'PENDING')
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }

  getFilteredPayments(): Payment[] {
    if (!this.payments) return [];

    let filtered = this.payments;

    // Status filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === this.statusFilter);
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.formationName?.toLowerCase().includes(term) ||
        p.paymentReference?.toLowerCase().includes(term) ||
        p.userName?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'bg-warning text-dark',
      'COMPLETED': 'bg-success',
      'FAILED': 'bg-danger',
      'REFUNDED': 'bg-info',
      'CANCELLED': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'USER_CHOICE': 'fas fa-wallet',
      'CREDIT_CARD': 'fas fa-credit-card',
      'PAYPAL': 'fab fa-paypal',
      'BANK_TRANSFER': 'fas fa-university',
      'MOBILE_MONEY': 'fas fa-mobile-alt',
      'CASH': 'fas fa-money-bill-wave'
    };
    return icons[method] || 'fas fa-credit-card';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'USER_CHOICE': 'A choisir au moment du paiement',
      'CREDIT_CARD': 'Carte de credit',
      'PAYPAL': 'PayPal',
      'BANK_TRANSFER': 'Virement bancaire',
      'MOBILE_MONEY': 'Mobile Money',
      'CASH': 'Especes'
    };
    return labels[method] || method;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'PENDING': 'fa-clock',
      'COMPLETED': 'fa-check-circle',
      'FAILED': 'fa-times-circle',
      'REFUNDED': 'fa-undo',
      'CANCELLED': 'fa-ban'
    };
    return icons[status] || 'fa-question-circle';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.statusFilter = target.value;
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  downloadReceipt(payment: Payment): void {
    // This would generate a PDF receipt
    alert(`TÃ©lÃ©chargement du reÃ§u pour le paiement ${payment.paymentReference}`);
  }

  contactSupport(payment: Payment): void {
    // This would open a support ticket or chat
    alert(`Contacter le support pour le paiement ${payment.paymentReference}`);
  }

  viewPaymentDetails(payment: Payment): void {
    // This could open a modal with full payment details
    alert(`DÃ©tails du paiement ${payment.paymentReference}:\nFormation: ${payment.formationName}\nMontant: ${this.formatAmount(payment.amount)}\nStatut: ${payment.status}`);
  }
}

