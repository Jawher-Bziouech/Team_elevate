/*export interface Course {
  id?: number;
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  language: string;
  price: number;
  status: string;
  trainerId: number;
  formationId: number;
}*/
export interface Course {
  id?: number;
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  language: string;
  price: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  trainerId?: number;
  trainerName?: string;
  formationId: number;
  formationName?: string;
}

export interface CourseRequest {
  title: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  language: string;
  price: number;
  status: string;
  trainerId?: number;
  trainerName?: string;
  formationId: number;
  formationName?: string;
}

export interface BulkCourseRequest {
  courses: CourseRequest[];
  formationId: number;
  formationName: string;
}

export interface Formation {
  id: number;
  nom: string;
  description: string;
  responsable: string;
}