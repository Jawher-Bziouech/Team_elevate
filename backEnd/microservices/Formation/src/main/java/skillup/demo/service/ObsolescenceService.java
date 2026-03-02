package skillup.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skillup.demo.model.Formation;
import skillup.demo.model.RapportObsolescence;
import skillup.demo.repository.FormationRepository;
import skillup.demo.repository.InscriptionRepository;
import skillup.demo.repository.RapportObsolescenceRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ObsolescenceService {

    private final FormationRepository formationRepository;
    private final InscriptionRepository inscriptionRepository;
    private final RapportObsolescenceRepository rapportRepository;

    public ObsolescenceService(FormationRepository formationRepository,
                               InscriptionRepository inscriptionRepository,
                               RapportObsolescenceRepository rapportRepository) {
        this.formationRepository = formationRepository;
        this.inscriptionRepository = inscriptionRepository;
        this.rapportRepository = rapportRepository;
    }

    @Transactional
    public void detecterFormationsObsolètes() {
        LocalDate maintenant = LocalDate.now();
        List<Formation> formations = formationRepository.findAll();

        System.out.println("\n🔍 DÉTECTION D'OBSOLESCENCE - " + maintenant);
        System.out.println("=================================");

        for (Formation formation : formations) {
            RapportObsolescence rapport = analyserFormation(formation);
            rapportRepository.save(rapport);

            // Alerter si nécessaire
            if (rapport.getScoreObsolescence() >= 7) {
                envoyerAlerte(rapport);
            }
        }

        System.out.println("✅ " + formations.size() + " formations analysées");
    }

    @Transactional
    public void genererRapportMensuel() {
        detecterFormationsObsolètes();
        afficherRapportMensuel();
    }

    private RapportObsolescence analyserFormation(Formation formation) {
        LocalDate maintenant = LocalDate.now();
        LocalDate unAnAvant = maintenant.minusYears(1);
        LocalDate deuxAnsAvant = maintenant.minusYears(2);

        System.out.println("\n🔍 ANALYSE: " + formation.getTitre());
        System.out.println("   Date dernière MAJ: " + formation.getDateDerniereMAJ());

        // Récupérer les stats
        long inscriptionsAnnee = inscriptionRepository
                .countByFormationAndDateInscriptionAfter(formation, unAnAvant);
        System.out.println("   Inscriptions année: " + inscriptionsAnnee);

        long inscriptionsAnneePrecedente = inscriptionRepository
                .countByFormationAndDateInscriptionBetween(formation, deuxAnsAvant, unAnAvant);
        System.out.println("   Inscriptions année précédente: " + inscriptionsAnneePrecedente);

        long inscriptionsTotales = inscriptionRepository.countByFormation(formation);
        System.out.println("   Inscriptions totales: " + inscriptionsTotales);

        long annulations = inscriptionRepository
                .countByFormationAndStatut(formation, "ANNULEE");
        System.out.println("   Annulations: " + annulations);

        // Calculer les indicateurs
        boolean baisseImportante = inscriptionsAnneePrecedente > 0 &&
                inscriptionsAnnee < inscriptionsAnneePrecedente * 0.5;
        boolean baisseModeree = inscriptionsAnneePrecedente > 0 &&
                inscriptionsAnnee < inscriptionsAnneePrecedente * 0.7;

        double baisseInscriptions = 0;
        if (inscriptionsAnneePrecedente > 0) {
            baisseInscriptions = 1 - ((double) inscriptionsAnnee / inscriptionsAnneePrecedente);
        }

        double tauxAnnulation = inscriptionsTotales > 0 ?
                (double) annulations / inscriptionsTotales : 0;

        // Vérifier si la formation a une date de dernière mise à jour
        boolean derniereMAJAncienne = false;
        if (formation.getDateDerniereMAJ() != null) {
            derniereMAJAncienne = formation.getDateDerniereMAJ().isBefore(deuxAnsAvant);
            System.out.println("   MAJ ancienne (>2 ans): " + derniereMAJAncienne);
        }

        // Vérifier les technologies dépréciées
        boolean technologiesDepreciees = false;
        if (formation.getTechnologies() != null && !formation.getTechnologies().isEmpty()) {
            technologiesDepreciees = formation.getTechnologies().stream()
                    .anyMatch(tech -> List.of("struts", "jsp", "flash", "angularjs", "jquery", "backbone")
                            .contains(tech.toLowerCase()));
            System.out.println("   Technologies dépréciées: " + technologiesDepreciees);
        }

        // Calculer le score d'obsolescence (0-10)
        int score = 0;
        List<String> criteres = new ArrayList<>();

        if (baisseImportante) {
            score += 4;
            criteres.add("📉 Baisse de plus de 50% des inscriptions sur 1 an");
            System.out.println("   ✓ +4 points: Baisse importante");
        } else if (baisseModeree) {
            score += 2;
            criteres.add("📉 Baisse de plus de 30% des inscriptions sur 1 an");
            System.out.println("   ✓ +2 points: Baisse modérée");
        }

        if (derniereMAJAncienne) {
            score += 3;
            criteres.add("📅 Dernière mise à jour il y a plus de 2 ans");
            System.out.println("   ✓ +3 points: MAJ ancienne");
        }

        if (technologiesDepreciees) {
            score += 2;
            criteres.add("🔧 Technologies dépréciées détectées");
            System.out.println("   ✓ +2 points: Technologies dépréciées");
        }

        if (tauxAnnulation > 0.3) {
            score += 2;
            criteres.add("❌ Taux d'annulation élevé (" + Math.round(tauxAnnulation * 100) + "%)");
            System.out.println("   ✓ +2 points: Taux annulation élevé");
        }

        if (inscriptionsAnnee == 0 && inscriptionsTotales > 0) {
            score += 3;
            criteres.add("🚫 Aucune inscription cette année");
            System.out.println("   ✓ +3 points: Aucune inscription cette année");
        }

        System.out.println("   📊 SCORE TOTAL: " + score + "/10");

        // Déterminer le niveau de risque
        String niveauRisque;
        if (score >= 8) niveauRisque = "CRITIQUE";
        else if (score >= 6) niveauRisque = "ELEVE";
        else if (score >= 4) niveauRisque = "MOYEN";
        else niveauRisque = "FAIBLE";

        // Déterminer la recommandation
        String recommandation;
        if (score >= 8) recommandation = "RETIRER";
        else if (score >= 6) recommandation = "METTRE_A_JOUR";
        else if (score >= 4) recommandation = "SURVEILLER";
        else recommandation = "RIEN";

        System.out.println("   🎯 Recommandation: " + recommandation);
        System.out.println("   📋 Critères: " + criteres);

        // Créer le rapport
        RapportObsolescence rapport = new RapportObsolescence();
        rapport.setFormation(formation);
        rapport.setDateRapport(maintenant);
        rapport.setScoreObsolescence(score);
        rapport.setNiveauRisque(niveauRisque);
        rapport.setRecommandation(recommandation);
        rapport.setCriteres(criteres);
        rapport.setBaisseInscriptions(baisseInscriptions);
        rapport.setDerniereMAJAncienne(derniereMAJAncienne);
        rapport.setTechnologiesDepreciees(technologiesDepreciees);
        rapport.setTauxAnnulation(tauxAnnulation);

        return rapport;
    }

    private void envoyerAlerte(RapportObsolescence rapport) {
        System.out.println("\n🚨 ALERTE OBSOLESCENCE");
        System.out.println("Formation: " + rapport.getFormation().getTitre());
        System.out.println("Score: " + rapport.getScoreObsolescence() + "/10");
        System.out.println("Risque: " + rapport.getNiveauRisque());
        System.out.println("Recommandation: " + rapport.getRecommandation());
        System.out.println("Raisons:");
        for (String raison : rapport.getCriteres()) {
            System.out.println("  • " + raison);
        }
        System.out.println("------------------------");
    }

    private void afficherRapportMensuel() {
        LocalDate maintenant = LocalDate.now();
        List<RapportObsolescence> rapports = rapportRepository.findByDateRapport(maintenant);

        System.out.println("\n📋 RAPPORT MENSUEL D'OBSOLESCENCE - " + maintenant);
        System.out.println("==========================================");

        if (rapports.isEmpty()) {
            System.out.println("Aucun rapport disponible pour ce mois");
            return;
        }

        for (RapportObsolescence r : rapports) {
            String icone;
            switch (r.getNiveauRisque()) {
                case "CRITIQUE":
                    icone = "❌";
                    break;
                case "ELEVE":
                    icone = "⚠️";
                    break;
                case "MOYEN":
                    icone = "⚡";
                    break;
                default:
                    icone = "✅";
            }

            System.out.println(String.format(
                    "%s %s : score %d/10 - %s - %s",
                    icone,
                    r.getFormation().getTitre(),
                    r.getScoreObsolescence(),
                    r.getNiveauRisque(),
                    r.getRecommandation()
            ));
        }

        // Résumé
        long critiques = rapports.stream().filter(r -> "CRITIQUE".equals(r.getNiveauRisque())).count();
        long eleves = rapports.stream().filter(r -> "ELEVE".equals(r.getNiveauRisque())).count();
        long aRetirer = rapports.stream().filter(r -> "RETIRER".equals(r.getRecommandation())).count();
        long aMettreAJour = rapports.stream().filter(r -> "METTRE_A_JOUR".equals(r.getRecommandation())).count();

        System.out.println("\n📊 RÉSUMÉ:");
        System.out.println("   Critiques: " + critiques);
        System.out.println("   Risques élevés: " + eleves);
        System.out.println("   À retirer: " + aRetirer);
        System.out.println("   À mettre à jour: " + aMettreAJour);
    }

    // ========== MÉTHODES POUR L'API ==========

    public List<RapportObsolescence> getDerniersRapports() {
        return rapportRepository.findByDateRapport(LocalDate.now());
    }

    public List<RapportObsolescence> getRisquesEleves() {
        return rapportRepository.findRisquesEleves(6); // Score >= 6
    }

    public List<RapportObsolescence> getFormationsARetirer() {
        return rapportRepository.findByRecommandation("RETIRER", LocalDate.now());
    }

    public List<RapportObsolescence> getFormationsAMettreAJour() {
        return rapportRepository.findByRecommandation("METTRE_A_JOUR", LocalDate.now());
    }

    public Map<String, Object> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        LocalDate aujourdhui = LocalDate.now();

        List<RapportObsolescence> rapports = getDerniersRapports();

        stats.put("total", rapports.size());
        stats.put("date", aujourdhui);
        stats.put("critiques", rapports.stream().filter(r -> "CRITIQUE".equals(r.getNiveauRisque())).count());
        stats.put("eleves", rapports.stream().filter(r -> "ELEVE".equals(r.getNiveauRisque())).count());
        stats.put("moyens", rapports.stream().filter(r -> "MOYEN".equals(r.getNiveauRisque())).count());
        stats.put("faibles", rapports.stream().filter(r -> "FAIBLE".equals(r.getNiveauRisque())).count());
        stats.put("aRetirer", rapports.stream().filter(r -> "RETIRER".equals(r.getRecommandation())).count());
        stats.put("aMettreAJour", rapports.stream().filter(r -> "METTRE_A_JOUR".equals(r.getRecommandation())).count());
        stats.put("aSurveiller", rapports.stream().filter(r -> "SURVEILLER".equals(r.getRecommandation())).count());

        return stats;
    }

    public RapportObsolescence getDernierRapportPourFormation(Long formationId) {
        Formation formation = formationRepository.findById(formationId).orElse(null);
        if (formation == null) return null;
        return rapportRepository.findTopByFormationOrderByDateRapportDesc(formation).orElse(null);
    }
}