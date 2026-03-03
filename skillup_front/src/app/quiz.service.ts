import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, QuizSubmissionRequest, QuizResultResponse, QuizAttempt, UserBadge, UserProgression } from './models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:9090/quiz';
  private gamificationUrl = 'http://localhost:9090/quiz/gamification';

  constructor(private http: HttpClient) { }

  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.apiUrl);
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitQuiz(request: QuizSubmissionRequest): Observable<QuizResultResponse> {
    return this.http.post<QuizResultResponse>(`${this.gamificationUrl}/submit`, request);
  }

  getUserAttempts(userId: number): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.gamificationUrl}/attempts/user/${userId}`);
  }

  getUserProgression(userId: number): Observable<UserProgression> {
    return this.http.get<UserProgression>(`${this.gamificationUrl}/progression/${userId}`);
  }

  getUserBadges(userId: number): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.gamificationUrl}/badges/${userId}`);
  }

  getLeaderboard(): Observable<UserProgression[]> {
    return this.http.get<UserProgression[]>(`${this.gamificationUrl}/leaderboard`);
  }
}
