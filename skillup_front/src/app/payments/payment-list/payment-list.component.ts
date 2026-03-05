import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../payment.service';
import { Payment, PaymentStatus } from '../../models/payment.model';


@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {

  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Pour les statistiques
  stats = {
    totalRevenue: 0,
    totalSuccessfulPayments: 0,
    totalPayments: 0
  };

  // Pour les statuts
  paymentStatus = PaymentStatus;

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPayments();
    this.loadStats();
  }

  // Charger les paiements
  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAllPayments(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.payments = response.content;
          this.filteredPayments = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement paiements', error);
          this.loading = false;
        }
      });
  }

  // Charger les statistiques
  loadStats(): void {
    this.paymentService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => console.error('Erreur stats', error)
    });
  }

  // Rechercher
  search(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.paymentService.searchPayments(this.searchTerm, 0, this.pageSize)
        .subscribe({
          next: (response) => {
            this.payments = response.content;
            this.filteredPayments = response.content;
            this.totalElements = response.totalElements;
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur recherche', error);
            this.loading = false;
          }
        });
    } else {
      this.loadPayments();
    }
  }

  // Changer de page
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPayments();
  }

  // Voir les détails
  viewPayment(id: number): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payment-detail', id: id } });
  }

  // Modifier
  editPayment(id: number): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payment-form', id: id } });
  }

  // Supprimer
  deletePayment(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      this.loading = true;
      this.paymentService.deletePayment(id).subscribe({
        next: () => {
          this.loadPayments();
          this.loadStats();
        },
        error: (error) => {
          console.error('Erreur suppression', error);
          this.loading = false;
        }
      });
    }
  }

  // Mettre à jour le statut
  updateStatus(id: number, status: string): void {
    this.paymentService.updatePaymentStatus(id, status).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: (error) => console.error('Erreur mise à jour statut', error)
    });
  }

  // Obtenir la classe CSS pour le statut
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'badge bg-warning text-dark',
      'COMPLETED': 'badge bg-success',
      'FAILED': 'badge bg-danger',
      'REFUNDED': 'badge bg-info',
      'CANCELLED': 'badge bg-secondary'
    };
    return classes[status] || 'badge bg-secondary';
  }

  // Obtenir l'icône pour la méthode de paiement
  getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'CREDIT_CARD': 'fa-credit-card',
      'PAYPAL': 'fa-paypal',
      'BANK_TRANSFER': 'fa-university',
      'MOBILE_MONEY': 'fa-mobile-alt',
      'CASH': 'fa-money-bill-wave'
    };
    return icons[method] || 'fa-credit-card';
  }

  // Formater le montant
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
  goToCreatePayment(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payment-form' } });
  }
  goToNewPayment(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payment-form' } });
  }


}
