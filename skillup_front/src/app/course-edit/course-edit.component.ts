import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { Course } from '.././models/course.model';

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html'
})
export class CourseEditComponent implements OnInit {
  courseForm: FormGroup;
  courseId!: number;
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  // Options pour les sélecteurs
  categories = ['Développement', 'Design', 'Marketing', 'Business', 'Data Science', 'Cybersécurité'];
  levels = ['Débutant', 'Intermédiaire', 'Avancé'];
  languages = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand'];
  statuses = ['ACTIF', 'EN_PREPARATION', 'INACTIF'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: [''],
      level: [''],
      durationHours: ['', [Validators.min(1)]],
      language: [''],
      price: ['', [Validators.min(0)]],
      status: ['ACTIF'],
      trainerId: [null],
      trainerName: [''],
      formationId: ['', Validators.required],
      formationName: ['']
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourse();
  }

  loadCourse(): void {
    this.loading = true;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          durationHours: course.durationHours,
          language: course.language,
          price: course.price,
          status: course.status,
          trainerId: course.trainerId,
          trainerName: course.trainerName,
          formationId: course.formationId,
          formationName: course.formationName
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du cours';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const courseData = {
      ...this.courseForm.value,
      durationHours: this.courseForm.value.durationHours ? Number(this.courseForm.value.durationHours) : null,
      price: this.courseForm.value.price ? Number(this.courseForm.value.price) : null,
      trainerId: this.courseForm.value.trainerId ? Number(this.courseForm.value.trainerId) : null
    };

    this.courseService.updateCourse(this.courseId, courseData).subscribe({
      next: (response) => {
        this.successMessage = 'Cours modifié avec succès';
        setTimeout(() => {
          this.router.navigate(['/courses']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la modification';
        this.submitting = false;
        console.error('Erreur:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/courses']);
  }

  // Utilitaires pour la validation
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.courseForm.get(fieldName);
    return field?.hasError(errorType) && field.touched || false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('minlength')) {
      return 'Minimum 3 caractères';
    }
    if (field?.hasError('min')) {
      return `La valeur minimum est ${field.errors?.['min'].min}`;
    }
    return '';
  }
}