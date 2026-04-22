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
  createdAt?: string | Date;
  updatedAt?: string | Date;
  trainerId?: number | null;
  trainerName?: string | null;
  formationId?: number | null;
  formationName?: string;
  contentType?: string; // 'PDF' or 'VIDEO'
  contentUrl?: string;
  prerequisiteId?: number | null;
  viewsCount?: number; 
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
  formationId?: number | null;
  formationName?: string;
  contentType?: string;
  contentUrl?: string;
  prerequisiteId?: number | null;
}

export interface BulkCourseRequest {
  courses: CourseRequest[];
  formationId: number;
  formationName: string;
}

export interface UserCourseProgress {
  id?: number;
  userId: number;
  course: Course;
  viewTimeSeconds: number;
  isOpened: boolean;
  isCompleted: boolean;
  lastAccessedAt: string | Date;
}