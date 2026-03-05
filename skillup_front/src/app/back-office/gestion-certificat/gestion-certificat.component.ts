import { Component, OnInit } from '@angular/core';
import { CertificatService } from '../../certificat.service';
import { Certificat } from '../../models/certificat.model';

@Component({
  selector: 'app-gestion-certificat',
  templateUrl: './gestion-certificat.component.html',
  styleUrls: ['./gestion-certificat.component.css']
})
export class GestionCertificatComponent implements OnInit {
  allCertificats: Certificat[] = [];
  filterStatus = 'ALL';
  userNames: { [userId: number]: string } = {};  // NEW: cache of userId → username

  constructor(private certService: CertificatService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.certService.getAll().subscribe(data => {
      this.allCertificats = data;
      this.resolveUserNames();  // NEW: fetch usernames via OpenFeign
    });
  }

  // NEW: Resolve usernames for all unique userIds
  resolveUserNames(): void {
    const uniqueUserIds = [...new Set(this.allCertificats.map(c => c.userId))];
    uniqueUserIds.forEach(userId => {
      if (userId && !this.userNames[userId]) {
        this.certService.getUserInfo(userId).subscribe({
          next: (user) => {
            this.userNames[userId] = user.username;
          },
          error: () => {
            this.userNames[userId] = 'Unknown';
          }
        });
      }
    });
  }

  get filteredCertificats(): Certificat[] {
    if (this.filterStatus === 'ALL') return this.allCertificats;
    return this.allCertificats.filter(c => c.status === this.filterStatus);
  }

  approve(id: number): void {
    this.certService.approve(id).subscribe(() => this.loadAll());
  }

  reject(id: number): void {
    this.certService.reject(id).subscribe(() => this.loadAll());
  }

  deleteCert(id: number): void {
    if (confirm('Delete this certificate permanently?')) {
      this.certService.delete(id).subscribe(() => {
        this.allCertificats = this.allCertificats.filter(c => c.id !== id);
      });
    }
  }

  getPendingCount(): number {
    return this.allCertificats.filter(c => c.status === 'PENDING').length;
  }
}