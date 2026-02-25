export interface Post {
  id?: number;
  title: string;
  content: string;
  authorId: number;
  createdAt?: string;
  comments?: Comment[];
}

export interface Comment {
  id?: number;
  content: string;
  authorId: number;
  createdAt?: string;
  post?: { id: number };
}