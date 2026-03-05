import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuizService } from '../quiz.service';
import { AuthService } from '../auth.service';
import { Quiz, QuizResultResponse } from '../models/quiz.model';
import { BADGE_CONFIG } from '../models/badge.model';

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
  markedQuestions = new Set<number>();

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
    this.markedQuestions.clear();
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

  goToQuestion(index: number): void {
    if (this.selectedQuiz && index >= 0 && index < this.selectedQuiz.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  toggleMarkForReview(questionId: number): void {
    if (this.markedQuestions.has(questionId)) {
      this.markedQuestions.delete(questionId);
    } else {
      this.markedQuestions.add(questionId);
    }
  }

  isMarked(questionId: number): boolean {
    return this.markedQuestions.has(questionId);
  }

  isAnswered(questionId: number): boolean {
    return !!this.userAnswers[questionId];
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
    return BADGE_CONFIG[badge]?.label || BADGE_CONFIG['DEFAULT'].label;
  }

  getBadgeIcon(badge: string): string {
    return BADGE_CONFIG[badge]?.icon || BADGE_CONFIG['DEFAULT'].icon;
  }

  stripOptionLetter(text: string): string {
    if (!text) return '';
    // Removes "A. ", "A - ", "A) " etc.
    return text.replace(/^[A-E][.\s\)-]+/, '').trim();
  }

  getQuizIcon(quiz: Quiz): string {
    const t = (quiz.type || '').toLowerCase();
    const title = (quiz.title || '').toLowerCase();
    const combined = `${t} ${title}`;

    if (combined.includes('javascript') || combined.includes('react') || combined.includes('angular') || combined.includes('web') || combined.includes('html') || combined.includes('css')) return 'globe';
    if (combined.includes('java') || combined.includes('python') || combined.includes('prog') || combined.includes('code')) return 'code';
    if (combined.includes('db') || combined.includes('data') || combined.includes('sql')) return 'database';
    if (combined.includes('design') || combined.includes('ui') || combined.includes('ux')) return 'layout';
    return 'cpu'; // Default techy icon
  }

  reset(): void {
    this.selectedQuiz = null;
    this.result = null;
    this.showResults = false;
  }
}
