import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpResponse, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class MetricsInterceptor implements HttpInterceptor {

  constructor(private monitoring: MonitoringService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip pushgateway requests to avoid infinite loop
    if (req.url.includes('9092')) {
      return next.handle(req);
    }

    const start = Date.now();
    const url = req.url.replace(/https?:\/\/[^/]+/, '').split('?')[0];

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const duration = (Date.now() - start) / 1000;
          const labels = `method="${req.method}",status="${event.status}",url="${url}"`;
          this.monitoring.increment('angular_http_requests_total', labels);
          this.monitoring.recordDuration('angular_http_duration_seconds', labels, duration);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const labels = `method="${req.method}",status="${error.status}",url="${url}"`;
        this.monitoring.increment('angular_http_errors_total', labels);
        return throwError(() => error);
      })
    );
  }
}
