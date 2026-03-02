import { Component, OnInit } from '@angular/core';
import { QuizService } from '../quiz.service';
import { Quiz, Question, Answer } from '../models/quiz.model';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  quizzes: Quiz[] = [];
  selectedQuiz: Quiz | null = null;
  currentQuestionIndex = 0;
  userAnswers: { [questionId: number]: number } = {}; 
  showResults = false;
  score = 0;

  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
    this.quizService.getAllQuizzes().subscribe(data => {
      this.quizzes = data;
    });
  }

  startQuiz(quiz: Quiz): void {
    this.selectedQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.showResults = false;
    this.score = 0;
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
    
    let correctCount = 0;
    this.selectedQuiz.questions.forEach(q => {
      const selectedId = this.userAnswers[q.id!];
      const correctAnswer = q.answers.find(a => a.isCorrect);
      if (selectedId === correctAnswer?.id) {
        correctCount++;
      }
    });

    this.score = Math.round((correctCount / this.selectedQuiz.questions.length) * 100);
    this.showResults = true;
  }

  reset(): void {
    this.selectedQuiz = null;
  }
}