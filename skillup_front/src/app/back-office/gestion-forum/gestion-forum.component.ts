import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../forum.service';

@Component({
  selector: 'app-gestion-forum',
  templateUrl: './gestion-forum.component.html',
  styleUrls: ['./gestion-forum.component.css']
})
export class GestionForumComponent implements OnInit {
  allPosts: any[] = [];
  selectedPostId: number | null = null;
  comments: any[] = [];
  userNames: { [userId: number]: string } = {};

  // Statistics
  topUsers: { userId: number, username: string, postCount: number, pct: number }[] = [];
  topCategories: { topic: string, postCount: number, pct: number }[] = [];
  topDays: { day: string, postCount: number, pct: number }[] = [];
  topHours: { hour: string, postCount: number, pct: number }[] = [];
  showStats = false;

  constructor(private forumService: ForumService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.forumService.getAllPosts().subscribe(data => {
      this.allPosts = data;
      this.resolveUserNames();
      this.computeStats();
    });
  }

  parseDate(createdAt: any): Date | null {
    if (!createdAt) return null;
    if (Array.isArray(createdAt)) {
      return new Date(createdAt[0], createdAt[1] - 1, createdAt[2], createdAt[3] || 0, createdAt[4] || 0);
    }
    return new Date(createdAt);
  }

  resolveUserNames(): void {
    const uniqueIds = [...new Set(this.allPosts.map(p => p.authorId))];
    uniqueIds.forEach(userId => {
      if (userId && !this.userNames[userId]) {
        this.forumService.getUserInfo(userId).subscribe({
          next: (user) => { this.userNames[userId] = user.username; this.computeStats(); },
          error: () => this.userNames[userId] = 'Unknown'
        });
      }
    });
  }

  computeStats(): void {
    // --- Top Users ---
    const userCounts: { [id: number]: number } = {};
    this.allPosts.forEach(p => { userCounts[p.authorId] = (userCounts[p.authorId] || 0) + 1; });
    const maxUser = Math.max(...Object.values(userCounts), 1);
    this.topUsers = Object.entries(userCounts)
      .map(([id, count]) => ({
        userId: Number(id),
        username: this.userNames[Number(id)] || 'Loading...',
        postCount: count,
        pct: Math.round((count / maxUser) * 100)
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 6);

    // --- Top Categories ---
    const catCounts: { [t: string]: number } = {};
    this.allPosts.forEach(p => {
      const cat = p.topic || 'General';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const maxCat = Math.max(...Object.values(catCounts), 1);
    this.topCategories = Object.entries(catCounts)
      .map(([topic, count]) => ({ topic, postCount: count, pct: Math.round((count / maxCat) * 100) }))
      .sort((a, b) => b.postCount - a.postCount);

    // --- Most Active Days (Mon–Sun) ---
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
    this.allPosts.forEach(p => {
      const d = this.parseDate(p.createdAt);
      if (d) dayCounts[d.getDay()]++;
    });
    const maxDay = Math.max(...dayCounts, 1);
    this.topDays = dayLabels.map((day, i) => ({
      day,
      postCount: dayCounts[i],
      pct: Math.round((dayCounts[i] / maxDay) * 100)
    }));

    // --- Most Active Hours ---
    const hourCounts: number[] = Array(24).fill(0);
    this.allPosts.forEach(p => {
      const d = this.parseDate(p.createdAt);
      if (d) hourCounts[d.getHours()]++;
    });
    const maxHour = Math.max(...hourCounts, 1);
    this.topHours = hourCounts.map((count, i) => ({
      hour: `${i}h`,
      postCount: count,
      pct: Math.round((count / maxHour) * 100)
    })).filter(h => h.postCount > 0);
  }

  viewComments(postId: number) {
    this.selectedPostId = postId;
    this.forumService.getCommentsByPost(postId).subscribe(data => { this.comments = data; });
  }

  deletePost(id: number) {
    if (confirm('Delete this entire post?')) {
      this.forumService.deletePost(id).subscribe(() => {
        this.allPosts = this.allPosts.filter(p => p.id !== id);
        if (this.selectedPostId === id) this.selectedPostId = null;
        this.computeStats();
      });
    }
  }

  deleteComment(id: number) {
    if (confirm('Delete this comment?')) {
      this.forumService.deleteComment(id).subscribe(() => {
        this.comments = this.comments.filter(c => c.id !== id);
        this.loadPosts();
      });
    }
  }

  closeComments() { this.selectedPostId = null; }
}
