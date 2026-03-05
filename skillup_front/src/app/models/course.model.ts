/*export interface Course {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  durationHours?: number;
  language?: string;
  price?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  trainerId?: number;
  trainerName?: string;
  formationId: number;
  formationName?: string;
}

export interface CourseRequest {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  durationHours?: number;
  language?: string;
  price?: number;
  status?: string;
  trainerId?: number;
  trainerName?: string;
  formationId: number;
  formationName?: string;
}

export interface BulkCourseRequest {
  courses: CourseRequest[];
  formationId: number;
  formationName: string;
}*/

export interface Course {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  durationHours?: number;
  language?: string;
  price?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  trainerId?: number | null;
  trainerName?: string | null;
  formationId: number;
  formationName?: string;
}

export interface BulkCourseRequest {
  courses: CourseRequest[];
  formationId: number;
  formationName: string;
}