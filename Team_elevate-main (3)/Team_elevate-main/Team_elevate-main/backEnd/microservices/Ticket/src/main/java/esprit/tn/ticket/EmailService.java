/*package esprit.tn.ticket;

import esprit.tn.ticket.entity.Ticket;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendTicketResponseEmail(String toEmail, Ticket ticket, String adminName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Réponse à votre ticket #" + ticket.getTicketId());

            Context context = new Context();
            context.setVariable("ticketId", ticket.getTicketId());
            context.setVariable("ticketDescription", ticket.getDescription());
            context.setVariable("adminResponse", ticket.getAdminResponse());
            context.setVariable("adminName", adminName);
            context.setVariable("responseDate", ticket.getResponseDate());
            context.setVariable("status", ticket.getStatus());

            String htmlContent = templateEngine.process("ticket-response", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email envoyé avec succès à: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Erreur lors de l'envoi d'email: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi d'email", e);
        }
    }

    public void sendTicketCreationEmail(String toEmail, Ticket ticket) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Ticket créé avec succès #" + ticket.getTicketId());

            Context context = new Context();
            context.setVariable("ticketId", ticket.getTicketId());
            context.setVariable("description", ticket.getDescription());
            context.setVariable("category", ticket.getCategory());
            context.setVariable("createdAt", ticket.getCreatedAt());
            context.setVariable("createdByName", ticket.getCreatedByName());

            String htmlContent = templateEngine.process("ticket-creation", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email de confirmation envoyé à: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Erreur lors de l'envoi d'email: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi d'email", e);
        }
    }

    public void sendTicketResolutionEmail(String toEmail, Ticket ticket) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Ticket #" + ticket.getTicketId() + " résolu");

            Context context = new Context();
            context.setVariable("ticketId", ticket.getTicketId());
            context.setVariable("resolution", ticket.getResolutionDescription());
            context.setVariable("resolutionDate", ticket.getResolutionDate());

            String htmlContent = templateEngine.process("ticket-resolution", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email de résolution envoyé à: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Erreur lors de l'envoi d'email: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi d'email", e);
        }
    }
}*/