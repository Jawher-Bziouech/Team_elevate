package skillup.demo.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import skillup.demo.service.ObsolescenceService;

@Component
public class ObsolescenceScheduler {

    private final ObsolescenceService obsolescenceService;

    public ObsolescenceScheduler(ObsolescenceService obsolescenceService) {
        this.obsolescenceService = obsolescenceService;
    }

    @Scheduled(cron = "0 0 4 * * SUN") // Tous les dimanches à 4h
    public void detecterObsolescenceHebdomadaire() {
        System.out.println("🔍 Lancement de la détection d'obsolescence...");
        obsolescenceService.detecterFormationsObsolètes();
    }

    @Scheduled(cron = "0 0 5 1 * *") // Le 1er de chaque mois à 5h
    public void genererRapportMensuel() {
        System.out.println("📋 Génération du rapport mensuel d'obsolescence...");
        obsolescenceService.genererRapportMensuel();
    }
}