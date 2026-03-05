import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  showMenu = false;
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  private pollInterval: any;

  constructor(
    public authService: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.pollInterval = setInterval(() => this.loadNotifications(), 30000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadNotifications(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.notifService.getUnreadCount(userId).subscribe({
      next: (count) => this.unreadCount = count,
      error: () => {}
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showMenu = false;
    if (this.showNotifications) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.notifService.getNotifications(userId).subscribe({
          next: (data) => this.notifications = data,
          error: () => {}
        });
      }
    }
  }

  goToPost(notification: any): void {
    this.showNotifications = false;
    this.router.navigate(['/forum'], { queryParams: { postId: notification.postId } });
    const userId = this.authService.getUserId();
    if (userId) {
      this.notifService.markAllAsRead(userId).subscribe(() => {
        this.unreadCount = 0;
        this.notifications.forEach(n => n.read = true);
      });
    }
  }

  markAllRead(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notifService.markAllAsRead(userId).subscribe(() => {
        this.unreadCount = 0;
        this.notifications.forEach(n => n.read = true);
      });
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
    this.showNotifications = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
