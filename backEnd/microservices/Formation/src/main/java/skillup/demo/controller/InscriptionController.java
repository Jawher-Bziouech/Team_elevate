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

    @PostMapping("/formations/{formationId}/inscriptions")
    public ResponseEntity<?> inscrire(@PathVariable Long formationId, @RequestBody Inscription inscription) {
        try {
            Inscription saved = inscriptionService.inscrire(formationId, inscription);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
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

    // ✅ La méthode countInscriptionsByFormation a été SUPPRIMÉE d'ici
    // car elle existe déjà dans FormationRestApi
}