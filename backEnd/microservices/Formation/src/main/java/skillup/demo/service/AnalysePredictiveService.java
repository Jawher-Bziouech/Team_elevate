package skillup.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skillup.demo.model.Formation;
import skillup.demo.model.FormationPrediction;
import skillup.demo.model.Inscription;
import skillup.demo.repository.FormationPredictionRepository;
import skillup.demo.repository.FormationRepository;
import skillup.demo.repository.InscriptionRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AnalysePredictiveService {

    private final FormationRepository formationRepository;
    private final InscriptionRepository inscriptionRepository;
    private final FormationPredictionRepository predictionRepository;

    // Paramètres pour analyse journalière
    private final int DUREE_COURTE = 3;  // 3 jours pour la période courte
    private final int DUREE_LONGUE = 7;  // 7 jours pour la période longue

    public AnalysePredictiveService(FormationRepository formationRepository,
                                    InscriptionRepository inscriptionRepository,
                                    FormationPredictionRepository predictionRepository) {
        this.formationRepository = formationRepository;
        this.inscriptionRepository = inscriptionRepository;
        this.predictionRepository = predictionRepository;
    }

    @Transactional
    public void genererPredictions() {
        LocalDate maintenant = LocalDate.now();
        List<Formation> formations = formationRepository.findAll();

        System.out.println("🔮 ANALYSE JOURNALIÈRE SIMPLE - " + maintenant);
        System.out.println("Période analyse: " + DUREE_LONGUE + " jours");

        for (Formation formation : formations) {
            FormationPrediction prediction = predirePourFormation(formation, maintenant);
            predictionRepository.save(prediction);
        }

        System.out.println("✅ " + formations.size() + " prédictions générées");
    }

    private FormationPrediction predirePourFormation(Formation formation, LocalDate maintenant) {
        LocalDate debutLongue = maintenant.minusDays(DUREE_LONGUE);

        // Récupérer les inscriptions des 7 derniers jours
        List<Inscription> inscriptions7Jours = inscriptionRepository
                .findByFormationAndDateInscriptionAfter(formation, debutLongue);

        // Afficher les données pour debug
        System.out.println("📊 " + formation.getTitre() +
                " - Derniers " + DUREE_LONGUE + " jours: " + inscriptions7Jours.size() + " inscriptions");

        // Calculer la croissance
        double croissance = calculerCroissanceSimple(inscriptions7Jours);

        // PRÉDICTION SIMPLE : inscriptions 7 jours × 4
        int inscriptionsPrevues = predireInscriptionsSimple(inscriptions7Jours);

        // Calculer le niveau de confiance
        double niveauConfiance = calculerNiveauConfianceJournalier(inscriptions7Jours.size());

        // Tendance basée sur la confiance
        String tendance = determinerTendance(niveauConfiance);

        FormationPrediction prediction = new FormationPrediction();
        prediction.setFormation(formation);
        prediction.setDatePrediction(maintenant);
        prediction.setInscriptionsPrevues(inscriptionsPrevues);
        prediction.setCroissanceEstimee(croissance);
        prediction.setNiveauConfiance(niveauConfiance);
        prediction.setTendance(tendance);
        prediction.setDateDebutAnalyse(debutLongue);
        prediction.setDateFinAnalyse(maintenant);

        return prediction;
    }

    /**
     * Calcule une croissance simple
     */
    private double calculerCroissanceSimple(List<Inscription> inscriptions7Jours) {
        if (inscriptions7Jours.isEmpty()) return 0;

        if (inscriptions7Jours.size() > 10) return 0.5;
        if (inscriptions7Jours.size() > 5) return 0.2;
        if (inscriptions7Jours.size() > 2) return 0.1;
        return -0.1;
    }

    /**
     * PRÉDICTION SIMPLE : inscriptions des 7 derniers jours × 4
     */
    private int predireInscriptionsSimple(List<Inscription> inscriptions7Jours) {
        if (inscriptions7Jours.isEmpty()) {
            return 0;
        }
        return inscriptions7Jours.size() * 4;
    }

    /**
     * Tendance basée sur la confiance
     */
    private String determinerTendance(double niveauConfiance) {
        if (niveauConfiance >= 0.6) {
            return "HAUSSE";
        } else if (niveauConfiance >= 0.3) {
            return "MOYEN";
        } else {
            return "BAISSE";
        }
    }

    /**
     * Calcule le niveau de confiance basé sur le nombre de données
     */
    private double calculerNiveauConfianceJournalier(int nbDonnees) {
        if (nbDonnees < 3) return 0.2;
        if (nbDonnees < 5) return 0.3;
        if (nbDonnees < 10) return 0.5;
        if (nbDonnees < 20) return 0.7;
        if (nbDonnees < 30) return 0.8;
        return 0.9;
    }

    @Transactional
    public void genererPredictionsHebdomadaires() {
        genererPredictions();
        envoyerRapportPredictions();
    }

    private void envoyerRapportPredictions() {
        LocalDate aujourdhui = LocalDate.now();
        List<FormationPrediction> predictions = predictionRepository.findByDatePrediction(aujourdhui);

        System.out.println("\n📊 RAPPORT DES PRÉDICTIONS - " + aujourdhui);
        System.out.println("=================================");

        for (FormationPrediction p : predictions) {
            String fleche = p.getTendance().equals("HAUSSE") ? "📈" :
                    (p.getTendance().equals("BAISSE") ? "📉" : "➡️");
            System.out.println(String.format(
                    "%s %s : %d inscriptions prévues (confiance %.0f%%) [%s]",
                    fleche,
                    p.getFormation().getTitre(),
                    p.getInscriptionsPrevues(),
                    p.getNiveauConfiance() * 100,
                    p.getTendance()
            ));
        }
    }

    // ========== MÉTHODES POUR L'API ==========

    public List<FormationPrediction> getDernieresPredictions() {
        return predictionRepository.findByDatePrediction(LocalDate.now());
    }

    public Optional<FormationPrediction> getPredictionForFormation(Long formationId) {
        Formation formation = formationRepository.findById(formationId).orElse(null);
        if (formation == null) return Optional.empty();
        return predictionRepository.findTopByFormationOrderByDatePredictionDesc(formation);
    }

    public List<FormationPrediction> getFortesCroissances() {
        return predictionRepository.findFortesCroissances(0.15);
    }

    public void genererPredictionsMensuelles() {
    }
}