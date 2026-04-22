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
    topCertificats: { name: string, count: number }[] = [];

    // --- NEW: Certificate Stats variables ---
  certStats = {
    total: 0,
    approved: 0,
    pending: 0,
    expired: 0,
    expiringSoon: 0
  };
  certChartData: any[] = [];
  certChartLabels: string[] = ['Approved', 'Pending', 'Expired', 'Expiring Soon'];

  userNames: { [userId: number]: string } = {};  // NEW: cache of userId → username

  constructor(private certService: CertificatService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.certService.getAll().subscribe(data => {
      this.allCertificats = data;
      this.resolveUserNames();
      
      // --- NEW STATS CALCULATION ---
      // Reset counters first
      this.certStats = { total: data.length, approved: 0, pending: 0, expired: 0, expiringSoon: 0 };
      
      data.forEach(c => {
        if (c.status === 'APPROVED') this.certStats.approved++;
        else if (c.status === 'PENDING') this.certStats.pending++;
        else if (c.status === 'EXPIRED') this.certStats.expired++;
        else if (c.status === 'EXPIRING_SOON') this.certStats.expiringSoon++;
      });

      // Initialize Pie Chart automatically!
      this.certChartData = [
        {
          data: [
            this.certStats.approved, 
            this.certStats.pending, 
            this.certStats.expired, 
            this.certStats.expiringSoon
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#fcd34d'], // Green, Yellow, Red, Amber
          borderWidth: 0
        }
        
      ];
            // ... your pie chart code ...

      // --- NEW ADVANACED STATS CALCULATION (Most popular certs) ---
      const certCountMap: { [key: string]: number } = {};
      
      // Count every occurrence of a certificate name
      data.forEach(c => {
        if (c.nom) {
          certCountMap[c.nom] = (certCountMap[c.nom] || 0) + 1;
        }
      });

      // Convert the map to an array, sort it from highest to lowest, and take the Top 5
      this.topCertificats = Object.keys(certCountMap)
        .map(key => ({ name: key, count: certCountMap[key] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Only keep the top 5

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