/*import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '.././course.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-course-form',
  templateUrl: './bulk-course-form.component.html',
  styleUrls: ['./bulk-course-form.component.css']
})
export class BulkCourseFormComponent implements OnInit {
  formationId!: number;
  formationName!: string;
  
  bulkForm: FormGroup;
  loading = false;
  errorMessage = '';

  categories = ['Développement', 'Design', 'Marketing', 'Business', 'Langues'];
  levels = ['Débutant', 'Intermédiaire', 'Avancé'];
  languages = ['Français', 'Anglais', 'Arabe', 'Espagnol'];
  statuses = ['ACTIF', 'INACTIF', 'EN_PREPARATION'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router
  ) {
    this.bulkForm = this.fb.group({
      courses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const state = history.state;
    this.formationId = state.formationId;
    this.formationName = state.formationName;
    
    if (!this.formationId) {
      this.router.navigate(['/backoffice/formations']);
      return;
    }
    
    this.addCourse(); // Ajouter un premier cours par défaut
  }

  get coursesArray() {
    return this.bulkForm.get('courses') as FormArray;
  }

  createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      level: ['', Validators.required],
      durationHours: ['', [Validators.required, Validators.min(1)]],
      language: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      status: ['ACTIF', Validators.required],
      trainerId: [null],
      trainerName: ['']
    });
  }

  addCourse(): void {
    this.coursesArray.push(this.createCourseForm());
  }

  removeCourse(index: number): void {
    this.coursesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.bulkForm.invalid) {
      Object.keys(this.bulkForm.controls).forEach(key => {
        this.bulkForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    
    const bulkRequest = {
      formationId: this.formationId,
      formationName: this.formationName,
      courses: this.bulkForm.value.courses
    };

    this.courseService.addBulkCourses(bulkRequest).subscribe({
      next: () => {
        this.loading = false;
        alert(`${this.coursesArray.length} cours ajoutés avec succès à la formation`);
        this.router.navigate(['/backoffice/courses/formation', this.formationId]);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur lors de l\'ajout des cours';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/backoffice/courses/formation', this.formationId]);
  }
}*/


import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../course.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-course-form',
  templateUrl: './bulk-course-form.component.html'
})
export class BulkCourseFormComponent implements OnInit {
  bulkForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  categories = ['Développement', 'Design', 'Marketing', 'Business'];
  levels = ['Débutant', 'Intermédiaire', 'Avancé'];
  languages = ['Français', 'Anglais', 'Arabe'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router
  ) {
    this.bulkForm = this.fb.group({
      formationId: ['', Validators.required],
      formationName: [''],
      courses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addCourse();
  }

  get coursesArray() {
    return this.bulkForm.get('courses') as FormArray;
  }

  createCourseForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      level: [''],
      durationHours: [''],
      language: [''],
      price: [''],
      status: ['ACTIF'],
      trainerId: [null],
      trainerName: ['']
    });
  }

  addCourse(): void {
    this.coursesArray.push(this.createCourseForm());
  }

  removeCourse(index: number): void {
    this.coursesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.bulkForm.invalid) {
      this.errorMessage = 'Veuillez remplir l\'ID de la formation';
      return;
    }

    this.loading = true;
    this.courseService.addBulkCourses(this.bulkForm.value).subscribe({
      next: (response) => {
        this.successMessage = `${response.length} cours ajoutés`;
        setTimeout(() => this.router.navigate(['/courses']), 2000);
      },
      error: () => {
        this.errorMessage = 'Erreur d\'ajout';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/courses']);
  }
}