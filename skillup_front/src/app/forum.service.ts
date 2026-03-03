import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Comment, Reaction } from './models/forum.model';


@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = 'http://localhost:9090/forum'; // Gateway URL

  constructor(private http: HttpClient) { }

  // Posts
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }
  updatePost(id: number, post: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/posts/${id}`, post);
}

updateComment(id: number, comment: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/comments/${id}`, comment);
}


  // Comments
  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/posts/${postId}/comments`);
  }

  addComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, comment);
  }
deleteComment(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
}
  // Get user info via OpenFeign
  getUserInfo(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }
  uploadImage(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' });
}

getPostReactions(postId: number): Observable<Reaction[]> {
  return this.http.get<Reaction[]>(`${this.apiUrl}/reactions/post/${postId}`);
}

getCommentReactions(commentId: number): Observable<Reaction[]> {
  return this.http.get<Reaction[]>(`${this.apiUrl}/reactions/comment/${commentId}`);
}

reactToPost(postId: number, userId: number, emoji: string): Observable<Reaction | null> {
  return this.http.post<Reaction | null>(
    `${this.apiUrl}/reactions/post/${postId}?userId=${userId}&emoji=${emoji}`, {}
  );
}

reactToComment(commentId: number, userId: number, emoji: string): Observable<Reaction | null> {
  return this.http.post<Reaction | null>(
    `${this.apiUrl}/reactions/comment/${commentId}?userId=${userId}&emoji=${emoji}`, {}
  );
}

}