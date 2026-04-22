import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../course.service';
import { Course, CourseRequest } from '../../models/course.model';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit {

  courses: Course[] = [];
  selectedCourse: Course | null = null;
  isEditMode: boolean = false;
  searchQuery: string = '';

  courseForm: CourseRequest = this.resetForm();

  selectedPdfFile: File | null = null;

  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  resetForm(): CourseRequest {
  return {
    title: '',
    description: '',
    category: '',
    level: '',
    durationHours: 0,
    language: '',
    price: 0,
    status: 'EN_PREPARATION',
    contentType: 'VIDEO',
    contentUrl: '',
    prerequisiteId: null,
    trainerId: null,      // <-- ajout
    formationId: null     // <-- ajout
  };
}

  loadCourses(): void {
    if (this.searchQuery) {
      this.courseService.searchCourses(this.searchQuery).subscribe(data => this.courses = data);
    } else {
      this.courseService.getAllCourses().subscribe(data => this.courses = data);
    }
  }

  search(): void {
    this.loadCourses();
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedPdfFile = event.target.files[0];
    }
  }

 editCourse(course: Course): void {
  this.isEditMode = true;
  this.selectedCourse = course;
  this.courseForm = {
    title: course.title,
    description: course.description || '',
    category: course.category || '',
    level: course.level || '',
    durationHours: course.durationHours || 0,
    language: course.language || '',
    price: course.price || 0,
    status: course.status || 'EN_PREPARATION',
    contentType: course.contentType || 'VIDEO',
    contentUrl: course.contentUrl || '',
    prerequisiteId: course.prerequisiteId || null,
    trainerId: course.trainerId || null,     // <-- ajout
    formationId: course.formationId || null  // <-- ajout
  };
}

  deleteCourse(id: number): void {
    if (confirm('Etes-vous sûr de vouloir supprimer ce cours ?')) {
      this.courseService.deleteCourse(id).subscribe(() => {
        this.loadCourses();
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedCourse = null;
    this.courseForm = this.resetForm();
    this.selectedPdfFile = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.selectedCourse?.id) {
      this.courseService.updateCourse(this.selectedCourse.id, this.courseForm).subscribe({
        next: (updated) => {
          if (this.courseForm.contentType === 'PDF' && this.selectedPdfFile) {
             this.courseService.uploadCoursePdf(updated.id!, this.selectedPdfFile).subscribe(() => {
                 this.loadCourses();
                 this.cancelEdit();
             });
          } else {
             this.loadCourses();
             this.cancelEdit();
          }
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la mise à jour: ' + (err.error?.message || err.message || 'Serveur injoignable'));
        }
      });
    } else {
      this.courseService.addCourse(this.courseForm).subscribe({
        next: (added) => {
          if (this.courseForm.contentType === 'PDF' && this.selectedPdfFile) {
             this.courseService.uploadCoursePdf(added.id!, this.selectedPdfFile).subscribe(() => {
                 this.loadCourses();
                 this.cancelEdit();
             });
          } else {
             this.loadCourses();
             this.cancelEdit();
          }
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l\'ajout: ' + (err.error?.message || err.message || 'Serveur injoignable'));
        }
      });
    }
  }
  
}
