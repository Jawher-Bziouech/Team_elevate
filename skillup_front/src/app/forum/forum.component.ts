import { Component, OnInit } from '@angular/core';
import { ForumService } from '../forum.service';
import { Post, Comment, Reaction } from '../models/forum.model';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: Post[] = [];
  newPost: Post = { title: '', content: '', authorId: 0, topic: 'General' };
  isSubmitting = false;
  selectedFile: File | null = null;
  topics = ['General', 'Tech', 'Study', 'Career', 'Q&A'];
  selectedTopic = 'All';
  lightboxImage: string | null = null;
  commentImageFiles: { [postId: number]: File | null } = {};
  emojis = ['❤️', '😂', '😮', '😢', '😠'];
  postReactions: { [postId: number]: Reaction[] } = {};
  commentReactions: { [commentId: number]: Reaction[] } = {};
  showEmojiPicker: { [key: string]: boolean } = {};
  expandedPosts: { [key: number]: boolean } = {};
  commentTexts: { [key: number]: string } = {};
  userNames: { [userId: number]: string } = {};
  editingPostId: number | null = null;
editPostForm: any = {};
editingCommentId: number | null = null;
editCommentTexts: { [commentId: number]: string } = {};

  currentPage = 1;
  postsPerPage = 5;
  searchTerm = '';
  showSuggestions = false;

  constructor(
    private forumService: ForumService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadPosts();
    this.route.queryParams.subscribe(params => {
      const postId = params['postId'];
      if (postId) {
        setTimeout(() => this.scrollToPost(+postId), 800);
      }
    });
  }

  scrollToPost(postId: number): void {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      this.expandedPosts[postId] = true;
      this.forumService.getCommentsByPost(postId).subscribe(comments => {
        post.comments = comments;
        comments.forEach(c => this.loadCommentReactions(c.id!));
      });
    }
    const el = document.getElementById('post-' + postId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
  }

  loadPosts(): void {
    this.forumService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.resolveUserNames();
        data.forEach(p => this.loadPostReactions(p.id!));
      },
      error: (err) => console.error('Error loading posts', err)
    });
  }

  resolveUserNames(): void {
    const allIds = this.posts.map(p => p.authorId);
    const uniqueIds = [...new Set(allIds)];
    uniqueIds.forEach(userId => {
      if (userId && !this.userNames[userId]) {
        this.forumService.getUserInfo(userId).subscribe({
          next: (user) => this.userNames[userId] = user.username,
          error: () => this.userNames[userId] = 'Unknown'
        });
      }
    });
  }

  get filteredPosts(): Post[] {
    let result = this.posts;
    if (this.selectedTopic !== 'All') {
      result = result.filter(p => p.topic === this.selectedTopic);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term)
      );
    }
    return result;
  }

  get paginatedPosts(): Post[] {
    const start = (this.currentPage - 1) * this.postsPerPage;
    return this.filteredPosts.slice(start, start + this.postsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.postsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void { this.currentPage = page; }

  get searchSuggestions(): Post[] {
    if (!this.searchTerm.trim()) return [];
    const term = this.searchTerm.toLowerCase();
    return this.posts.filter(p => p.title.toLowerCase().includes(term)).slice(0, 5);
  }

  selectSuggestion(post: Post): void {
    this.searchTerm = post.title;
    this.showSuggestions = false;
    this.currentPage = 1;
  }

  onSearchInput(): void {
    this.showSuggestions = this.searchTerm.trim().length > 0;
    this.currentPage = 1;
  }
  startEditPost(post: any): void {
  this.editingPostId = post.id;
  this.editPostForm = { title: post.title, content: post.content, topic: post.topic };
}

saveEditPost(post: any): void {
  this.forumService.updatePost(post.id, { ...post, ...this.editPostForm }).subscribe(updated => {
    post.title = updated.title;
    post.content = updated.content;
    post.topic = updated.topic;
    this.editingPostId = null;
  });
}

startEditComment(comment: any): void {
  this.editingCommentId = comment.id;
  this.editCommentTexts[comment.id] = comment.content;
}

saveEditComment(comment: any): void {
  this.forumService.updateComment(comment.id, { ...comment, content: this.editCommentTexts[comment.id] }).subscribe(updated => {
    comment.content = updated.content;
    this.editingCommentId = null;
  });
}


  clearSearch(): void {
    this.searchTerm = '';
    this.showSuggestions = false;
    this.currentPage = 1;
  }

  onCreatePost(): void {
    const userId = this.authService.getUserId();
    if (!userId) { alert("Session expired."); return; }
    if (!this.newPost.title || !this.newPost.content) return;
    this.newPost.authorId = userId;
    this.isSubmitting = true;
    if (this.selectedFile) {
      this.forumService.uploadImage(this.selectedFile).subscribe({
        next: (imageUrl) => { this.newPost.imageUrl = imageUrl; this.submitPost(userId); },
        error: () => { alert('Image upload failed'); this.isSubmitting = false; }
      });
    } else {
      this.submitPost(userId);
    }
  }

  private submitPost(userId: number): void {
    this.forumService.createPost(this.newPost).subscribe({
      next: (val) => {
        this.posts.unshift(val);
        this.selectedFile = null;
        this.isSubmitting = false;
        this.resolveUserNames();
        this.newPost = { title: '', content: '', authorId: userId, topic: 'General' };
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  toggleComments(post: Post): void {
    const postId = post.id!;
    this.expandedPosts[postId] = !this.expandedPosts[postId];
    if (this.expandedPosts[postId]) {
      this.forumService.getCommentsByPost(postId).subscribe(comments => {
        post.comments = comments;
        comments.forEach(c => this.loadCommentReactions(c.id!));
      });
    }
  }

  onAddComment(post: Post): void {
    const userId = this.authService.getUserId();
    if (!userId || !this.commentTexts[post.id!]) return;
    const imageFile = this.commentImageFiles[post.id!];
    const doAddComment = (imageUrl?: string) => {
      const comment: Comment = {
        content: this.commentTexts[post.id!],
        authorId: userId,
        imageUrl: imageUrl,
        post: { id: post.id! }
      };
      this.forumService.addComment(comment).subscribe(saved => {
        if (!post.comments) post.comments = [];
        post.comments.push(saved);
        this.commentTexts[post.id!] = '';
        this.commentImageFiles[post.id!] = null;
        this.userNames[userId] = this.userNames[userId] || 'You';
        this.loadCommentReactions(saved.id!);
      });
    };
    if (imageFile) {
      this.forumService.uploadImage(imageFile).subscribe({
        next: (url) => doAddComment(url),
        error: () => doAddComment()
      });
    } else {
      doAddComment();
    }
  }

  onCommentFileSelected(event: any, postId: number): void {
    this.commentImageFiles[postId] = event.target.files[0] || null;
  }

  openLightbox(url: string): void { this.lightboxImage = url; }
  closeLightbox(): void { this.lightboxImage = null; }

  downloadImage(url: string): void {
    const filename = url.split('/').pop();
    const downloadUrl = `http://localhost:9090/forum/download/${filename}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.click();
  }

  loadPostReactions(postId: number): void {
    this.forumService.getPostReactions(postId).subscribe(r => {
      this.postReactions[postId] = r;
    });
  }

  loadCommentReactions(commentId: number): void {
    this.forumService.getCommentReactions(commentId).subscribe(r => {
      this.commentReactions[commentId] = r;
    });
  }

  getReactionCount(reactions: Reaction[], emoji: string): number {
    return reactions?.filter(r => r.emoji === emoji).length || 0;
  }

  getUserReaction(reactions: Reaction[], userId: number): string | null {
    return reactions?.find(r => r.userId === userId)?.emoji || null;
  }

  toggleEmojiPicker(key: string): void {
    this.showEmojiPicker[key] = !this.showEmojiPicker[key];
  }

  reactToPost(post: Post, emoji: string): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.showEmojiPicker['post_' + post.id] = false;
    this.forumService.reactToPost(post.id!, userId, emoji).subscribe(() => {
      this.loadPostReactions(post.id!);
    });
  }

  reactToComment(comment: Comment, emoji: string): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.showEmojiPicker['comment_' + comment.id] = false;
    this.forumService.reactToComment(comment.id!, userId, emoji).subscribe(() => {
      this.loadCommentReactions(comment.id!);
    });
  }
}
