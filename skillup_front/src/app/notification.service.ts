import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private authService: AuthService) {}

  // Version simple - juste un message dans la console
  showNotification(message: string): void {
    console.log('🔔 Notification:', message);
    // Vous pouvez utiliser une bibliothèque de toast ici si vous en avez une
    alert(message);
  }
}