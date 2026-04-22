import { Component, OnInit } from '@angular/core';
import { InternshipOffer, InternshipService, AdminInternshipStats } from '../../services/internship.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-internship-admin',
  templateUrl: './internship-admin.component.html',
  styleUrls: ['./internship-admin.component.css']
})
export class InternshipAdminComponent implements OnInit {
  offers: InternshipOffer[] = [];
  stats: AdminInternshipStats | null = null;
  loading = false;
  error = '';

  constructor(
    private internshipService: InternshipService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadAllOffers();
  }

  loadStats(): void {
    this.internshipService.getAdminInternshipStats().subscribe({
      next: (data) => this.stats = data,
      error: () => this.notificationService.error('Failed to load admin stats.')
    });
  }

  loadAllOffers(): void {
    this.loading = true;
    this.internshipService.getAllInternshipsAdmin().subscribe({
      next: (data) => {
        this.offers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load internship offers.';
        this.loading = false;
        this.notificationService.error(this.error);
      }
    });
  }

  toggleOfferStatus(offer: InternshipOffer): void {
    const updatedOffer = { ...offer, active: !offer.active };
    this.internshipService.updateInternshipAdmin(offer.id, updatedOffer).subscribe({
      next: () => {
        offer.active = !offer.active;
        this.notificationService.success(`Offer ${offer.active ? 'activated' : 'deactivated'} successfully.`);
      },
      error: () => this.notificationService.error('Failed to update offer status.')
    });
  }

  deleteOffer(id: number): void {
    if (confirm('Are you sure you want to delete this internship offer? This action cannot be undone.')) {
      this.internshipService.deleteInternshipAdmin(id).subscribe({
        next: () => {
          this.offers = this.offers.filter(o => o.id !== id);
          this.notificationService.success('Offer deleted successfully.');
          this.loadStats(); // Update counters
        },
        error: () => this.notificationService.error('Failed to delete offer.')
      });
    }
  }
}
