package skillup.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skillup.demo.model.Inscription;
import skillup.demo.service.InscriptionService;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class InscriptionController {

    @Autowired
    private InscriptionService inscriptionService;

    // ✅ CORRECTION : Supprimer @RequestBody, utiliser l'email du token
    @PostMapping("/formations/{formationId}/inscriptions")
    public ResponseEntity<?> inscrire(
            @PathVariable Long formationId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userEmail = extractEmailFromToken(authHeader);
            System.out.println("📧 Email extrait: " + userEmail);

            Inscription saved = inscriptionService.inscrireConnecte(formationId, userEmail);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.out.println("ERREUR: " + e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private String extractEmailFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return "user@test.com";
        }
        String token = authHeader.substring(7);
        try {
            String[] parts = token.split("\\.");
            String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
            int subIndex = payload.indexOf("\"sub\":\"");
            if (subIndex > 0) {
                int start = subIndex + 7;
                int end = payload.indexOf("\"", start);
                return payload.substring(start, end);
            }
        } catch (Exception e) {
            // ignore
        }
        return "user@test.com";
    }

    @GetMapping("/inscriptions")
    public ResponseEntity<List<Inscription>> getAllInscriptions() {
        List<Inscription> inscriptions = inscriptionService.getAllInscriptions();
        return new ResponseEntity<>(inscriptions, HttpStatus.OK);
    }

    @GetMapping("/formations/{formationId}/inscriptions")
    public ResponseEntity<List<Inscription>> getInscriptionsByFormation(@PathVariable Long formationId) {
        List<Inscription> inscriptions = inscriptionService.getInscriptionsByFormation(formationId);
        return new ResponseEntity<>(inscriptions, HttpStatus.OK);
    }

    @GetMapping("/inscriptions/{id}")
    public ResponseEntity<Inscription> getInscriptionById(@PathVariable Long id) {
        try {
            Inscription inscription = inscriptionService.getInscriptionById(id);
            return new ResponseEntity<>(inscription, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/inscriptions/{id}")
    public ResponseEntity<Inscription> updateInscription(@PathVariable Long id, @RequestBody Inscription inscription) {
        try {
            Inscription updated = inscriptionService.updateInscription(id, inscription);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/inscriptions/{id}/annuler")
    public ResponseEntity<String> annulerInscription(@PathVariable Long id) {
        try {
            String result = inscriptionService.annulerInscription(id);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/inscriptions/{id}")
    public ResponseEntity<String> deleteInscription(@PathVariable Long id) {
        String result = inscriptionService.deleteInscription(id);
        if (result.equals("Inscription supprimée avec succès")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
    }
}