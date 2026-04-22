import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { CourseService } from '../course.service';
import { Course } from '../models/course.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-course-advanced-features',
  templateUrl: './course-advanced-features.component.html'
})
export class CourseAdvancedFeaturesComponent implements OnInit {
  popularCourses: Course[] = [];
  recommendedCourses: Course[] = [];
  keywordResults: Course[] = [];
  matchedCourses: Course[] = [];
  keyword: string = '';
  userId: number;
@Output() courseSelected = new EventEmitter<Course>(); 
  constructor(private courseService: CourseService, private authService: AuthService) {
    this.userId = this.authService.getUserId() ?? 0;
  }

  ngOnInit(): void {
    this.loadPopular();
    this.loadRecommendations();
  }

  loadPopular(): void {
    this.courseService.getPopularCourses().subscribe(data => this.popularCourses = data);
  }

  loadRecommendations(): void {
    if (this.userId) {
      this.courseService.getRecommendedByCategory(this.userId).subscribe(data => this.recommendedCourses = data);
    }
  }

  searchByKeyword(): void {
    if (this.keyword.trim()) {
      this.courseService.searchByKeyword(this.keyword).subscribe(data => this.keywordResults = data);
    }
  }

  loadMatching(): void {
    if (this.userId) {
      this.courseService.matchBySkills(this.userId).subscribe(data => this.matchedCourses = data);
    }
  }

  openCourse(course: Course): void {
    this.courseSelected.emit(course);
  }
  
}