import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../quiz.service';
import { Quiz, Question, Answer } from '../../models/quiz.model';

@Component({
  selector: 'app-gestion-quiz',
  templateUrl: './gestion-quiz.component.html',
  styleUrls: ['./gestion-quiz.component.css']
})
export class GestionQuizComponent implements OnInit {
  quizzes: Quiz[] = [];
  isCreating = false; // Toggle for the creation form

  // Template for a new Quiz
  newQuiz: Quiz = this.getEmptyQuiz();

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  getEmptyQuiz(): Quiz {
    return { title: '', description: '', duration: 15, questions: [] };
  }

  loadQuizzes() {
    this.quizService.getAllQuizzes().subscribe(data => {
      this.quizzes = data;
    });
  }

  toggleCreate() {
    this.isCreating = !this.isCreating;
    if (this.isCreating) this.newQuiz = this.getEmptyQuiz();
  }

  addQuestion() {
    this.newQuiz.questions.push({ content: '', answers: [] });
  }

  addAnswer(question: Question) {
    question.answers.push({ text: '', isCorrect: false });
  }

  removeQuestion(index: number) {
    this.newQuiz.questions.splice(index, 1);
  }

  saveQuiz() {
    if (!this.newQuiz.title || this.newQuiz.questions.length === 0) {
        alert("Please provide a title and at least one question.");
        return;
    }
    this.quizService.createQuiz(this.newQuiz).subscribe(() => {
      this.isCreating = false;
      this.loadQuizzes();
      alert("Quiz Created Successfully! 🚀");
    });
  }

  deleteQuiz(id: number) {
    if(confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(id).subscribe(() => {
        this.quizzes = this.quizzes.filter(q => q.id !== id);
      });
    }
  }
}