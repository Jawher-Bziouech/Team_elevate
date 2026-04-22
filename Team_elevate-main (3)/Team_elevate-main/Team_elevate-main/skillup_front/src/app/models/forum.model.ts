export interface Post {
  id?: number;
  title: string;
  content: string;
  authorId: number;
  createdAt?: string;
  comments?: Comment[];
    imageUrl?: string;   
      topic?: string;   


}

export interface Comment {
  id?: number;
  content: string;
  authorId: number;
  createdAt?: string;
  post?: { id: number };
  imageUrl?: string;

}

export interface Reaction {
  id?: number;
  userId: number;
  emoji: string;
  postId?: number;
  commentId?: number;
}
