/*import { Component } from '@angular/core';

@Component({
  selector: 'app-formation-courses',
  templateUrl: './formation-courses.component.html',
  styleUrl: './formation-courses.component.css'
})
export class FormationCoursesComponent {

}*/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { Course } from '../models/course.model';

@Component({
  selector: 'app-formation-courses',
  templateUrl: './formation-courses.component.html',
  styleUrls: ['./formation-courses.component.css']
})
export class FormationCoursesComponent implements OnInit {
  formationId!: number;
  formationName: string = '';
  courses: Course[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.formationId = Number(this.route.snapshot.paramMap.get('formationId'));
    this.formationName = history.state.formationName || 'Formation';
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCoursesByFormation(this.formationId).subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Impossible de charger les cours';
        this.loading = false;
      }
    });
  }

  addCourses(): void {
    this.router.navigate(['/backoffice/courses/bulk'], {
      state: { 
        formationId: this.formationId,
        formationName: this.formationName 
      }
    });
  }

  editCourse(id: number): void {
    this.router.navigate(['/backoffice/course/edit', id]);
  }

  deleteCourse(id: number): void {
    if (confirm('Supprimer ce cours ?')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.loadCourses();
          alert('Cours supprimé');
        },
        error: (error) => alert('Erreur: ' + error.message)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/backoffice/formations']);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIF': return 'badge bg-success';
      case 'INACTIF': return 'badge bg-danger';
      case 'EN_PREPARATION': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }
}
