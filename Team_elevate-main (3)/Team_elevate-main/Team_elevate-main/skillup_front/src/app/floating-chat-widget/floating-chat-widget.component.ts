import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { Subscription, interval, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InternshipApplication, InternshipService, ChatMessage } from '../services/internship.service';
import { AuthService } from '../auth.service';

interface ChatThread {
  applicationId: number;
  offerTitle: string;
  companyName: string;
  messages: ChatMessage[];
  unread: number;
}

@Component({
  selector: 'app-floating-chat-widget',
  templateUrl: './floating-chat-widget.component.html',
  styleUrls: ['./floating-chat-widget.component.css']
})
export class FloatingChatWidgetComponent implements OnInit, OnDestroy {

  isOpen = false;
  isTrainee = false;
  threads: ChatThread[] = [];
  activeThread: ChatThread | null = null;
  newMessage = '';
  currentUserId: number | null = null;
  totalUnread = 0;

  private pollSub: Subscription | null = null;

  @ViewChild('widgetBody') bodyRef!: ElementRef<HTMLDivElement>;

  constructor(
    private svc: InternshipService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn() || !this.auth.hasRole('TRAINEE')) return;
    this.isTrainee = true;
    this.currentUserId = this.auth.getUserId();
    this.refresh();
    this.pollSub = interval(5000).subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  /** Returns true if this message was sent by the current trainee */
  isMine(msg: ChatMessage): boolean {
    // Robust check — handles both number and string senderId from backend
    return Number(msg.senderId) === Number(this.currentUserId);
  }

  // ─── Refresh: load accepted apps → fetch all messages ────────────────────

  private refresh(): void {
    this.svc.getMyApplications().subscribe({
      next: (apps: InternshipApplication[]) => {
        const accepted = apps.filter(a =>
          a.status === 'ACCEPTED' || (a.status as string) === 'ACCEPTED_BY_COMPANY'
        );
        if (accepted.length === 0) return;

        const calls = accepted.map(app =>
          this.svc.getChatMessages(app.id).pipe(catchError(() => of([] as ChatMessage[])))
        );

        forkJoin(calls).subscribe(results => {
          const newThreads: ChatThread[] = [];

          results.forEach((msgs, i) => {
            const app = accepted[i];

            // Only surface the thread if the COMPANY has sent at least one message
            const companyStarted = msgs.some(m => Number(m.senderId) !== Number(this.currentUserId));
            if (!companyStarted) return;

            const existing = this.threads.find(t => t.applicationId === app.id);
            const prevLen = existing?.messages.length ?? 0;

            // New company messages since last poll → count as unread unless chat is open
            const newCompanyMsgs = msgs
              .slice(prevLen)
              .filter(m => Number(m.senderId) !== Number(this.currentUserId));

            const chatIsOpen = this.isOpen && this.activeThread?.applicationId === app.id;
            const addedUnread = chatIsOpen ? 0 : newCompanyMsgs.length;

            newThreads.push({
              applicationId: app.id,
              offerTitle: app.offerTitle || `Offer #${app.internshipOfferId}`,
              companyName: app.companyName || 'Company',
              messages: msgs,                               // ALL messages, both sides
              unread: (existing?.unread ?? 0) + addedUnread
            });
          });

          this.threads = newThreads;

          // Keep active thread in sync
          if (this.activeThread) {
            const fresh = this.threads.find(t => t.applicationId === this.activeThread!.applicationId);
            if (fresh) {
              fresh.unread = 0;
              this.activeThread = fresh;
              this.scrollToBottom();
            } else {
              this.activeThread = null;
            }
          }

          this.totalUnread = this.threads.reduce((s, t) => s + t.unread, 0);
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ─── UI actions ───────────────────────────────────────────────────────────

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.threads.length === 1 && !this.activeThread) {
      this.open(this.threads[0]);
    }
  }

  open(thread: ChatThread): void {
    thread.unread = 0;
    this.totalUnread = this.threads.reduce((s, t) => s + t.unread, 0);
    this.activeThread = thread;
    this.scrollToBottom();
  }

  back(): void {
    this.activeThread = null;
  }

  send(): void {
    if (!this.newMessage.trim() || !this.activeThread) return;
    const content = this.newMessage.trim();
    this.newMessage = '';

    this.svc.sendChatMessage(this.activeThread.applicationId, content).subscribe({
      next: (msg) => {
        this.activeThread!.messages = [...this.activeThread!.messages, msg];
        this.scrollToBottom();
      },
      error: () => { this.newMessage = content; }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.bodyRef?.nativeElement) {
        this.bodyRef.nativeElement.scrollTop = this.bodyRef.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
