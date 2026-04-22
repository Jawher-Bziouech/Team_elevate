package tn.esprit.entreprise.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.entreprise.entity.Entreprise;
import tn.esprit.entreprise.repository.EntrepriseRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AutoRejectScheduler {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    // Every day at midnight: auto-reject PENDING companies older than 30 days
    @Scheduled(cron = "0 0 0 * * *")
    public void rejectStalePendingEntreprises() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<Entreprise> stale = entrepriseRepository.findByStatus("PENDING").stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().isBefore(cutoff))
                .toList();
        stale.forEach(e -> e.setStatus("REJECTED"));
        entrepriseRepository.saveAll(stale);
    }
}
