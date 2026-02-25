export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  content: string;
  answers: Answer[];
}

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  duration: number; // minutes
  questions: Question[];
}