// admin/stats/stats.component.ts
import { Component, OnInit } from '@angular/core';
import { StatsService, DashboardStats, InscriptionsJournalieres } from '../../services/stats.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  inscriptionsJournalieres: InscriptionsJournalieres | null = null;
  
  loading = true;
  periodeDebut: string = this.getDateMinusDays(6);
  periodeFin: string = this.getToday();
  
  // Données pour les graphiques
  chartData: any[] = [];
  chartLabels: string[] = [];
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadAllStats();
  }

  loadAllStats(): void {
    this.loading = true;
    
    // Charger stats dashboard
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardStats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stats dashboard', err);
        this.loading = false;
      }
    });
    
    // Charger inscriptions journalières
    this.loadInscriptionsJournalieres();
  }

  loadInscriptionsJournalieres(): void {
    this.statsService.getInscriptionsJournalieres(this.periodeDebut, this.periodeFin).subscribe({
      next: (data) => {
        this.inscriptionsJournalieres = data;
        this.prepareChartData();
      },
      error: (err) => console.error('Erreur chargement stats journalières', err)
    });
  }

  prepareChartData(): void {
    if (!this.inscriptionsJournalieres) return;
    
    // Labels (jours)
    this.chartLabels = Object.keys(this.inscriptionsJournalieres.parJour).sort();
    
    // Données pour le graphique
    const datasets = [];
    
    // Dataset pour le total par jour
    datasets.push({
      label: 'Total inscriptions',
      data: this.chartLabels.map(date => this.inscriptionsJournalieres!.parJour[date] || 0),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    });
    
    // Ajouter les top formations
    const topFormations = Object.keys(this.inscriptionsJournalieres.parFormation)
      .sort((a, b) => (this.inscriptionsJournalieres!.parFormation[b] || 0) - (this.inscriptionsJournalieres!.parFormation[a] || 0))
      .slice(0, 5);
    
    topFormations.forEach(formation => {
      const data = this.chartLabels.map(date => 
        this.inscriptionsJournalieres!.detailParJourEtFormation[date]?.[formation] || 0
      );
      
      datasets.push({
        label: formation.substring(0, 15) + (formation.length > 15 ? '...' : ''),
        data: data,
        borderColor: this.getRandomColor(),
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      });
    });
    
    this.chartData = datasets;
  }

  filtrerParPeriode(): void {
    this.loadInscriptionsJournalieres();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDateMinusDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  getRandomColor(): string {
    const colors = ['#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0', '#ff9a9e'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getTotalFormations(): number {
    return this.dashboardStats?.totalFormations || 0;
  }

  getPourcentageComplet(): number {
    if (!this.dashboardStats) return 0;
    return Math.round((this.dashboardStats.formationsCompletes / this.dashboardStats.totalFormations) * 100);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  getTopFormationsEntries(): [string, number][] {
    return Object.entries(this.dashboardStats?.topFormations || {});
  }
}