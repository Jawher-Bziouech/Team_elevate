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
  newQuiz: Quiz = this.getEmptyQuiz();

  // Modal & wizard state
  showCreateModal = false;
  createStep: 'templates' | 'form' | 'wizard' = 'templates';
  wizardStep = 1; // 1=Basic Info, 2=Questions, 3=Review
  editingQuiz: Quiz | null = null;

  // Search & pagination
  searchTerm = '';
  difficultyFilter = '';
  currentPage = 1;
  pageSize = 5;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  getEmptyQuiz(): Quiz {
    return { title: '', description: '', duration: 15, difficulty: 'MEDIUM', questions: [] };
  }

  loadQuizzes() {
    this.quizService.getAllQuizzes().subscribe(data => {
      this.quizzes = data;
    });
  }

  // Filtered & paginated
  get filteredQuizzes(): Quiz[] {
    let result = this.quizzes;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(term) ||
        q.description.toLowerCase().includes(term)
      );
    }
    if (this.difficultyFilter) {
      result = result.filter(q => q.difficulty === this.difficultyFilter);
    }
    return result;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredQuizzes.length / this.pageSize);
  }

  get pagedQuizzes(): Quiz[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredQuizzes.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Modal controls
  openCreateModal() {
    this.showCreateModal = true;
    this.createStep = 'templates';
    this.wizardStep = 1;
    this.newQuiz = this.getEmptyQuiz();
    this.editingQuiz = null;
  }

  openEditModal(quiz: Quiz) {
    this.editingQuiz = quiz;
    this.newQuiz = {
      ...quiz,
      questions: quiz.questions ? [...quiz.questions] : []
    };
    this.showCreateModal = true;
    this.createStep = 'wizard';
    this.wizardStep = 1;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.editingQuiz = null;
  }

  selectTemplate(type: string) {
    if (type === 'standard') {
      this.newQuiz.duration = 30;
    } else if (type === 'quick') {
      this.newQuiz.duration = 10;
    } else {
      this.newQuiz.duration = 15;
    }
    this.createStep = 'wizard';
    this.wizardStep = 1;
  }

  // Wizard navigation
  nextWizardStep() {
    if (this.wizardStep < 3) this.wizardStep++;
  }

  prevWizardStep() {
    if (this.wizardStep > 1) this.wizardStep--;
  }

  // Question/Answer builders (preserved from original)
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
      alert('Please provide a title and at least one question.');
      return;
    }
    if (this.editingQuiz) {
      this.quizService.updateQuiz(this.editingQuiz.id!, this.newQuiz).subscribe(() => {
        this.showCreateModal = false;
        this.editingQuiz = null;
        this.loadQuizzes();
        alert('Quiz Updated Successfully!');
      });
    } else {
      this.quizService.createQuiz(this.newQuiz).subscribe(() => {
        this.showCreateModal = false;
        this.loadQuizzes();
        alert('Quiz Created Successfully!');
      });
    }
  }

  deleteQuiz(id: number) {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(id).subscribe(() => {
        this.quizzes = this.quizzes.filter(q => q.id !== id);
      });
    }
  }
}
