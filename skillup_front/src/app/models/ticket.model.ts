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
}