import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {EventService} from '../../event.service';
import {appEvent} from '../../models/event.model';


@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  // Modèle correspondant à ce que le backend attend
  event: appEvent = {
    title: '',
    type: 'Conférence',
    description: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    capacity: 0,
    eventId: undefined
  };

  isLoading: boolean = false;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading = true;
    
  const payload = { ...this.event };
  payload.startDate = new Date(this.event.startDate).toISOString().slice(0, 16);
  payload.endDate = new Date(this.event.endDate).toISOString().slice(0, 16);

    this.eventService.createEvent(payload).subscribe({
      next: (response) => {
        console.log('Événement créé:', response);
        alert('Événement créé avec succès !');
 this.router.navigate(['/back-office'], { queryParams: { view: 'events' } });
      },
      error: (err) => {
        console.error('Erreur création:', err);
        alert('Erreur: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }
}
