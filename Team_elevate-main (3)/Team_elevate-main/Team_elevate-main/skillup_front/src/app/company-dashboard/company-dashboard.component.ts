import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  InternshipApplication,
  InternshipOffer,
  InternshipOfferRequest,
  InternshipService,
  ChatMessage
} from '../services/internship.service';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css']
})
export class CompanyDashboardComponent implements OnInit, OnDestroy {
  offers: InternshipOffer[] = [];

  // Track applicants per offer for the expandable rows
  applicantsMap: { [offerId: number]: InternshipApplication[] } = {};
  loadingApplicantsMap: { [offerId: number]: boolean } = {};
  expandedOfferId: number | null = null;

  loadingOffers = false;
  savingOffer = false;

  offerError = '';
  successMessage = '';

  showOfferModal = false;
  isEditMode = false;
  editingOfferId: number | null = null;

  offerForm: InternshipOfferRequest = this.getEmptyOfferForm();

  // ─── Chat State ───────────────────────────────────────────────────────────
  showChatModal = false;
  chatMessages: ChatMessage[] = [];
  chatLoading = false;
  newMessage = '';
  activeChatApplicationId: number | null = null;
  chatApplicantName = '';
  currentUserId: number | null = null;
  private chatPollSub: Subscription | null = null;

  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;

  constructor(
    private internshipService: InternshipService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOffers();
    this.currentUserId = this.authService.getUserId();
  }

  ngOnDestroy(): void {
    this.stopChatPolling();
  }

  loadOffers(): void {
    this.loadingOffers = true;
    this.offerError = '';

    this.internshipService.getMyOffers().subscribe({
      next: (items) => {
        this.offers = items;
        this.loadingOffers = false;
      },
      error: (err) => {
        this.offerError = err?.error?.message || 'Failed to load internship offers.';
        this.notificationService.error(this.offerError);
        this.loadingOffers = false;
      }
    });
  }

  toggleApplicants(offer: InternshipOffer): void {
    if (this.expandedOfferId === offer.id) {
      this.expandedOfferId = null;
    } else {
      this.expandedOfferId = offer.id;
      if (!this.applicantsMap[offer.id]) {
        this.loadApplicants(offer.id);
      }
    }
  }

  loadApplicants(offerId: number): void {
    this.loadingApplicantsMap[offerId] = true;

    this.internshipService.getApplicationsByOffer(offerId).subscribe({
      next: (items) => {
        console.log('[Dashboard] Applicants loaded:', items);
        this.applicantsMap[offerId] = (items || []).map((item) => {
          // Robust status handling
          let currentStatus = (item.status || 'PENDING').toUpperCase();
          if (currentStatus === 'ACCEPTED_BY_COMPANY') currentStatus = 'ACCEPTED';

          return {
            ...item,
            status: currentStatus as any
          };
        });
        this.loadingApplicantsMap[offerId] = false;
      },
      error: (err) => {
        const error = err?.error?.message || 'Failed to load applicants.';
        this.notificationService.error(error);
        this.loadingApplicantsMap[offerId] = false;
      }
    });
  }

  acceptApplicant(applicationId: number, offerId: number): void {
    // Optimistic Update
    const applicant = this.applicantsMap[offerId]?.find(a => a.id === applicationId);
    if (applicant) {
      applicant.status = 'ACCEPTED';
    }

    this.internshipService.acceptByCompany(applicationId).subscribe({
      next: () => {
        // Refresh to get official state
        this.loadApplicants(offerId);
      },
      error: (err) => {
        // Rollback on error
        if (applicant) {
          applicant.status = 'PENDING';
        }
        const error = err?.error?.message || 'Failed to accept applicant.';
        this.notificationService.error(error);
      }
    });
  }

  rejectApplicant(applicationId: number, offerId: number): void {
    // Optimistic Update
    const applicant = this.applicantsMap[offerId]?.find(a => a.id === applicationId);
    if (applicant) {
      applicant.status = 'REJECTED';
    }

    this.internshipService.rejectApplication(applicationId).subscribe({
      next: () => {
        // Refresh to get official state
        this.loadApplicants(offerId);
      },
      error: (err) => {
        // Rollback on error
        if (applicant) {
          applicant.status = 'PENDING';
        }
        const error = err?.error?.message || 'Failed to reject applicant.';
        this.notificationService.error(error);
      }
    });
  }

  // ─── Chat Methods ─────────────────────────────────────────────────────────

  /** Robust ownership check: Java Long serialized as number, so cast both sides */
  isMine(senderId: number): boolean {
    return Number(senderId) === Number(this.currentUserId);
  }

