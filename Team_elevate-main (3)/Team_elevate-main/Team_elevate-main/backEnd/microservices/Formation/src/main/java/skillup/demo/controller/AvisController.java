package skillup.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skillup.demo.model.Avis;
import skillup.demo.repository.AvisRepository;
import skillup.demo.service.AvisService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avis")
@CrossOrigin(origins = "http://localhost:4200")
public class AvisController {

    private final AvisService avisService;
    private final AvisRepository avisRepository;

    public AvisController(AvisService avisService, AvisRepository avisRepository) {
        this.avisService = avisService;
        this.avisRepository = avisRepository;
    }

    @PostMapping("/donner")
    public ResponseEntity<Avis> donnerAvis(@RequestBody Map<String, Object> payload) {
        Long inscriptionId = Long.valueOf(payload.get("inscriptionId").toString());
        String ressenti = payload.get("ressenti").toString();
        String commentaire = payload.get("commentaire").toString();

        return ResponseEntity.ok(avisService.donnerAvis(inscriptionId, ressenti, commentaire));
    }

    @GetMapping("/formation/{formationId}")
    public ResponseEntity<List<Avis>> getAvisByFormation(@PathVariable Long formationId) {
        return ResponseEntity.ok(avisService.getAvisByFormation(formationId));
    }

    @GetMapping("/formation/{formationId}/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques(@PathVariable Long formationId) {
        return ResponseEntity.ok(avisService.getStatistiques(formationId));
    }

    @GetMapping("/inscription/{inscriptionId}/existe")
    public ResponseEntity<Boolean> hasAvis(@PathVariable Long inscriptionId) {
        return ResponseEntity.ok(avisService.hasAvis(inscriptionId));
    }


    @GetMapping("/inscription/{inscriptionId}")
    public ResponseEntity<Avis> getAvisByInscriptionId(@PathVariable Long inscriptionId) {
        return ResponseEntity.ok(avisService.getAvisByInscriptionId(inscriptionId));
    }

    @GetMapping("/tous")
    public ResponseEntity<List<Avis>> getAllAvis() {
        return ResponseEntity.ok(avisRepository.findAll());
    }

}