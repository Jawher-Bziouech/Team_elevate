import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { appEvent } from '../../models/event.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: appEvent[];
}

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cal-container">
      <div class="cal-header">
        <button (click)="prevMonth()" class="nav-btn">&#8249;</button>
        <h2>{{ currentMonthName }} {{ currentYear }}</h2>
        <button (click)="nextMonth()" class="nav-btn">&#8250;</button>
      </div>
      <div class="day-names">
        <div *ngFor="let d of dayNames" class="day-name">{{ d }}</div>
      </div>
      <div class="cal-grid">
        <div *ngFor="let day of calendarDays"
             class="cal-day"
             [class.other-month]="!day.isCurrentMonth"
             [class.today]="day.isToday"
             [class.has-events]="day.events.length > 0"
             (click)="selectDay(day)">
          <span class="day-num">{{ day.date.getDate() }}</span>
          <div class="dots">
            <span *ngFor="let e of day.events.slice(0,3)" class="dot" [title]="e.title"></span>
          </div>
        </div>
      </div>
      <div *ngIf="selectedDay && selectedDay.events.length > 0" class="day-events">
        <h3>{{ selectedDay.date.toLocaleDateString('fr-FR') }}</h3>
        <div *ngFor="let e of selectedDay.events" class="event-item">
          <span class="dot-lg" [class]="'s-' + (e.status || 'upcoming').toLowerCase()"></span>
          <div>
            <strong>{{ e.title }}</strong>
            <p *ngIf="e.location">📍 {{ e.location }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cal-container { font-family: inherit; }
    .cal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
    .cal-header h2 { font-size:1.2rem; font-weight:600; text-transform:capitalize; }
    .nav-btn { background:#3b82f6; color:white; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:1.2rem; }
    .nav-btn:hover { background:#2563eb; }
    .day-names { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; margin-bottom:4px; }
    .day-name { font-weight:600; color:#6b7280; font-size:0.75rem; padding:4px; }
    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
    .cal-day { min-height:64px; padding:4px; border:1px solid #e5e7eb; border-radius:4px; cursor:pointer; transition:background 0.2s; }
    .cal-day:hover { background:#eff6ff; }
    .cal-day.other-month { opacity:0.35; }
    .cal-day.today .day-num { background:#3b82f6; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-weight:700; }
    .cal-day.has-events { background:#f0f9ff; }
    .day-num { font-size:0.85rem; width:22px; height:22px; display:flex; align-items:center; justify-content:center; }
    .dots { display:flex; flex-wrap:wrap; gap:2px; margin-top:3px; }
    .dot { width:6px; height:6px; border-radius:50%; background:#3b82f6; }
    .day-events { margin-top:1rem; padding:1rem; background:#f9fafb; border-radius:8px; }
    .day-events h3 { font-size:0.95rem; font-weight:600; margin-bottom:0.5rem; }
    .event-item { display:flex; align-items:flex-start; gap:0.5rem; padding:0.5rem; background:white; border-radius:6px; margin-bottom:0.5rem; }
    .dot-lg { width:10px; min-width:10px; height:10px; border-radius:50%; margin-top:5px; }
    .s-upcoming { background:#3b82f6; } .s-ongoing { background:#10b981; }
    .s-completed { background:#6b7280; } .s-cancelled { background:#ef4444; }
    .event-item p { margin:0; font-size:0.8rem; color:#6b7280; }
  `]
})
export class EventCalendarComponent implements OnInit, OnChanges {
  @Input() events: appEvent[] = [];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  get currentMonthName() { return this.monthNames[this.currentMonth]; }

  ngOnInit() { this.generateCalendar(); }
  ngOnChanges(changes: SimpleChanges) { if (changes['events']) this.generateCalendar(); }

  generateCalendar() {
    const today = new Date();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const start = new Date(firstDay);
    start.setDate(start.getDate() - offset);
    this.calendarDays = Array.from({length: 42}, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        date,
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: date.toDateString() === today.toDateString(),
        events: (this.events || []).filter(e => new Date(e.startDate).toDateString() === date.toDateString())
      };
    });
  }

  selectDay(day: CalendarDay) { this.selectedDay = day.events.length > 0 ? day : null; }

  prevMonth() {
    this.currentMonth === 0 ? (this.currentMonth = 11, this.currentYear--) : this.currentMonth--;
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth === 11 ? (this.currentMonth = 0, this.currentYear++) : this.currentMonth++;
    this.generateCalendar();
  }
}
