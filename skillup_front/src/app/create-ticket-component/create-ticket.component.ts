import { Component } from '@angular/core';
import { TicketService } from '../ticket.service';
import { Router } from '@angular/router';
import { Ticket } from '../models/ticket.model';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.css']
})
export class CreateTicketComponent {
  ticket: Ticket = {
    description: '',
    category: ''
  };

  constructor(
    private ticketService: TicketService,
    private router: Router
  ) {}

  submit() {
    if (!this.ticket.description || !this.ticket.category) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.ticketService.createTicket(this.ticket)
      .subscribe({
        next: () => {
          alert('Ticket créé avec succès');
          this.router.navigate(['/my-tickets']);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          alert('Erreur lors de la création du ticket');
        }
      });
  }
}