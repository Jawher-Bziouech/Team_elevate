import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../event.service';
import { appEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  event: appEvent | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage = 'ID de l’événement manquant.';
      this.isLoading = false;
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.errorMessage = 'ID de l’événement invalide.';
      this.isLoading = false;
      return;
    }

    this.loadEvent(id);
  }

  loadEvent(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        if (!event) {
          this.errorMessage = 'Événement introuvable.';
          this.event = null;
        } else {
          this.event=event;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événement:', err);
        this.errorMessage = 'Impossible de charger l’événement.';
        this.isLoading = false;
      }
    });
  }
}