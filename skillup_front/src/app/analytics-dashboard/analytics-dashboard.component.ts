import { Component, OnInit } from '@angular/core';
import { TicketService } from '../ticket.service';
import { Ticket } from '../models/ticket.model';
import Chart from 'chart.js/auto';  // Modifiez l'import comme ceci

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  // Données
  tickets: Ticket[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Période sélectionnée
  selectedPeriod: string = 'month';
  
  // Statistiques globales
  totalTickets: number = 0;
  resolvedTickets: number = 0;
  avgResponseTime: number = 0;
  avgResolutionTime: number = 0;
  satisfactionRate: number = 0;
  
  // Distribution des notes
  ratingDistribution: number[] = [0, 0, 0, 0, 0];
  
  // Performance par admin
  adminPerformance: any[] = [];
  
  // Graphiques
  responseTimeChart: any;
  ratingChart: any;
  weeklyPerformanceChart: any;

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.ticketService.getAllTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.calculateStatistics();
        this.loading = false;
        setTimeout(() => this.createCharts(), 100);
      },
      error: (error) => {
        console.error('Erreur chargement données:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  calculateStatistics() {
    // Tickets résolus
    this.resolvedTickets = this.tickets.filter(t => 
      t.status === 'RESOLVED' || t.status === 'CLOSED'
    ).length;
    
    this.totalTickets = this.tickets.length;
    
    // Calcul des temps de réponse
    const responseTimes: number[] = [];
    const resolutionTimes: number[] = [];
    
    this.tickets.forEach(ticket => {
      if (ticket.createdAt && ticket.responseDate) {
        const created = new Date(ticket.createdAt).getTime();
        const responded = new Date(ticket.responseDate).getTime();
        const responseHours = (responded - created) / (1000 * 60 * 60);
        responseTimes.push(responseHours);
      }
      
      if (ticket.createdAt && ticket.resolutionDate) {
        const created = new Date(ticket.createdAt).getTime();
        const resolved = new Date(ticket.resolutionDate).getTime();
        const resolutionHours = (resolved - created) / (1000 * 60 * 60);
        resolutionTimes.push(resolutionHours);
      }
    });
    
    this.avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    this.avgResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0;
    
    // Taux de satisfaction
    const ratedTickets = this.tickets.filter(t => t.rating);
    const totalRating = ratedTickets.reduce((sum, t) => sum + (t.rating || 0), 0);
    this.satisfactionRate = ratedTickets.length > 0 
      ? (totalRating / (ratedTickets.length * 5)) * 100 
      : 0;
    
    // Distribution des notes
    this.ratingDistribution = [0, 0, 0, 0, 0];
    ratedTickets.forEach(ticket => {
      if (ticket.rating) {
        this.ratingDistribution[ticket.rating - 1]++;
      }
    });
    
    // Performance par admin
    const adminMap = new Map();
    this.tickets.forEach(ticket => {
      if (ticket.adminName && ticket.responseDate && ticket.createdAt) {
        const admin = ticket.adminName;
        if (!adminMap.has(admin)) {
          adminMap.set(admin, {
            name: admin,
            tickets: 0,
            totalResponseTime: 0,
            totalRating: 0,
            ratedTickets: 0
          });
        }
        
        const stats = adminMap.get(admin);
        stats.tickets++;
        
        // Temps de réponse
        const responseTime = (new Date(ticket.responseDate).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
        stats.totalResponseTime += responseTime;
        
        // Évaluations
        if (ticket.rating) {
          stats.totalRating += ticket.rating;
          stats.ratedTickets++;
        }
      }
    });
    
    this.adminPerformance = Array.from(adminMap.values()).map(admin => ({
      name: admin.name,
      ticketsHandled: admin.tickets,
      avgResponseTime: admin.tickets > 0 ? admin.totalResponseTime / admin.tickets : 0,
      avgRating: admin.ratedTickets > 0 ? admin.totalRating / admin.ratedTickets : 0
    }));
  }

  createCharts() {
    this.createResponseTimeChart();
    this.createRatingChart();
    this.createWeeklyPerformanceChart();
  }

  createResponseTimeChart() {
    const ctx = document.getElementById('responseTimeChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Données par jour de la semaine
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const responseByDay = days.map(() => ({ total: 0, count: 0 }));
    
    this.tickets.forEach(ticket => {
      if (ticket.createdAt && ticket.responseDate) {
        const day = new Date(ticket.createdAt).getDay();
        const dayIndex = day === 0 ? 6 : day - 1;
        const responseTime = (new Date(ticket.responseDate).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
        responseByDay[dayIndex].total += responseTime;
        responseByDay[dayIndex].count++;
      }
    });
    
    const avgResponseByDay = responseByDay.map(d => d.count > 0 ? d.total / d.count : 0);
    
    if (this.responseTimeChart) {
      this.responseTimeChart.destroy();
    }
    
    this.responseTimeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Temps de réponse moyen (heures)',
          data: avgResponseByDay,
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Heures'
            }
          }
        }
      }
    });
  }

  createRatingChart() {
    const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.ratingChart) {
      this.ratingChart.destroy();
    }
    
    this.ratingChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['5 ⭐', '4 ⭐', '3 ⭐', '2 ⭐', '1 ⭐'],
        datasets: [{
          data: [...this.ratingDistribution].reverse(),
          backgroundColor: [
            '#10b981',
            '#34d399',
            '#fbbf24',
            '#f97316',
            '#ef4444'
          ].reverse(),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        cutout: '70%'
      }
    });
  }

  createWeeklyPerformanceChart() {
    const ctx = document.getElementById('weeklyPerformanceChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    // Données des 7 derniers jours
    const last7Days = [];
    const ticketsPerDay = [];
    const avgRatingPerDay = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      last7Days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
      
      const dayTickets = this.tickets.filter(t => {
        const created = t.createdAt ? new Date(t.createdAt) : null;
        return created && created >= date && created < nextDate;
      });
      
      ticketsPerDay.push(dayTickets.length);
      
      const dayRatings = dayTickets.filter(t => t.rating).map(t => t.rating || 0);
      const avgRating = dayRatings.length > 0 
        ? dayRatings.reduce((a, b) => a + b, 0) / dayRatings.length 
        : 0;
      avgRatingPerDay.push(avgRating);
    }
    
    if (this.weeklyPerformanceChart) {
      this.weeklyPerformanceChart.destroy();
    }
    
    this.weeklyPerformanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: last7Days,
        datasets: [
          {
            label: 'Tickets créés',
            data: ticketsPerDay,
            backgroundColor: '#4361ee',
            yAxisID: 'y'
          },
          {
            label: 'Note moyenne',
            data: avgRatingPerDay,
            backgroundColor: '#fbbf24',
            yAxisID: 'y1',
            type: 'line',
            borderColor: '#fbbf24',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            title: {
              display: true,
              text: 'Nombre de tickets'
            }
          },
          y1: {
            beginAtZero: true,
            max: 5,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Note moyenne'
            }
          }
        }
      }
    });
  }

  onPeriodChange() {
    this.calculateStatistics();
    this.createCharts();
  }

  formatHours(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}min`;
    } else if (hours < 24) {
      return `${Math.round(hours)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days}j ${remainingHours}h`;
    }
  }

  getRatingLevel(rating: number): string {
    if (rating >= 4.5) return 'good';
    if (rating >= 3) return 'average';
    return 'bad';
  }
  // Ajoutez cette méthode

// Ajoutez ces méthodes dans la classe AnalyticsDashboardComponent

// Total des évaluations
getTotalRatings(): number {
  return this.ratingDistribution.reduce((a, b) => a + b, 0);
}

// Taux de résolution
getResolutionRate(): string {
  return ((this.resolvedTickets / (this.totalTickets || 1)) * 100).toFixed(1);
}

// Label de satisfaction
getSatisfactionLabel(): string {
  if (this.satisfactionRate >= 70) return 'Excellent';
  if (this.satisfactionRate >= 50) return 'Correct';
  return 'À améliorer';
}

// Pourcentage d'une note spécifique
getRatingPercentage(rating: number): number {
  const total = this.getTotalRatings();
  if (total === 0) return 0;
  return (this.ratingDistribution[rating - 1] / total) * 100;
}

// Nombre d'évaluations pour une note spécifique
getRatingCount(rating: number): number {
  return this.ratingDistribution[rating - 1] || 0;
}

// Nombre de notes négatives (1-2⭐)
getLowRatingsCount(): number {
  return this.ratingDistribution[0] + this.ratingDistribution[1];
}

// Nombre de notes positives (5⭐)
getHighRatingsCount(): number {
  return this.ratingDistribution[4];
}

}