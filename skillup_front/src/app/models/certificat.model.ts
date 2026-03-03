export interface Certificat {
  id?: number;
  nom: string;
  issuer: string;
  date: string;
  description: string;
  certificateUrl: string;
  userId: number;
  status?: string; // PENDING, APPROVED, REJECTED
}