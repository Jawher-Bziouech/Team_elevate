package skillup.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
public class FormationRestApi {

    @Autowired
    private FormationService formationService;

    // POST - Créer une formation
    @PostMapping
    public ResponseEntity<Formation> createFormation(@RequestBody Formation formation) {
        Formation savedFormation = formationService.addFormation(formation);
        return new ResponseEntity<>(savedFormation, HttpStatus.CREATED);
    }

    // GET - Toutes les formations
    @GetMapping
    public ResponseEntity<List<Formation>> getAllFormations() {
        List<Formation> formations = formationService.getAllFormations();
        return new ResponseEntity<>(formations, HttpStatus.OK);
    }

    // GET - Formation par ID
    @GetMapping("/{id}")
    public ResponseEntity<Formation> getFormationById(@PathVariable Long id) {
        Formation formation = formationService.getFormationById(id);
        if (formation != null) {
            return new ResponseEntity<>(formation, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // PUT - Mettre à jour une formation
    @PutMapping("/{id}")
    public ResponseEntity<Formation> updateFormation(@PathVariable Long id, @RequestBody Formation formation) {
        Formation updatedFormation = formationService.updateFormation(id, formation);
        if (updatedFormation != null) {
            return new ResponseEntity<>(updatedFormation, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // DELETE - Supprimer une formation
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFormation(@PathVariable Long id) {
        String result = formationService.deleteFormation(id);
        if (result.equals("Formation supprimée avec succès")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
    }
    // Dans FormationRestApi.java
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> formationExists(@PathVariable Long id) {
        boolean exists = formationService.existsById(id);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }



}