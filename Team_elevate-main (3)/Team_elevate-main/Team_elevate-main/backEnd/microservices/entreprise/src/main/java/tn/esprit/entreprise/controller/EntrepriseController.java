package tn.esprit.entreprise.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.entreprise.dto.EntrepriseResponseDTO;
import tn.esprit.entreprise.entity.ContactAccessLog;
import tn.esprit.entreprise.entity.Entreprise;
import tn.esprit.entreprise.service.EntrepriseService;

import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseController {

    @Autowired
    private EntrepriseService entrepriseService;

    @GetMapping
    public List<Entreprise> getAll() {
        return entrepriseService.getAll();
    }

    @GetMapping("/approved")
    public List<Entreprise> getApproved() {
        return entrepriseService.getApprovedEntreprises();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entreprise> getById(@PathVariable Long id) {
        return entrepriseService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Entreprise create(@Valid @RequestBody Entreprise entreprise) {
        return entrepriseService.create(entreprise);
    }

    @PutMapping("/{id}")
    public Entreprise update(@PathVariable Long id, @Valid @RequestBody Entreprise entreprise) {
        return entrepriseService.update(id, entreprise);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entrepriseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<Entreprise> search(@RequestParam(required = false) String nom,
                                   @RequestParam(required = false) String secteur) {
        return entrepriseService.searchEntreprises(nom, secteur);
    }

    @GetMapping("/secteur/{secteur}")
    public List<Entreprise> getBySecteur(@PathVariable String secteur) {
        return entrepriseService.getEntreprisesBySecteur(secteur);
    }

    @PutMapping("/{id}/status")
    public Entreprise updateStatus(@PathVariable Long id, @RequestParam String status) {
        return entrepriseService.updateStatus(id, status);
    }

    @GetMapping("/secteurs")
    public List<String> getSecteurs() {
        return entrepriseService.getDistinctSecteurs();
    }

    // Plan-aware public endpoints — called by the frontend with role & plan from JWT
    @GetMapping("/approved/public")
    public List<EntrepriseResponseDTO> getApprovedPublic(
            @RequestParam(defaultValue = "TRAINEE") String role,
            @RequestParam(defaultValue = "FREE")    String plan) {
        return entrepriseService.getApprovedForPlan(role, plan);
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<EntrepriseResponseDTO> getByIdView(
            @PathVariable Long id,
            @RequestParam(defaultValue = "TRAINEE") String role,
            @RequestParam(defaultValue = "FREE")    String plan,
            @RequestParam(required = false)         Long userId,
            @RequestParam(required = false)         String username) {
        return ResponseEntity.ok(entrepriseService.getByIdForPlan(id, role, plan, userId, username));
    }

    // Access log — who viewed this company's contact info
    @GetMapping("/{id}/access-logs")
    public List<ContactAccessLog> getAccessLogs(@PathVariable Long id) {
        return entrepriseService.getAccessLogs(id);
    }
}
