import { Component, OnInit } from '@angular/core';
import { ForumService } from '../forum.service';
import { Post, Comment } from '../models/forum.model';
import { AuthService } from '../auth.service'; // <--- THIS IMPORT IS THE KEY!

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: Post[] = [];
  newPost: Post = { title: '', content: '', authorId: 0 };
  isSubmitting = false;

  // States for comments toggle and text inputs
  expandedPosts: { [key: number]: boolean } = {};
  commentTexts: { [key: number]: string } = {};

  constructor(
    private forumService: ForumService,
    private authService: AuthService // Properly injected here
  ) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.forumService.getAllPosts().subscribe({
      next: (data) => this.posts = data,
      error: (err) => console.error('Error loading posts', err)
    });
  }

  onCreatePost(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert("Session expired. Please login again.");
      return;
    }

    if (!this.newPost.title || !this.newPost.content) return;
    
    this.newPost.authorId = userId; // Setting real ID from session
    this.isSubmitting = true;
    
    this.forumService.createPost(this.newPost).subscribe({
      next: (val) => {
        this.posts.unshift(val);
        this.newPost = { title: '', content: '', authorId: userId };
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating post', err);
        this.isSubmitting = false;
      }
    });
  }

  // Comments Logic
  toggleComments(post: Post): void {
    const postId = post.id!;
    this.expandedPosts[postId] = !this.expandedPosts[postId];
    
    if (this.expandedPosts[postId]) {
      this.forumService.getCommentsByPost(postId).subscribe(comments => {
        post.comments = comments;
      });
    }
  }

  onAddComment(post: Post): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const postId = post.id!;
    const content = this.commentTexts[postId];
    if (!content) return;

    const newComment: Comment = {
      content: content,
      authorId: userId, // Setting real ID from session
      post: { id: postId }
    };

    this.forumService.addComment(newComment).subscribe(savedComment => {
      if (!post.comments) post.comments = [];
      post.comments.push(savedComment);
      this.commentTexts[postId] = '';
    });
  }
}