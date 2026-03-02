package skillup.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skillup.demo.model.RapportObsolescence;
import skillup.demo.service.ObsolescenceService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/obsolescence")
@CrossOrigin(origins = "http://localhost:4200")
public class ObsolescenceController {

    private final ObsolescenceService obsolescenceService;

    public ObsolescenceController(ObsolescenceService obsolescenceService) {
        this.obsolescenceService = obsolescenceService;
    }

    @GetMapping("/rapports")
    public ResponseEntity<List<RapportObsolescence>> getDerniersRapports() {
        return ResponseEntity.ok(obsolescenceService.getDerniersRapports());
    }

    @GetMapping("/risques-eleves")
    public ResponseEntity<List<RapportObsolescence>> getRisquesEleves() {
        return ResponseEntity.ok(obsolescenceService.getRisquesEleves());
    }

    @GetMapping("/a-retirer")
    public ResponseEntity<List<RapportObsolescence>> getFormationsARetirer() {
        return ResponseEntity.ok(obsolescenceService.getFormationsARetirer());
    }

    @GetMapping("/a-mettre-a-jour")
    public ResponseEntity<List<RapportObsolescence>> getFormationsAMettreAJour() {
        return ResponseEntity.ok(obsolescenceService.getFormationsAMettreAJour());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardObsolescence() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("derniersRapports", obsolescenceService.getDerniersRapports());
        dashboard.put("risquesEleves", obsolescenceService.getRisquesEleves());
        dashboard.put("aRetirer", obsolescenceService.getFormationsARetirer());
        dashboard.put("aMettreAJour", obsolescenceService.getFormationsAMettreAJour());

        // Ajouter des statistiques
        dashboard.put("total", obsolescenceService.getDerniersRapports().size());
        dashboard.put("date", LocalDate.now().toString());

        return ResponseEntity.ok(dashboard);
    }

    // ✅ FORCER LA DÉTECTION JOURNALIÈRE
    @GetMapping("/forcer")
    public ResponseEntity<Map<String, String>> forcerObsolescence() {
        obsolescenceService.detecterFormationsObsolètes();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Rapports d'obsolescence générés !");
        response.put("date", LocalDate.now().toString());
        response.put("status", "SUCCESS");

        return ResponseEntity.ok(response);
    }

    // ✅ FORCER AVEC PARAMÈTRE (journalier ou mensuel)
    @GetMapping("/forcer/{type}")
    public ResponseEntity<Map<String, String>> forcerObsolescenceParType(@PathVariable String type) {
        Map<String, String> response = new HashMap<>();

        if ("mensuel".equalsIgnoreCase(type)) {
            obsolescenceService.genererRapportMensuel();
            response.put("message", "Rapport mensuel généré !");
        } else {
            obsolescenceService.detecterFormationsObsolètes();
            response.put("message", "Rapport journalier généré !");
        }

        response.put("date", LocalDate.now().toString());
        response.put("status", "SUCCESS");

        return ResponseEntity.ok(response);
    }

    // ✅ VOIR LE STATUT
    @GetMapping("/statut")
    public ResponseEntity<Map<String, Object>> getStatut() {
        Map<String, Object> statut = new HashMap<>();

        List<RapportObsolescence> rapports = obsolescenceService.getDerniersRapports();

        long critiques = rapports.stream()
                .filter(r -> "CRITIQUE".equals(r.getNiveauRisque()))
                .count();

        long eleves = rapports.stream()
                .filter(r -> "ELEVE".equals(r.getNiveauRisque()))
                .count();

        statut.put("totalAnalyses", rapports.size());
        statut.put("critiques", critiques);
        statut.put("risquesEleves", eleves);
        statut.put("aRetirer", obsolescenceService.getFormationsARetirer().size());
        statut.put("aMettreAJour", obsolescenceService.getFormationsAMettreAJour().size());
        statut.put("dateDerniereAnalyse", LocalDate.now());

        return ResponseEntity.ok(statut);
    }
}