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

  // Enhanced filtering
  selectedStatuses: string[] = [];
  selectedPaymentMethods: string[] = [];
  dateFrom: string = '';
  dateTo: string = '';
  amountMin: number | null = null;
  amountMax: number | null = null;

  // Bulk operations
  selectedPayments: Set<number> = new Set();
  bulkActionLoading = false;

  // Analytics - Version corrigée avec valeurs par défaut
  stats = {
    totalRevenue: 0,
    totalSuccessfulPayments: 0,
    totalPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    averagePaymentAmount: 0,
    monthlyRevenue: 0
  };

  // Export
  exportLoading = false;

  // Status options
  statusOptions = [
    { value: 'PENDING', label: 'En attente', color: 'warning' },
    { value: 'COMPLETED', label: 'Terminé', color: 'success' },
    { value: 'FAILED', label: 'Échoué', color: 'danger' },
    { value: 'REFUNDED', label: 'Remboursé', color: 'info' },
    { value: 'CANCELLED', label: 'Annulé', color: 'secondary' }
  ];

  // Payment method options
  paymentMethodOptions = [
    { value: 'USER_CHOICE', label: 'Choix utilisateur', icon: 'fa-wallet' },
    { value: 'CREDIT_CARD', label: 'Carte de Crédit', icon: 'fa-credit-card' },
    { value: 'PAYPAL', label: 'PayPal', icon: 'fa-paypal' },
    { value: 'BANK_TRANSFER', label: 'Virement Bancaire', icon: 'fa-university' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'fa-mobile-alt' },
    { value: 'CASH', label: 'Espèces', icon: 'fa-money-bill-wave' }
  ];

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
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement paiements', error);
          this.loading = false;
        }
      });
  }

  // ✅ Charger les statistiques - Version corrigée
  loadStats(): void {
    this.paymentService.getStats().subscribe({
      next: (data: any) => {
        // Mapper les données reçues avec les valeurs par défaut
        this.stats = {
          totalRevenue: data.totalRevenue || 0,
          totalSuccessfulPayments: data.totalSuccessfulPayments || 0,
          totalPayments: data.totalPayments || 0,
          pendingPayments: data.pendingPayments || 0,
          failedPayments: data.failedPayments || 0,
          refundedPayments: data.refundedPayments || 0,
          averagePaymentAmount: data.averagePaymentAmount || 0,
          monthlyRevenue: data.monthlyRevenue || 0
        };
        this.calculateAdvancedStats();
      },
      error: (error) => {
        console.error('Erreur stats', error);
        // Garder les valeurs par défaut
      }
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

  // Calculer la fin de la plage de pagination
  getPaginationEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
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
      'USER_CHOICE': 'fa-wallet',
      'CREDIT_CARD': 'fa-credit-card',
      'PAYPAL': 'fa-paypal',
      'BANK_TRANSFER': 'fa-university',
      'MOBILE_MONEY': 'fa-mobile-alt',
      'CASH': 'fa-money-bill-wave'
    };
    return icons[method] || 'fa-credit-card';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'USER_CHOICE': 'Choisie par l\'utilisateur',
      'CREDIT_CARD': 'Carte de crédit',
      'PAYPAL': 'PayPal',
      'BANK_TRANSFER': 'Virement bancaire',
      'MOBILE_MONEY': 'Mobile Money',
      'CASH': 'Espèces'
    };
    return labels[method] || method;
  }

  // Formater le montant
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  // Enhanced filtering methods
  applyFilters(): void {
    this.filteredPayments = this.payments.filter(payment => {
      // Status filter
      if (this.selectedStatuses.length > 0 && !this.selectedStatuses.includes(payment.status)) {
        return false;
      }

      // Payment method filter
      if (this.selectedPaymentMethods.length > 0 && !this.selectedPaymentMethods.includes(payment.paymentMethod)) {
        return false;
      }

      // Date range filter
      if (this.dateFrom && new Date(payment.paymentDate) < new Date(this.dateFrom)) {
        return false;
      }
      if (this.dateTo && new Date(payment.paymentDate) > new Date(this.dateTo + 'T23:59:59')) {
        return false;
      }

      // Amount range filter
      if (this.amountMin !== null && payment.amount < this.amountMin) {
        return false;
      }
      if (this.amountMax !== null && payment.amount > this.amountMax) {
        return false;
      }

      return true;
    });

    this.totalElements = this.filteredPayments.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.currentPage = 0;
  }

  clearFilters(): void {
    this.selectedStatuses = [];
    this.selectedPaymentMethods = [];
    this.dateFrom = '';
    this.dateTo = '';
    this.amountMin = null;
    this.amountMax = null;
    this.filteredPayments = [...this.payments];
    this.totalElements = this.payments.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.currentPage = 0;
  }

  // Bulk operations
  togglePaymentSelection(paymentId: number): void {
    if (this.selectedPayments.has(paymentId)) {
      this.selectedPayments.delete(paymentId);
    } else {
      this.selectedPayments.add(paymentId);
    }
  }

  selectAllPayments(): void {
    if (this.selectedPayments.size === this.filteredPayments.length) {
      this.selectedPayments.clear();
    } else {
      this.selectedPayments.clear();
      this.filteredPayments.forEach(payment => this.selectedPayments.add(payment.id));
    }
  }

  isAllSelected(): boolean {
    return this.filteredPayments.length > 0 && this.selectedPayments.size === this.filteredPayments.length;
  }

  bulkUpdateStatus(newStatus: string): void {
    if (this.selectedPayments.size === 0) {
      alert('Veuillez sélectionner au moins un paiement');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir changer le statut de ${this.selectedPayments.size} paiement(s) en "${newStatus}" ?`)) {
      return;
    }

    this.bulkActionLoading = true;
    const promises = Array.from(this.selectedPayments).map(id =>
      this.paymentService.updatePaymentStatus(id, newStatus).toPromise()
    );

    Promise.all(promises).then(() => {
      this.selectedPayments.clear();
      this.loadPayments();
      this.loadStats();
      this.bulkActionLoading = false;
    }).catch(error => {
      console.error('Erreur bulk update', error);
      alert('Erreur lors de la mise à jour en masse');
      this.bulkActionLoading = false;
    });
  }

  bulkDelete(): void {
    if (this.selectedPayments.size === 0) {
      alert('Veuillez sélectionner au moins un paiement');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedPayments.size} paiement(s) ?`)) {
      return;
    }

    this.bulkActionLoading = true;
    const promises = Array.from(this.selectedPayments).map(id =>
      this.paymentService.deletePayment(id).toPromise()
    );

    Promise.all(promises).then(() => {
      this.selectedPayments.clear();
      this.loadPayments();
      this.loadStats();
      this.bulkActionLoading = false;
    }).catch(error => {
      console.error('Erreur bulk delete', error);
      alert('Erreur lors de la suppression en masse');
      this.bulkActionLoading = false;
    });
  }

  // Export functionality
  exportToCSV(): void {
    this.exportLoading = true;

    const headers = ['Référence', 'Formation', 'Utilisateur', 'Email', 'Montant', 'Méthode', 'Statut', 'Date'];
    const csvData = this.filteredPayments.map(payment => [
      payment.paymentReference,
      payment.formationName,
      payment.userName,
      payment.userEmail,
      payment.amount,
      payment.paymentMethod,
      payment.status,
      new Date(payment.paymentDate).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paiements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.exportLoading = false;
  }

  exportToPDF(): void {
    alert('Fonctionnalité PDF à implémenter avec jsPDF');
  }

  // Advanced analytics
  calculateAdvancedStats(): void {
    const completedPayments = this.payments.filter(p => p.status === 'COMPLETED');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    this.stats.monthlyRevenue = completedPayments
      .filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    this.stats.averagePaymentAmount = completedPayments.length > 0
      ? completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length
      : 0;

    this.stats.pendingPayments = this.payments.filter(p => p.status === 'PENDING').length;
    this.stats.failedPayments = this.payments.filter(p => p.status === 'FAILED').length;
    this.stats.refundedPayments = this.payments.filter(p => p.status === 'REFUNDED').length;
  }

  // Quick actions
  markAsCompleted(paymentId: number): void {
    this.updateStatus(paymentId, 'COMPLETED');
  }

  markAsRefunded(paymentId: number): void {
    const reason = prompt('Raison du remboursement:');
    if (reason) {
      this.updateStatus(paymentId, 'REFUNDED');
    }
  }

  sendPaymentReminder(paymentId: number): void {
    alert('Fonctionnalité de rappel de paiement à implémenter');
  }

  // Navigation
  goToCreatePayment(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payment-form' } });
  }

  goToNewPayment(): void {
    this.router.navigate(['/back-office'], { queryParams: { view: 'payment-form' } });
  }

  // Enhanced pagination
  get paginatedPayments(): Payment[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPayments.slice(start, end);
  }

  // Sorting
  sortBy: string = 'paymentDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  sortPayments(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }

    this.filteredPayments.sort((a, b) => {
      let aValue: any = a[field as keyof Payment];
      let bValue: any = b[field as keyof Payment];

      if (field === 'paymentDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}