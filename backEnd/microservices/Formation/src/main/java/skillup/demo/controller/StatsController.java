package skillup.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skillup.demo.model.Formation;
import skillup.demo.model.Inscription;
import skillup.demo.service.FormationService;
import skillup.demo.service.InscriptionService;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
@CrossOrigin(origins = "http://localhost:4200")

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private InscriptionService inscriptionService;

    @Autowired
    private FormationService formationService;

    @GetMapping("/inscriptions-journalieres")
    public ResponseEntity<Map<String, Object>> getInscriptionsJournalieres(
            @RequestParam(required = false) LocalDate dateDebut,
            @RequestParam(required = false) LocalDate dateFin) {

        final LocalDate debut = dateDebut != null ? dateDebut : LocalDate.now().minusDays(6);
        final LocalDate fin = dateFin != null ? dateFin : LocalDate.now();

        List<skillup.demo.model.Inscription> toutesInscriptions = inscriptionService.getAllInscriptions();

        List<skillup.demo.model.Inscription> inscriptionsPeriode = toutesInscriptions.stream()
                .filter(ins -> !ins.getDateInscription().isBefore(debut)
                        && !ins.getDateInscription().isAfter(fin))
                .collect(Collectors.toList());

        Map<LocalDate, Long> inscriptionsParJour = inscriptionsPeriode.stream()
                .collect(Collectors.groupingBy(
                        skillup.demo.model.Inscription::getDateInscription,
                        TreeMap::new,
                        Collectors.counting()
                ));

        Map<String, Long> inscriptionsParFormation = inscriptionsPeriode.stream()
                .collect(Collectors.groupingBy(
                        ins -> ins.getFormation().getTitre(),
                        Collectors.counting()
                ));

        Map<LocalDate, Map<String, Long>> inscriptionsParJourEtFormation =
                new TreeMap<>();

        LocalDate currentDate = debut;
        while (!currentDate.isAfter(fin)) {
            final LocalDate date = currentDate;

            Map<String, Long> statsJour = inscriptionsPeriode.stream()
                    .filter(ins -> ins.getDateInscription().equals(date))
                    .collect(Collectors.groupingBy(
                            ins -> ins.getFormation().getTitre(),
                            Collectors.counting()
                    ));

            if (!statsJour.isEmpty()) {
                inscriptionsParJourEtFormation.put(date, statsJour);
            }

            currentDate = currentDate.plusDays(1);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("periode", Map.of("debut", debut, "fin", fin));
        result.put("totalInscriptions", inscriptionsPeriode.size());
        result.put("parJour", inscriptionsParJour);
        result.put("parFormation", inscriptionsParFormation);
        result.put("detailParJourEtFormation", inscriptionsParJourEtFormation);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<Inscription> inscriptions = inscriptionService.getAllInscriptions();
        List<Formation> formations = formationService.getAllFormations();

        Map<String, Object> stats = new HashMap<>();

        // Stats formations
        stats.put("totalFormations", formations.size());
        stats.put("formationsAvecPlaces", formations.stream()
                .filter(f -> f.getPlacesDisponibles() > 0)
                .count());
        stats.put("formationsCompletes", formations.stream()
                .filter(f -> f.getPlacesDisponibles() == 0)
                .count());

        final LocalDate now = LocalDate.now();
        final LocalDate weekAgo = now.minusWeeks(1);

        stats.put("totalInscriptions", inscriptions.size());
        stats.put("inscriptionsMois", inscriptions.stream()
                .filter(ins -> ins.getDateInscription().getMonth() == now.getMonth())
                .count());
        stats.put("inscriptionsSemaine", inscriptions.stream()
                .filter(ins -> ins.getDateInscription().isAfter(weekAgo))
                .count());
        stats.put("inscriptionsAujourdhui", inscriptions.stream()
                .filter(ins -> ins.getDateInscription().equals(now))
                .count());

        Map<String, Long> topFormations = inscriptions.stream()
                .collect(Collectors.groupingBy(
                        ins -> ins.getFormation().getTitre(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        stats.put("topFormations", topFormations);

        return ResponseEntity.ok(stats);
    }
}