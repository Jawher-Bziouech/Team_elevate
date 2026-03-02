import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  
  // Base de connaissances simple
  private knowledgeBase = [
    {
      keywords: ['mot de passe', 'password', 'connexion', 'login', 'identifier'],
      response: 'Pour les problèmes de connexion ou de mot de passe, vous pouvez utiliser la fonction "Mot de passe oublié" sur la page de connexion. Si le problème persiste, notre équipe technique vous aidera.'
    },
    {
      keywords: ['paiement', 'payé', 'facture', 'prix', 'coût', 'tarif', 'acheter'],
      response: 'Les paiements sont traités de manière sécurisée. En cas de problème de paiement, vérifiez d\'abord vos coordonnées bancaires. Les factures sont disponibles dans votre espace personnel.'
    },
    {
      keywords: ['cours', 'formation', 'contenu', 'vidéo', 'module', 'leçon'],
      response: 'L\'accès aux cours est disponible 24h/24. Si un cours ne se lance pas, vérifiez votre connexion internet ou essayez de vider le cache de votre navigateur.'
    },
    {
      keywords: ['compte', 'profil', 'modifier', 'changer', 'informations', 'email'],
      response: 'Vous pouvez modifier vos informations personnelles dans la section "Mon profil" après vous être connecté. Les changements d\'email nécessitent une confirmation.'
    },
    {
      keywords: ['inscription', 'inscrire', 'créer compte', 'nouveau'],
      response: 'Pour créer un compte, cliquez sur "S\'inscrire" et remplissez le formulaire. Vous recevrez un email de confirmation.'
    },
    {
      keywords: ['technique', 'bug', 'erreur', 'plante', 'marche pas', 'problème'],
      response: 'Si vous rencontrez un problème technique, décrivez-le en détail dans votre ticket. Notre équipe technique interviendra dans les plus brefs délais.'
    },
    {
      keywords: ['admin', 'administrateur', 'contacter', 'joindre', 'support'],
      response: 'Vous pouvez contacter notre équipe d\'administration via ce ticket. Nous vous répondrons sous 24h en moyenne.'
    }
  ];

  // Réponses par défaut
  private defaultResponses = [
    'Pourriez-vous être plus précis sur votre problème ?',
    'Je vous conseille de créer un ticket avec tous les détails, notre équipe vous répondra rapidement.',
    'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ?',
    'Notre équipe de support pourra mieux vous aider avec un ticket détaillé.',
    'Je vous recommande de décrire votre problème en détail dans le ticket ci-dessous.'
  ];

  constructor() { }

  // Analyser le message et retourner une réponse
  getResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Chercher dans la base de connaissances
    for (const item of this.knowledgeBase) {
      for (const keyword of item.keywords) {
        if (lowerMessage.includes(keyword)) {
          return item.response;
        }
      }
    }
    
    // Réponse par défaut aléatoire
    const randomIndex = Math.floor(Math.random() * this.defaultResponses.length);
    return this.defaultResponses[randomIndex];
  }

  // Suggérer une catégorie basée sur le message
  suggestCategory(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('paiement') || lowerMessage.includes('payé') || lowerMessage.includes('facture')) {
      return 'Payment';
    } else if (lowerMessage.includes('cours') || lowerMessage.includes('formation') || lowerMessage.includes('module')) {
      return 'Course';
    } else if (lowerMessage.includes('compte') || lowerMessage.includes('profil') || lowerMessage.includes('inscription')) {
      return 'Account';
    } else if (lowerMessage.includes('technique') || lowerMessage.includes('bug') || lowerMessage.includes('erreur')) {
      return 'Technical';
    } else {
      return '';
    }
  }
}