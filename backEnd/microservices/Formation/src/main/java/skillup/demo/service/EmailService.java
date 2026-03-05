package skillup.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import skillup.demo.model.Inscription;
import skillup.demo.model.Formation;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void envoyerConfirmationInscription(Inscription inscription, Formation formation) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(inscription.getEmail());
        message.setSubject("Confirmation de votre inscription");
        message.setFrom("noreply@formation.com");

        String contenu = String.format(
                "Bonjour %s %s,\n\n" +
                        "Votre inscription à la formation '%s' est confirmée.\n" +
                        "Date début: %s\n" +
                        "Statut: %s\n\n" +
                        "Cordialement,\nL'équipe de formation",
                inscription.getPrenom(),
                inscription.getNom(),
                formation.getTitre(),
                formation.getDateDebut(),
                inscription.getStatut()
        );

        message.setText(contenu);
        mailSender.send(message);
    }

    public void envoyerEmailAnnulation(Inscription inscription, Formation formation) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(inscription.getEmail());
        message.setSubject("Annulation de votre inscription");
        message.setFrom("noreply@formation.com");

        String contenu = String.format(
                "Bonjour %s %s,\n\n" +
                        "Votre inscription à la formation '%s' a été annulée.\n\n" +
                        "Cordialement,\nL'équipe de formation",
                inscription.getPrenom(),
                inscription.getNom(),
                formation.getTitre()
        );

        message.setText(contenu);
        mailSender.send(message);
    }
}