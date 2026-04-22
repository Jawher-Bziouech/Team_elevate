package tn.esprit.internship.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.internship.service.InternshipService;

@Component
@RequiredArgsConstructor
@Slf4j
public class InternshipExpirationScheduler {

    private final InternshipService internshipService;


    @Scheduled(cron = "0 * * * * ?")
    public void deleteExpiredInternships() {
        log.info("[Scheduler] Starting automated internship permanent deletion task...");
        int count = internshipService.deleteExpiredOffers();
        if (count > 0) {
            log.info("[Scheduler] Successfully permanently deleted {} expired internship offers and their applications.", count);
        } else {
            log.info("[Scheduler] No expired internships found to delete.");
        }
    }
}
