import { Component, OnInit } from '@angular/core';
import { QuizService } from '../quiz.service';
import { AuthService } from '../auth.service';
import { UserProgression, UserBadge, QuizAttempt } from '../models/quiz.model';

@Component({
  selector: 'app-gamification',
  templateUrl: './gamification.component.html',
  styleUrls: ['./gamification.component.css']
})
export class GamificationComponent implements OnInit {
  activeTab: 'overview' | 'badges' | 'history' | 'leaderboard' = 'overview';
  userId: number = 1;

  progression: UserProgression | null = null;
  badges: UserBadge[] = [];
  attempts: QuizAttempt[] = [];
  leaderboard: UserProgression[] = [];

  allBadges = [
    { type: 'FIRST_STEP', label: 'First Step', icon: '🚀', desc: 'Complete 1 quiz', category: 'Volume' },
    { type: 'QUIZ_ENTHUSIAST', label: 'Quiz Enthusiast', icon: '📚', desc: 'Complete 10 quizzes', category: 'Volume' },
    { type: 'QUIZ_MASTER', label: 'Quiz Master', icon: '👑', desc: 'Complete 50 quizzes', category: 'Volume' },
    { type: 'PERFECT_SCORE', label: 'Perfect Score', icon: '💯', desc: 'Score 100% on any quiz', category: 'Accuracy' },
    { type: 'SHARP_MIND', label: 'Sharp Mind', icon: '🧠', desc: 'Score 90%+ on 5 quizzes', category: 'Accuracy' },
    { type: 'CONSISTENT', label: 'Consistent', icon: '🔥', desc: 'Pass 10 quizzes in a row', category: 'Accuracy' },
    { type: 'SPEED_DEMON', label: 'Speed Demon', icon: '⚡', desc: 'Finish in under 25% time', category: 'Speed' },
    { type: 'QUICK_THINKER', label: 'Quick Thinker', icon: '💡', desc: '5 quizzes under 50% time', category: 'Speed' },
    { type: 'CREDIT_STARTER', label: 'Credit Starter', icon: '🪙', desc: 'Accumulate 100 credits', category: 'Credits' },
    { type: 'CREDIT_COLLECTOR', label: 'Credit Collector', icon: '💰', desc: 'Accumulate 500 credits', category: 'Credits' },
    { type: 'CREDIT_CHAMPION', label: 'Credit Champion', icon: '🏆', desc: 'Accumulate 2,000 credits', category: 'Credits' },
    { type: 'THREE_DAY_STREAK', label: '3-Day Streak', icon: '📅', desc: 'Quizzes on 3 consecutive days', category: 'Consistency' },
    { type: 'SEVEN_DAY_STREAK', label: '7-Day Streak', icon: '🗓️', desc: 'Quizzes on 7 consecutive days', category: 'Consistency' },
  ];

  constructor(private quizService: QuizService, private authService: AuthService) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || 1;
    this.loadData();
  }

  loadData(): void {
    this.quizService.getUserProgression(this.userId).subscribe(p => this.progression = p);
    this.quizService.getUserBadges(this.userId).subscribe(b => this.badges = b);
    this.quizService.getUserAttempts(this.userId).subscribe(a => this.attempts = a);
    this.quizService.getLeaderboard().subscribe(l => this.leaderboard = l);
  }

  hasBadge(type: string): boolean {
    return this.badges.some(b => b.badgeType === type);
  }

  get passRate(): number {
    if (!this.progression || this.progression.totalAttempts === 0) return 0;
    return Math.round((this.progression.totalPassed / this.progression.totalAttempts) * 100);
  }

  get earnedCount(): number {
    return this.badges.length;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  getUserRank(): number {
    const idx = this.leaderboard.findIndex(l => l.userId === this.userId);
    return idx >= 0 ? idx + 1 : 0;
  }
}
