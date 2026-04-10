package tn.esprit.certificat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class CertificatSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(CertificatSchedulerService.class);
    private final CertificatRepository repository;
    private final JavaMailSender mailSender;
    private final UserClient userClient;

    public CertificatSchedulerService(CertificatRepository repository, JavaMailSender mailSender, UserClient userClient) {
        this.repository = repository;
        this.mailSender = mailSender;
        this.userClient = userClient;
    }

    /**
     * SERVICE 1 — Auto-Expire Old Certificates
     * Cron: every day at midnight (00:00)
     * Business logic: APPROVED certificates issued more than 2 years (730 days) ago
     * are no longer valid and must be marked EXPIRED.
     */
    @Scheduled(cron = "*/30 * * * * *")
    public void autoExpireCertificats() {
        log.info("[SCHEDULER] Running auto-expire job...");

        List<Certificat> approved = repository.findByStatus("APPROVED");
        LocalDate expiredCutoff = LocalDate.now().minusYears(2);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        int count = 0;

        for (Certificat cert : approved) {
            try {
                LocalDate issueDate = LocalDate.parse(cert.getDate(), fmt);
                if (issueDate.isBefore(expiredCutoff)) {
                    cert.setStatus("EXPIRED");
                    repository.save(cert);
                    count++;
                    log.info("[SCHEDULER] Expired cert id={} (issued: {})", cert.getId(), cert.getDate());
                }
            } catch (DateTimeParseException e) {
                log.warn("[SCHEDULER] Bad date format for cert id={}: '{}'", cert.getId(), cert.getDate());
            }
        }

        log.info("[SCHEDULER] Auto-expire done. {} cert(s) expired.", count);
    }

    /**
     * SERVICE 2 — Warn Expiring-Soon Certificates
     * Cron: every day at 08:00 AM
     * Business logic: APPROVED certificates that will expire within 30 days
     * are marked EXPIRING_SOON and an email is dispatched.
     */
    @Scheduled(cron = "*/30 * * * * *")
    public void markExpiringSoonCertificats() {
        log.info("[SCHEDULER] Running expiring-soon check...");

        List<Certificat> approved = repository.findByStatus("APPROVED");

        // 2 years (730 days) minus 30 days warning window = 700 days
        LocalDate expiringSoonCutoff = LocalDate.now().minusDays(700);
        LocalDate expiredCutoff = LocalDate.now().minusYears(2);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        int count = 0;

        for (Certificat cert : approved) {
            try {
                LocalDate issueDate = LocalDate.parse(cert.getDate(), fmt);

                // Only mark EXPIRING_SOON if it's in the 30-day window (older than 700 days, but newer than 730 days)
                if (issueDate.isBefore(expiringSoonCutoff) && !issueDate.isBefore(expiredCutoff)) {
                    cert.setStatus("EXPIRING_SOON");
                    repository.save(cert);
                    count++;
                    log.info("[SCHEDULER] Cert id={} marked EXPIRING_SOON (issued: {})", cert.getId(), cert.getDate());

                    // Fetch user info from the User microservice and send the email
                    try {
                        UserDTO user = userClient.getUserById(cert.getUserId());
                        if (user != null && user.getEmail() != null) {
                            sendExpirationWarningEmail(user.getEmail(), user.getUsername(), cert.getNom());
                        } else {
                            log.warn("[SCHEDULER] Could not send email: User or email is null for userId={}", cert.getUserId());
                        }
                    } catch (Exception e) {
                        log.error("[SCHEDULER] Failed to reach User microservice for email sending: {}", e.getMessage());
                    }
                }
            } catch (DateTimeParseException e) {
                log.warn("[SCHEDULER] Bad date format for cert id={}: '{}'", cert.getId(), cert.getDate());
            }
        }

        log.info("[SCHEDULER] Expiring-soon check done. {} cert(s) flagged and notified.", count);
    }

    /**
     * Helper method to dispatch the email.
     */
    private void sendExpirationWarningEmail(String toEmail, String userName, String certName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Action Required: Certificate Expiring Soon");
            message.setText("Dear " + userName + ",\n\n" +
                    "Your certification for '" + certName + "' is expiring within the next 30 days.\n" +
                    "Please log into SkillUp to view and renew your certificate.\n\n" +
                    "Best regards,\nThe SkillUp Team");

            mailSender.send(message);
            log.info("[SCHEDULER] Sent warning email successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("[SCHEDULER] Failed to send email to {}. Error: {}", toEmail, e.getMessage());
        }
    }
}
