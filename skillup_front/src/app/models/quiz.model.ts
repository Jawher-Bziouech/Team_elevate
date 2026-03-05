export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  content: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  answers: Answer[];
}

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  duration: number; // minutes
  type?: string;    // Used as category
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questions: Question[];
}

// Gamification models
export interface QuestionAnswerDTO {
  questionId: number;
  selectedAnswerId: number;
}

export interface QuizSubmissionRequest {
  userId: number;
  quizId: number;
  timeTakenSeconds: number;
  answers: QuestionAnswerDTO[];
}

export interface QuizResultResponse {
  score: number;
  passed: boolean;
  creditsEarned: number;
  newBadges: string[];
  attemptId: number;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  score: number;
  timeTakenSeconds: number;
  allowedTimeSeconds: number;
  creditsEarned: number;
  passed: boolean;
  attemptDate: string;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeType: string;
  earnedDate: string;
}

export interface UserProgression {
  id: number;
  userId: number;
  totalCredits: number;
  totalAttempts: number;
  totalPassed: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  consecutivePassCount: number;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  totalCredits: number;
  totalAttempts: number;
  totalPassed: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
}