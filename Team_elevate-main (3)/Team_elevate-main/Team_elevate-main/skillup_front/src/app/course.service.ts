import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CourseRequest, BulkCourseRequest, UserCourseProgress } from './models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private apiUrl = 'http://localhost:9090/api/courses';

  constructor(private http: HttpClient) { }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  searchCourses(query: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/search?query=${query}`);
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

  uploadCoursePdf(id: number, file: File): Observable<Course> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Course>(`${this.apiUrl}/${id}/upload-pdf`, formData);
  }

  toggleFavorite(courseId: number, userId: number): Observable<boolean> {
  return this.http.post<boolean>(`${this.apiUrl}/${courseId}/favorite/${userId}`, {});
}

  getFavoriteCourses(userId: number): Observable<Course[]> {
  return this.http.get<Course[]>(`${this.apiUrl}/favorites/user/${userId}`);
}

  canOpenCourse(courseId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${courseId}/can-open/${userId}`);
  }

  updateProgress(courseId: number, userId: number, timeSpentDelta: number): Observable<UserCourseProgress> {
    let params = new HttpParams().set('timeSpentDelta', timeSpentDelta.toString());
    return this.http.post<UserCourseProgress>(`${this.apiUrl}/${courseId}/progress/${userId}`, null, { params });
  }

  getProgress(courseId: number, userId: number): Observable<UserCourseProgress> {
    return this.http.get<UserCourseProgress>(`${this.apiUrl}/${courseId}/progress/${userId}`);
  }
  getRecommendations(userId: number): Observable<Course[]> {
  return this.http.get<Course[]>(`${this.apiUrl}/recommendations/${userId}`);
}
// Top 5 populaires
  getPopularCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/popular`);
  }

  // Recommandations par catégorie
  getRecommendedByCategory(userId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/recommendations/category/${userId}`);
  }

  // Recherche par mot-clé
  searchByKeyword(keyword: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/search/keyword?q=${keyword}`);
  }

  // Matching par compétences
  matchBySkills(userId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/match/skills/${userId}`);
  }
  saveVideoTime(courseId: number, userId: number, currentTimeSeconds: number): Observable<UserCourseProgress> {
    const params = new HttpParams().set('currentTimeSeconds', currentTimeSeconds.toString());
    return this.http.post<UserCourseProgress>(
        `${this.apiUrl}/${courseId}/progress/${userId}/save-time`, 
        null, 
        { params }
    );
}
}