package skillup.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skillup.demo.model.FormationPrediction;
import skillup.demo.service.AnalysePredictiveService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:4200")
public class PredictionController {

    private final AnalysePredictiveService analysePredictiveService;

    public PredictionController(AnalysePredictiveService analysePredictiveService) {
        this.analysePredictiveService = analysePredictiveService;
    }

    @GetMapping("/dernieres")
    public ResponseEntity<List<FormationPrediction>> getDernieresPredictions() {
        return ResponseEntity.ok(analysePredictiveService.getDernieresPredictions());
    }

    @GetMapping("/formation/{id}")
    public ResponseEntity<FormationPrediction> getPredictionForFormation(@PathVariable Long id) {
        return analysePredictiveService.getPredictionForFormation(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/fortes-croissances")
    public ResponseEntity<List<FormationPrediction>> getFortesCroissances() {
        return ResponseEntity.ok(analysePredictiveService.getFortesCroissances());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardPredictions() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("dernieresPredictions", analysePredictiveService.getDernieresPredictions());
        dashboard.put("fortesCroissances", analysePredictiveService.getFortesCroissances());
        return ResponseEntity.ok(dashboard);
    }

    // ✅ UNE SEULE MÉTHODE pour forcer les prédictions
    @GetMapping("/forcer")
    public String forcerPredictions() {
        analysePredictiveService.genererPredictions();
        return "Prédictions générées !";
    }
}