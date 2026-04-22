import { Component, OnInit, OnDestroy,ChangeDetectorRef } from '@angular/core';
import { CourseService } from '../../course.service';
import { Course } from '../../models/course.model';
import { AuthService } from '../../auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var YT: any; // YouTube API global
@Component({
  selector: 'app-trainer-courses',
  templateUrl: './trainer-courses.component.html',
  styleUrls: ['./trainer-courses.component.css']
})
export class TrainerCoursesComponent implements OnInit, OnDestroy {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  searchQuery: string = '';
  selectedLevel: string = '';

  activeCourse: Course | null = null;
  prerequisiteCourse: Course | null = null;
  nextCourses: Course[] = [];
private youtubePlayer: any;
    private timeSaveInterval: any;
  username: string = '';
  currentUserId: number = 0;
 favoriteCourses: Course[] = [];
  showFavoritesSidebar: boolean = false; 
  // Progression
  completionPercentage: number = 0;
  totalLessonsCount: number = 1;
  completedLessonsCount: number = 0;
  private userProgresses: Map<number, any> = new Map();

  private timerInterval: any;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId() ?? 0;
    this.username = this.authService.getUsername() ?? 'User';
    if (this.currentUserId === 0) {
      alert('User not logged in');
      return;
      this.loadFavoriteCourses();
    }
    this.loadAllCourses();
  }

  ngOnDestroy(): void {
    this.stopTrackingTime();
    if (this.timeSaveInterval) clearInterval(this.timeSaveInterval);
        // Save final position before exit
        this.saveCurrentVideoTime();
  }

  loadAllCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.allCourses = data;
        this.applyFilters();
        this.loadAllProgresses();
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error(err)
    });
  }

  private loadAllProgresses(): void {
    const requests = this.allCourses.map(course =>
      this.courseService.getProgress(course.id!, this.currentUserId).toPromise().catch(() => null)
    );
    Promise.all(requests).then(results => {
      results.forEach((progress, idx) => {
        if (progress) {
          this.userProgresses.set(this.allCourses[idx].id!, progress);
        }
      });
      if (this.activeCourse) {
        this.updateCompletionPercentage();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allCourses];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (this.selectedLevel) {
      filtered = filtered.filter(c => c.level === this.selectedLevel);
    }
    this.filteredCourses = filtered;
  }

  search(): void {
    this.applyFilters();
  }

  filterByLevel(level: string): void {
    this.selectedLevel = (this.selectedLevel === level) ? '' : level;
    this.applyFilters();
  }

  openCourse(course: Course): void {
    this.courseService.canOpenCourse(course.id!, this.currentUserId).subscribe({
      next: (canOpen) => {
        if (canOpen) {
          this.setActiveCourse(course);
        } else {
          alert('You cannot open this course. You must complete the prerequisite course first.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error checking prerequisite. Please try again.');
      }
    });
  }

  switchToCourse(course: Course): void {
    this.setActiveCourse(course);
  }

  /*private setActiveCourse(course: Course): void {
    this.stopTrackingTime();
    this.activeCourse = course;
    this.loadPrerequisiteAndNext();
    this.loadProgressAndStartTracking();
  }*/
// Override the existing setActiveCourse to call initYouTubePlayer
    private setActiveCourse(course: Course): void {
        this.stopTrackingTime(); // stop old interval
        this.activeCourse = course;
        this.loadPrerequisiteAndNext();
        this.loadProgressAndStartTracking();
        if (course.contentType === 'VIDEO') {
            this.initYouTubePlayer();
        }
    }
  private loadPrerequisiteAndNext(): void {
    if (this.activeCourse?.prerequisiteId) {
      this.prerequisiteCourse = this.allCourses.find(c => c.id === this.activeCourse!.prerequisiteId) || null;
    } else {
      this.prerequisiteCourse = null;
    }
    this.nextCourses = this.allCourses.filter(c => c.prerequisiteId === this.activeCourse?.id);
  }

  private loadProgressAndStartTracking(): void {
    if (!this.activeCourse) return;
    this.updateCompletionPercentage();
    this.startTrackingTime();
  }

  private updateCompletionPercentage(): void {
    if (!this.activeCourse) return;
    const progress = this.userProgresses.get(this.activeCourse.id!);
    const durationHours = this.activeCourse.durationHours || 1;
    const totalSeconds = durationHours * 3600;
    const viewedSeconds = progress?.viewTimeSeconds || 0;
    this.completionPercentage = Math.min(100, Math.floor((viewedSeconds / totalSeconds) * 100));

    this.totalLessonsCount = 1 + (this.prerequisiteCourse ? 1 : 0) + this.nextCourses.length;
    let completedCount = 0;
    if (this.prerequisiteCourse && this.userProgresses.get(this.prerequisiteCourse.id!)?.isCompleted) completedCount++;
    if (this.isCurrentCourseCompleted) completedCount++;
    this.completedLessonsCount = completedCount;
  }

  get isPrerequisiteCompleted(): boolean {
    if (!this.prerequisiteCourse) return true;
    const progress = this.userProgresses.get(this.prerequisiteCourse.id!);
    return progress?.isCompleted === true;
  }

  get isCurrentCourseCompleted(): boolean {
    if (!this.activeCourse) return false;
    const progress = this.userProgresses.get(this.activeCourse.id!);
    if (progress?.isCompleted) return true;
    const durationHours = this.activeCourse.durationHours || 1;
    const totalSeconds = durationHours * 3600;
    const viewedSeconds = progress?.viewTimeSeconds || 0;
    return viewedSeconds >= totalSeconds;
  }

  startTrackingTime(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.activeCourse) {
        this.courseService.updateProgress(this.activeCourse.id!, this.currentUserId, 10).subscribe({
          next: (updatedProgress) => {
            this.userProgresses.set(this.activeCourse!.id!, updatedProgress);
            this.updateCompletionPercentage();
          },
          error: (err) => console.error('Error updating progress', err)
        });
      }
    }, 10000);
  }

  stopTrackingTime(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  closeCourse(): void {
    this.stopTrackingTime();
    this.activeCourse = null;
    this.prerequisiteCourse = null;
    this.nextCourses = [];
  }

  sanitizeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    const embedUrl = this.getEmbedUrl(url);
    if (embedUrl.startsWith('/uploads/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:9090' + embedUrl);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private getEmbedUrl(url: string): string {
    let videoId = null;
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  }
  loadFavoriteCourses(): void {
    this.courseService.getFavoriteCourses(this.currentUserId).subscribe({
      next: (data) => this.favoriteCourses = data,
      error: (err) => console.error('Erreur chargement favoris', err)
    });
  }

  toggleFavorite(course: Course, event: Event): void {
    event.stopPropagation(); // éviter d'ouvrir le cours
    this.courseService.toggleFavorite(course.id!, this.currentUserId).subscribe({
      next: (isNowFavorite) => {
        if (isNowFavorite) {
          // Ajouté aux favoris
          this.favoriteCourses.push(course);
        } else {
          // Retiré des favoris
          this.favoriteCourses = this.favoriteCourses.filter(c => c.id !== course.id);
        }
      },
      error: (err) => console.error('Erreur toggle favori', err)
    });
  }

  isFavorite(courseId: number): boolean {
    return this.favoriteCourses.some(c => c.id === courseId);
  }

  toggleFavoritesSidebar(): void {
    this.showFavoritesSidebar = !this.showFavoritesSidebar;
  }
getVideoThumbnailUrl(contentUrl: string | undefined): string {
    if (!contentUrl) return 'assets/pdf-placeholder.jpg'; // fallback
    if (contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be')) {
        const videoId = this.extractYouTubeId(contentUrl);
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'assets/video-placeholder.jpg';
    }
    return 'assets/video-placeholder.jpg'; // generic video icon
}

extractYouTubeId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
initYouTubePlayer(): void {
    if (!this.activeCourse || this.activeCourse.contentType !== 'VIDEO') return;
    const videoId = this.extractYouTubeId(this.activeCourse.contentUrl);
    if (!videoId) return;

    const playerElement = document.getElementById('youtube-player');
    if (playerElement && typeof YT !== 'undefined' && YT.Player) {
        this.youtubePlayer = new YT.Player('youtube-player', {
            videoId: videoId,
            events: {
                'onReady': (event: any) => this.onPlayerReady(event),
                'onStateChange': (event: any) => this.onPlayerStateChange(event)
            }
        });
    } else {
        setTimeout(() => this.initYouTubePlayer(), 300);
    }
}
    onPlayerReady(event: any): void {
    const progress = this.userProgresses.get(this.activeCourse!.id!);
    const savedTime = progress?.lastVideoTime || 0;
    if (savedTime > 0) {
        event.target.seekTo(savedTime, true);
    }
    this.startSavingVideoTime();
}

    onPlayerStateChange(event: any) {
        if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            this.saveCurrentVideoTime();
        }
    }
     startSavingVideoTime() {
        if (this.timeSaveInterval) clearInterval(this.timeSaveInterval);
        this.timeSaveInterval = setInterval(() => {
            if (this.youtubePlayer && this.youtubePlayer.getCurrentTime) {
                const currentTime = Math.floor(this.youtubePlayer.getCurrentTime());
                this.saveVideoTimeToBackend(currentTime);
            }
        }, 5000); // every 5 seconds
    }

    saveCurrentVideoTime() {
        if (this.youtubePlayer && this.youtubePlayer.getCurrentTime) {
            const currentTime = Math.floor(this.youtubePlayer.getCurrentTime());
            this.saveVideoTimeToBackend(currentTime);
        }
    }

    saveVideoTimeToBackend(currentTime: number) {
        if (!this.activeCourse) return;
        this.courseService.saveVideoTime(this.activeCourse.id!, this.currentUserId, currentTime).subscribe({
            next: (updatedProgress) => {
                this.userProgresses.set(this.activeCourse!.id!, updatedProgress);
            },
            error: (err) => console.error('Failed to save video time', err)
        });
    }
    keywordSearchQuery: string = '';
isSearching: boolean = false;

searchByKeyword(): void {
    if (!this.keywordSearchQuery.trim()) {
        this.clearKeywordSearch();
        return;
    }
    this.isSearching = true;
    this.courseService.searchByKeyword(this.keywordSearchQuery).subscribe({
        next: (results) => {
            this.filteredCourses = results;
        },
        error: (err) => {
            console.error('Keyword search error', err);
            this.filteredCourses = [];
        }
    });
}

onKeywordSearchInput(): void {
    if (!this.keywordSearchQuery.trim()) {
        this.clearKeywordSearch();
    } else {
        // Optional: debounce for better UX
        this.searchByKeyword();
    }
}

clearKeywordSearch(): void {
    this.keywordSearchQuery = '';
    this.isSearching = false;
    this.applyFilters(); // restore full list with level/topic filters
}
}