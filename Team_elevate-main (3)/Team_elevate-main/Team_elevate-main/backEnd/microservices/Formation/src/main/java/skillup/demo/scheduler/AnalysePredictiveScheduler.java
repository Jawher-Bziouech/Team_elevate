package skillup.demo.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import skillup.demo.service.AnalysePredictiveService;

@Component
public class AnalysePredictiveScheduler {

    private final AnalysePredictiveService analysePredictiveService;

    public AnalysePredictiveScheduler(AnalysePredictiveService analysePredictiveService) {
        this.analysePredictiveService = analysePredictiveService;
    }

    @Scheduled(cron = "0 0 2 * * MON") // Tous les lundis à 2h du matin
    public void analyserTendancesHebdomadaires() {
        System.out.println("🔮 Lancement de l'analyse prédictive hebdomadaire...");
        analysePredictiveService.genererPredictions();
    }

    @Scheduled(cron = "0 0 3 1 * *") // Le 1er de chaque mois à 3h
    public void analyserTendancesMensuelles() {
        System.out.println("📊 Lancement de l'analyse prédictive mensuelle...");
        analysePredictiveService.genererPredictionsMensuelles();
    }
}