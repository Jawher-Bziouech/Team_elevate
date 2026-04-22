/*import { Component } from '@angular/core';
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
}*/

/*   vrai 
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
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
  
  isSubmitting: boolean = false;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) {}

  submit() {
    if (!this.ticket.description || !this.ticket.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;

    this.ticketService.createTicket(this.ticket).subscribe({
      next: (response) => {
        alert('Ticket créé avec succès !');
        this.router.navigate(['/my-tickets']);
      },
      error: (error) => {
        console.error('Erreur création:', error);
        alert('Erreur lors de la création du ticket: ' + (error.error?.message || error.message));
        this.isSubmitting = false;
      }
    });
  }
}*/




import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Ticket } from '../models/ticket.model';
import { ChatbotService } from '../chatbot.service';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.css']
})
export class CreateTicketComponent {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  
  ticket: Ticket = {
    description: '',
    category: ''
  };
  
  isSubmitting: boolean = false;
  
  // Propriétés pour le chatbot
  showChatbot: boolean = false;
  chatMessagesList: { text: string, isUser: boolean }[] = [];
  currentMessage: string = '';
  isTyping: boolean = false;
  suggestedCategory: string = '';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private chatbotService: ChatbotService
  ) {
    // Message de bienvenue du chatbot
    this.chatMessagesList.push({
      text: '👋 Bonjour ! Je suis votre assistant virtuel. Posez-moi une question sur nos services ou décrivez votre problème.',
      isUser: false
    });
  }

  // Envoyer un message au chatbot
  sendMessage() {
    if (!this.currentMessage.trim()) return;
    
    // Ajouter le message de l'utilisateur
    this.chatMessagesList.push({
      text: this.currentMessage,
      isUser: true
    });
    
    const userMessage = this.currentMessage;
    this.currentMessage = '';
    
    // Simuler la frappe du chatbot
    this.isTyping = true;
    
    // Récupérer la suggestion de catégorie
    const category = this.chatbotService.suggestCategory(userMessage);
    if (category && !this.ticket.category) {
      this.suggestedCategory = category;
    }
    
    // Réponse du chatbot après un délai
    setTimeout(() => {
      const response = this.chatbotService.getResponse(userMessage);
      this.chatMessagesList.push({
        text: response,
        isUser: false
      });
      this.isTyping = false;
      
      // Suggérer de créer un ticket si la conversation s'allonge
      if (this.chatMessagesList.filter(m => !m.isUser).length > 3) {
        setTimeout(() => {
          this.chatMessagesList.push({
            text: '💡 Souhaitez-vous créer un ticket pour que notre équipe vous aide plus efficacement ? Remplissez le formulaire ci-dessous !',
            isUser: false
          });
        }, 1000);
      }
      
      this.scrollToBottom();
    }, 1000);
    
    this.scrollToBottom();
  }

  // Appliquer la catégorie suggérée
  applySuggestedCategory() {
    if (this.suggestedCategory) {
      this.ticket.category = this.suggestedCategory;
      this.suggestedCategory = '';
      
      this.chatMessagesList.push({
        text: `Catégorie "${this.getCategoryLabel(this.suggestedCategory)}" sélectionnée automatiquement.`,
        isUser: false
      });
    }
  }

  // Obtenir le libellé de la catégorie
  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'Technical': 'Technique',
      'Payment': 'Paiement',
      'Course': 'Cours',
      'Account': 'Compte',
      'Other': 'Autre'
    };
    return labels[category] || category;
  }

  // Pré-remplir la description avec le dernier message
  useLastMessageAsDescription() {
    const lastUserMessage = [...this.chatMessagesList].reverse().find(m => m.isUser);
    if (lastUserMessage) {
      this.ticket.description = lastUserMessage.text;
      
      this.chatMessagesList.push({
        text: 'J\'ai pré-rempli la description avec votre dernier message. Vous pouvez la modifier si nécessaire.',
        isUser: false
      });
    }
  }

  // Ouvrir/fermer le chatbot
  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
    if (this.showChatbot) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  // Scroll vers le bas des messages
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatMessages) {
        const element = this.chatMessages.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  // Soumettre le ticket
  submit() {
    if (!this.ticket.description || !this.ticket.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;

    this.ticketService.createTicket(this.ticket).subscribe({
      next: (response) => {
        alert('Ticket créé avec succès !');
        this.router.navigate(['/my-tickets']);
      },
      error: (error) => {
        console.error('Erreur création:', error);
        alert('Erreur lors de la création du ticket: ' + (error.error?.message || error.message));
        this.isSubmitting = false;
      }
    });
  }

  getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
}