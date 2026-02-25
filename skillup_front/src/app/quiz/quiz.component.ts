import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuizService } from '../quiz.service';
import { AuthService } from '../auth.service';
import { Quiz, QuizResultResponse } from '../models/quiz.model';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  quizzes: Quiz[] = [];
  selectedQuiz: Quiz | null = null;
  currentQuestionIndex = 0;
  userAnswers: { [questionId: number]: number } = {};
  showResults = false;
  result: QuizResultResponse | null = null;
  submitting = false;

  // Timer
  timerSeconds = 0;
  timerInterval: any = null;

  constructor(private quizService: QuizService, private authService: AuthService) { }

  ngOnInit(): void {
    this.quizService.getAllQuizzes().subscribe(data => {
      this.quizzes = data;
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startQuiz(quiz: Quiz): void {
    this.selectedQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.showResults = false;
    this.result = null;
    this.timerSeconds = 0;
    this.startTimer();
  }

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => this.timerSeconds++, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTime(): string {
    const m = Math.floor(this.timerSeconds / 60);
    const s = this.timerSeconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  selectAnswer(questionId: number, answerId: number): void {
    this.userAnswers[questionId] = answerId;
  }

  nextQuestion(): void {
    if (this.selectedQuiz && this.currentQuestionIndex < this.selectedQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  finishQuiz(): void {
    if (!this.selectedQuiz) return;
    this.stopTimer();
    this.submitting = true;

    const userId = this.authService.getUserId() || 1;
    const answers = this.selectedQuiz.questions.map(q => ({
      questionId: q.id!,
      selectedAnswerId: this.userAnswers[q.id!] || 0
    }));

    this.quizService.submitQuiz({
      userId,
      quizId: this.selectedQuiz.id!,
      timeTakenSeconds: this.timerSeconds,
      answers
    }).subscribe({
      next: (res) => {
        this.result = res;
        this.showResults = true;
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
        alert('Error submitting quiz. Please try again.');
      }
    });
  }

  getBadgeLabel(badge: string): string {
    const labels: { [key: string]: string } = {
      'FIRST_STEP': 'First Step',
      'QUIZ_ENTHUSIAST': 'Quiz Enthusiast',
      'QUIZ_MASTER': 'Quiz Master',
      'PERFECT_SCORE': 'Perfect Score',
      'SHARP_MIND': 'Sharp Mind',
      'CONSISTENT': 'Consistent',
      'SPEED_DEMON': 'Speed Demon',
      'QUICK_THINKER': 'Quick Thinker',
      'CREDIT_STARTER': 'Credit Starter',
      'CREDIT_COLLECTOR': 'Credit Collector',
      'CREDIT_CHAMPION': 'Credit Champion',
      'THREE_DAY_STREAK': '3-Day Streak',
      'SEVEN_DAY_STREAK': '7-Day Streak'
    };
    return labels[badge] || badge;
  }

  getBadgeIcon(badge: string): string {
    const icons: { [key: string]: string } = {
      'FIRST_STEP': '🚀', 'QUIZ_ENTHUSIAST': '📚', 'QUIZ_MASTER': '👑',
      'PERFECT_SCORE': '💯', 'SHARP_MIND': '🧠', 'CONSISTENT': '🔥',
      'SPEED_DEMON': '⚡', 'QUICK_THINKER': '💡',
      'CREDIT_STARTER': '🪙', 'CREDIT_COLLECTOR': '💰', 'CREDIT_CHAMPION': '🏆',
      'THREE_DAY_STREAK': '📅', 'SEVEN_DAY_STREAK': '🗓️'
    };
    return icons[badge] || '🏅';
  }

  reset(): void {
    this.selectedQuiz = null;
    this.result = null;
  }
}
