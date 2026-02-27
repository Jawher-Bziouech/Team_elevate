import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../course.service';
import { Course } from '../models/course.model';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html'
})
export class CourseComponent implements OnInit {

  courses: Course[] = [];
  courseForm!: FormGroup;
  isEdit = false;
  selectedId!: number;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  initForm() {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [''],
      level: [''],
      durationHours: [0],
      language: [''],
      price: [0],
      status: ['ACTIVE'],
      trainerId: [0],
      formationId: [0]
    });
  }

  loadCourses() {
    this.courseService.getAll().subscribe(data => {
      this.courses = data;
    });
  }

  submit() {
    if (this.isEdit) {
      this.courseService.update(this.selectedId, this.courseForm.value)
        .subscribe(() => {
          this.reset();
          this.loadCourses();
        });
    } else {
      this.courseService.add(this.courseForm.value)
        .subscribe(() => {
          this.reset();
          this.loadCourses();
        });
    }
  }

  edit(course: Course) {
    this.isEdit = true;
    this.selectedId = course.id!;
    this.courseForm.patchValue(course);
  }

  delete(id: number) {
    this.courseService.delete(id).subscribe(() => {
      this.loadCourses();
    });
  }

  reset() {
    this.isEdit = false;
    this.courseForm.reset();
  }
}