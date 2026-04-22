import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Formation, FormationService } from '../../formation.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.css']
})
export class FormationsComponent implements OnInit {
  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  categories: string[] = [];
  selectedCategorie: string = '';
  searchTerm: string = '';

  constructor(
    private formationService: FormationService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadCategories();
  }

  loadFormations(): void {
    this.formationService.getAllFormations().subscribe({
      next: (data) => {
        this.formations = data.map(formation => ({
          ...formation,
          couleur: this.getRandomColor()
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur chargement formations', err);
        this.formations = [];
        this.filteredFormations = [];
      }
    });
  }

  loadCategories(): void {
    this.formationService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Erreur chargement catégories', err)
    });
  }

  applyFilters(): void {
    this.filteredFormations = this.formations.filter(f => 
      (this.selectedCategorie === '' || f.categorie === this.selectedCategorie) &&
      (this.searchTerm === '' || 
        f.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategorie = '';
    this.applyFilters();
  }

  viewDetails(id: number): void {
    this.router.navigate(['/formation', id]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/formations']);
  }

  getRandomColor(): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}