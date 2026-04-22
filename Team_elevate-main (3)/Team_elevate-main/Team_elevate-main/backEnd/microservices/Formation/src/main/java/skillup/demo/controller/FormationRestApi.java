package skillup.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import skillup.demo.model.Formation;
import skillup.demo.model.Inscription;
import skillup.demo.model.FormationPrediction;
import skillup.demo.service.FormationService;
import skillup.demo.repository.InscriptionRepository;
import skillup.demo.repository.FormationPredictionRepository;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/formations")
public class FormationRestApi {

    @Autowired
    private FormationService formationService;

    @Autowired
    private InscriptionRepository inscriptionRepository;

    @Autowired
    private FormationPredictionRepository predictionRepository;  // ← AJOUTER CETTE LIGNE

    // ✅ POST - Créer une formation
    @PostMapping
    public ResponseEntity<Formation> createFormation(@RequestBody Formation formation) {
        System.out.println("📥 Création formation - Titre: " + formation.getTitre());
        Formation savedFormation = formationService.addFormation(formation);
        return new ResponseEntity<>(savedFormation, HttpStatus.CREATED);
    }

    // ✅ PUT - Mettre à jour une formation
    @PutMapping("/{id}")
    public ResponseEntity<Formation> updateFormation(
            @PathVariable Long id,
            @RequestBody Formation formation) {
        System.out.println("📝 Mise à jour formation id: " + id);
        formation.setId(id);
        Formation updatedFormation = formationService.updateFormation(id, formation);
        if (updatedFormation != null) {
            return new ResponseEntity<>(updatedFormation, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ✅ GET - Toutes les formations
    @GetMapping
    public ResponseEntity<List<Formation>> getAllFormations() {
        List<Formation> formations = formationService.getAllFormations();
        return new ResponseEntity<>(formations, HttpStatus.OK);
    }

    // ✅ GET - Formation par ID
    @GetMapping("/{id}")
    public ResponseEntity<Formation> getFormationById(@PathVariable Long id) {
        Formation formation = formationService.getFormationById(id);
        if (formation != null) {
            return new ResponseEntity<>(formation, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ✅ DELETE - Suppression normale (avec vérification)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFormation(@PathVariable Long id) {
        try {
            Formation formation = formationService.getFormationById(id);
            if (formation == null) {
                return new ResponseEntity<>("Formation non trouvée", HttpStatus.NOT_FOUND);
            }

            long count = inscriptionRepository.countByFormationId(id);
            if (count > 0) {
                return new ResponseEntity<>(
                        "Cette formation a " + count + " inscription(s) associée(s)",
                        HttpStatus.CONFLICT
                );
            }

            formationService.deleteFormation(id);
            return new ResponseEntity<>("Formation supprimée avec succès", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Erreur: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ GET - Compter les inscriptions
    @GetMapping("/{id}/inscriptions/count")
    public ResponseEntity<Long> getInscriptionsCount(@PathVariable Long id) {
        try {
            long count = inscriptionRepository.countByFormationId(id);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(0L, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ GET - Vérifier si une formation a des inscriptions
    @GetMapping("/{id}/hasInscriptions")
    public ResponseEntity<Boolean> hasInscriptions(@PathVariable Long id) {
        try {
            long count = inscriptionRepository.countByFormationId(id);
            return new ResponseEntity<>(count > 0, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ DELETE FORCÉE - Suppression avec toutes les dépendances
    @DeleteMapping("/{id}/force")
    @Transactional
    public ResponseEntity<String> deleteFormationForce(@PathVariable Long id) {
        try {
            // 1. Vérifier si la formation existe
            Formation formation = formationService.getFormationById(id);
            if (formation == null) {
                return new ResponseEntity<>("Formation non trouvée", HttpStatus.NOT_FOUND);
            }

            // 2. Compter les inscriptions avant suppression
            long countInscriptions = inscriptionRepository.countByFormationId(id);

            // 3. SUPPRIMER LES PRÉDICTIONS (table formations_predictions)
            List<FormationPrediction> predictions = predictionRepository.findByFormationId(id);
            if (!predictions.isEmpty()) {
                predictionRepository.deleteAll(predictions);
                System.out.println("📊 " + predictions.size() + " prédiction(s) supprimée(s)");
            }

            // 4. SUPPRIMER LES INSCRIPTIONS (table inscriptions)
            List<Inscription> inscriptions = inscriptionRepository.findByFormationId(id);
            if (!inscriptions.isEmpty()) {
                inscriptionRepository.deleteAll(inscriptions);
                System.out.println("📊 " + inscriptions.size() + " inscription(s) supprimée(s)");
            }

            // 5. SUPPRIMER LES TECHNOLOGIES ASSOCIÉES
            if (formation.getTechnologies() != null) {
                formation.getTechnologies().clear();
            }

            // 6. SUPPRIMER LA FORMATION
            formationService.deleteFormation(id);

            // 7. Message de succès
            String message;
            if (countInscriptions > 0 && !predictions.isEmpty()) {
                message = "✅ Formation, ses " + countInscriptions + " inscription(s) et ses "
                        + predictions.size() + " prédiction(s) supprimées avec succès";
            } else if (countInscriptions > 0) {
                message = "✅ Formation et ses " + countInscriptions + " inscription(s) supprimées avec succès";
            } else if (!predictions.isEmpty()) {
                message = "✅ Formation et ses " + predictions.size() + " prédiction(s) supprimées avec succès";
            } else {
                message = "✅ Formation supprimée avec succès";
            }

            System.out.println(message);
            return new ResponseEntity<>(message, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("❌ Erreur: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ GET - Toutes les catégories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = formationService.getAllFormations()
                .stream()
                .map(Formation::getCategorie)
                .distinct()
                .collect(Collectors.toList());
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }
}