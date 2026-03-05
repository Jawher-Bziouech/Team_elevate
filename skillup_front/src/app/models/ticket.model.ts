/*export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: string;
}*/
// src/app/models/ticket.model.ts
/*export interface Ticket {
  ticketId?: number;
  description: string;
  category: string;
  status?: string;
  createdAt?: Date;

  createdBy?: number;
  createdByRole?: string;
  createdByName?: string;

  adminId?: number;
  adminName?: string;
  adminResponse?: string;
  responseDate?: Date;
  responseEditable?: boolean;

  resolutionDescription?: string;
  resolutionDate?: Date;
}
*/
/*export interface Ticket {
  ticketId?: number;
  description: string;
  category: string;
  status?: string;
  createdAt?: Date;
  createdBy?: number;
  createdByRole?: string;
  createdByName?: string;
  adminId?: number;
  adminName?: string;
  adminResponse?: string;
  responseDate?: Date;
  responseEditable?: boolean;
  resolutionDescription?: string;
  resolutionDate?: Date;
}*/
// models/ticket.model.ts
/*export interface Ticket {
  ticketId?: number;
  description: string;
  category: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  createdBy?: number;
  createdByRole?: string;
  createdByName?: string;
  
  adminId?: number;
  adminName?: string;
  adminResponse?: string;
  responseDate?: Date;
  responseEditable?: boolean;
  
  resolutionDescription?: string;
  resolutionDate?: Date;
  
  // Pour les statistiques
  responseTimeInMinutes?: number;
  formattedResponseTime?: string;
  
  // Pour les pièces jointes
  attachments?: Attachment[];
  
  // Pour les évaluations
  averageRating?: number;
  totalRatings?: number;
  userRating?: number;
}

export interface Attachment {
  attachmentId: number;
  ticketId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  fileUrl: string;
}

export interface TicketRating {
  ratingId: number;
  ticketId: number;
  trainerId: number;
  trainerName: string;
  stars: number;
  comment?: string;
  createdAt: Date;
  canEdit: boolean;
}

export interface DashboardStats {
  averageResponseTime: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  responseTimeDetails: AdminResponseTimeStats[];
  averageResponseTimeByCategory: { [key: string]: number };
  ticketsByCategory: { [key: string]: number };
  averageResponseTimeByAdmin: { [key: string]: number };
}

export interface AdminResponseTimeStats {
  ticketId: number;
  createdByName: string;
  createdAt: Date;
  responseDate: Date;
  responseTimeInMinutes: number;
  formattedResponseTime: string;
  adminName: string;
  category: string;
}
*/
export interface Ticket {
  ticketId?: number;
  description: string;
  category: string;
  status?: string;
  createdAt?: Date;
  createdBy?: number;
  createdByRole?: string;
  createdByName?: string;
  adminId?: number;
  adminName?: string;
  adminResponse?: string;
  responseDate?: Date;
  responseEditable?: boolean;
  resolutionDescription?: string;
  resolutionDate?: Date;
  
  // Nouveaux champs pour l'évaluation
  rating?: number;
  ratingComment?: string;
  ratingDate?: Date;
  canBeRated?: boolean;
  attachments?: any[];
}

// AJOUTEZ CE CI-DESSOUS
export interface RatingRequest {
  rating: number;
  comment?: string;
}