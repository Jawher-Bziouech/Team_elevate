import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private pushgatewayUrl = 'http://localhost:9092/metrics/job/angular-frontend';
  private metrics: Map<string, number> = new Map();

  constructor(private http: HttpClient, private router: Router) {
    this.trackNavigation();
    setInterval(() => this.pushMetrics(), 15000);
  }

  increment(name: string, labels: string): void {
    const key = `${name}{${labels}}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }

  recordDuration(name: string, labels: string, duration: number): void {
    const key = `${name}{${labels}}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + duration);
  }

  private trackNavigation(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.increment('angular_page_navigations_total', `route="${e.urlAfterRedirects}"`);
      });
  }

  private pushMetrics(): void {
    if (this.metrics.size === 0) return;
    const body = Array.from(this.metrics.entries())
      .map(([key, value]) => `${key} ${value}`)
      .join('\n');
    this.http.post(this.pushgatewayUrl, body, {
      headers: { 'Content-Type': 'text/plain' },
      responseType: 'text'
    }).subscribe({ error: () => {} });
  }
}
