import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../forum.service';

@Component({
  selector: 'app-gestion-forum',
  templateUrl: './gestion-forum.component.html',
  styleUrls: ['./gestion-forum.component.css']
})
export class GestionForumComponent implements OnInit {
  allPosts: any[] = [];
  selectedPostId: number | null = null; // Track which comments we are looking at
  comments: any[] = [];

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.forumService.getAllPosts().subscribe(data => {
      this.allPosts = data;
    });
  }

  viewComments(postId: number) {
    this.selectedPostId = postId;
    this.forumService.getCommentsByPost(postId).subscribe(data => {
      this.comments = data;
    });
  }

  deletePost(id: number) {
    if(confirm('Delete this entire post?')) {
      this.forumService.deletePost(id).subscribe(() => {
        this.allPosts = this.allPosts.filter(p => p.id !== id);
        if (this.selectedPostId === id) this.selectedPostId = null;
      });
    }
  }

  deleteComment(id: number) {
    if(confirm('Delete this comment?')) {
      this.forumService.deleteComment(id).subscribe(() => {
        this.comments = this.comments.filter(c => c.id !== id);
        // Refresh the post list to update the comment count badge
        this.loadPosts();
      });
    }
  }

  closeComments() {
    this.selectedPostId = null;
  }
}