  openChat(app: InternshipApplication): void {
    this.activeChatApplicationId = app.id;
    this.chatApplicantName = app.studentName || `Student #${app.studentUserId}`;
    this.chatMessages = [];
    this.newMessage = '';
    this.showChatModal = true;
    this.loadChatMessages();
    this.startChatPolling();
  }

  closeChatModal(): void {
    this.showChatModal = false;
    this.activeChatApplicationId = null;
    this.stopChatPolling();
  }

  loadChatMessages(): void {
    if (!this.activeChatApplicationId) return;
    this.chatLoading = true;
    this.internshipService.getChatMessages(this.activeChatApplicationId).subscribe({
      next: (msgs) => {
        this.chatMessages = msgs;
        this.chatLoading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.chatLoading = false;
      }
    });
  }

  sendChatMessage(): void {
    if (!this.newMessage.trim() || !this.activeChatApplicationId) return;
    const content = this.newMessage.trim();
    this.newMessage = '';

    this.internshipService.sendChatMessage(this.activeChatApplicationId, content).subscribe({
      next: (msg) => {
        this.chatMessages = [...this.chatMessages, msg];
        this.scrollToBottom();
      },
      error: () => {
        this.notificationService.error('Failed to send message.');
        this.newMessage = content; // Restore on error
      }
    });
  }

  private startChatPolling(): void {
    this.stopChatPolling();
    this.chatPollSub = interval(5000).pipe(
      switchMap(() => this.internshipService.getChatMessages(this.activeChatApplicationId!))
    ).subscribe({
      next: (msgs) => {
        this.chatMessages = msgs;
        this.scrollToBottom();
      }
    });
  }

  private stopChatPolling(): void {
    if (this.chatPollSub) {
      this.chatPollSub.unsubscribe();
      this.chatPollSub = null;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatBodyRef?.nativeElement) {
        this.chatBodyRef.nativeElement.scrollTop = this.chatBodyRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  // ─── Offer Modal Methods ──────────────────────────────────────────────────

  openCreateOfferModal(): void {
    this.isEditMode = false;
    this.editingOfferId = null;
    this.offerForm = this.getEmptyOfferForm();
    this.showOfferModal = true;
  }

  openEditOfferModal(offer: InternshipOffer): void {
    this.isEditMode = true;
    this.editingOfferId = offer.id;
    this.offerForm = {
      title: offer.title,
      description: offer.description,
      requiredSkills: offer.requiredSkills,
      requiredStudyLevel: offer.requiredStudyLevel,
      startDate: this.toInputDate(offer.startDate),
      endDate: this.toInputDate(offer.endDate),
      location: offer.location,
      remuneration: offer.remuneration || '',
      supervisorName: offer.supervisorName,
      expiryDate: this.toInputDate(offer.expiryDate)
    };
    this.showOfferModal = true;
  }

  closeOfferModal(): void {
    this.showOfferModal = false;
  }

  saveOffer(): void {
    this.savingOffer = true;
    this.offerError = '';

    const request$ = this.isEditMode && this.editingOfferId !== null
      ? this.internshipService.updateInternship(this.editingOfferId, this.offerForm)
      : this.internshipService.createInternship(this.offerForm);

    request$.subscribe({
      next: () => {
        this.savingOffer = false;
        this.showOfferModal = false;
        this.loadOffers();
      },
      error: (err) => {
        this.offerError = err?.error?.message || 'Failed to save offer.';
        this.notificationService.error(this.offerError);
        this.savingOffer = false;
      }
    });
  }

  deleteOffer(offer: InternshipOffer): void {
    const confirmed = window.confirm(`Delete offer "${offer.title}"?`);
    if (!confirmed) {
      return;
    }

    this.internshipService.deleteInternship(offer.id).subscribe({
      next: () => {
        this.loadOffers();
      },
      error: (err) => {
        this.offerError = err?.error?.message || 'Failed to delete offer.';
        this.notificationService.error(this.offerError);
      }
    });
  }

  getOfferStatus(offer: InternshipOffer): string {
    return offer.active ? 'Active' : 'Inactive';
  }

  private getEmptyOfferForm(): InternshipOfferRequest {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    return {
      title: '',
      description: '',
      requiredSkills: '',
      requiredStudyLevel: '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      location: '',
      remuneration: '',
      supervisorName: '',
      expiryDate: nextMonth.toISOString().split('T')[0]
    };
  }

  private toInputDate(rawDate: string): string {
    return rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';
  }
}
