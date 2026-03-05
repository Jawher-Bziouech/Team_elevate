/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CourseRequest, BulkCourseRequest } from './models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private apiUrl = 'http://localhost:9090/api/courses'; // Via Gateway

  constructor(private http: HttpClient) { }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCoursesByFormation(formationId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/formation/${formationId}`);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  addCourse(course: CourseRequest): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  addBulkCourses(bulkRequest: BulkCourseRequest): Observable<Course[]> {
    return this.http.post<Course[]>(`${this.apiUrl}/bulk`, bulkRequest);
  }

  updateCourse(id: number, course: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteCoursesByFormation(formationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formation/${formationId}`);
  }
}*/


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CourseRequest, BulkCourseRequest } from './models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private apiUrl = 'http://localhost:9090/api/courses';

  constructor(private http: HttpClient) { }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCoursesByFormation(formationId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/formation/${formationId}`);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  addCourse(course: CourseRequest): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  addBulkCourses(bulkRequest: BulkCourseRequest): Observable<Course[]> {
    return this.http.post<Course[]>(`${this.apiUrl}/bulk`, bulkRequest);
  }

  updateCourse(id: number, course: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteCoursesByFormation(formationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formation/${formationId}`);
  }
}