import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../course.service';
import { Course } from '.././models/course.model';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html'
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de chargement';
        this.loading = false;
      }
    });
  }

  viewFormationCourses(formationId: number): void {
    this.router.navigate(['/courses/formation', formationId]);
  }

  addBulkCourses(): void {
    this.router.navigate(['/courses/bulk']);
  }

  editCourse(id: number): void {
    this.router.navigate(['/courses/edit', id]);
  }

  deleteCourse(id: number): void {
    if (confirm('Supprimer ce cours ?')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.successMessage = 'Cours supprimé';
          this.loadCourses();
        },
        error: () => this.errorMessage = 'Erreur de suppression'
      });
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIF': return 'badge bg-success';
      case 'INACTIF': return 'badge bg-danger';
      case 'EN_PREPARATION': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }
}