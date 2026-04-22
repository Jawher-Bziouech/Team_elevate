package tn.esprit.internship.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.internship.dto.EvaluationRequest;
import tn.esprit.internship.dto.InternshipAdminStatsResponse;
import tn.esprit.internship.dto.InternshipApplicationRequest;
import tn.esprit.internship.dto.InternshipOfferRequest;
import tn.esprit.internship.model.Evaluation;
import tn.esprit.internship.model.InternshipApplication;
import tn.esprit.internship.model.InternshipOffer;
import tn.esprit.internship.repository.EvaluationRepository;
import tn.esprit.internship.service.InternshipService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InternshipController {

    private final InternshipService internshipService;
    private final EvaluationRepository evaluationRepository;

    @GetMapping("/internships")
    public List<InternshipOffer> getPublicInternships() {
        return internshipService.getPublicOffers();
    }

    @GetMapping("/internships/{id}")
    public InternshipOffer getInternshipById(@PathVariable Long id) {
        return internshipService.getOfferById(id);
    }

    @PostMapping("/internships")
    public ResponseEntity<InternshipOffer> createOffer(@Valid @RequestBody InternshipOfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internshipService.createOffer(request, getAuthenticatedUserId()));
    }

    @PutMapping("/internships/{id}")
    public InternshipOffer updateOffer(@PathVariable Long id, @Valid @RequestBody InternshipOfferRequest request) {
        return internshipService.updateOffer(id, request, getAuthenticatedUserId());
    }

    @DeleteMapping("/internships/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        internshipService.deleteOffer(id, getAuthenticatedUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/internships/{id}/apply")
    public ResponseEntity<InternshipApplication> applyToOffer(@PathVariable Long id, @Valid @RequestBody InternshipApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internshipService.applyToOffer(id, request, getAuthenticatedUserId()));
    }

    @GetMapping("/internship-applications/my")
    public List<InternshipApplication> getMyApplications() {
        return internshipService.getMyApplications(getAuthenticatedUserId());
    }

    @GetMapping("/internships/my-offers")
    public List<InternshipOffer> getMyOffers() {
        return internshipService.getMyOffers(getAuthenticatedUserId());
    }

    @GetMapping("/internships/{id}/applications")
    public List<InternshipApplication> getApplicationsByOffer(@PathVariable Long id) {
        return internshipService.getApplicationsByOffer(id, getAuthenticatedUserId());
    }

    @PutMapping("/internship-applications/{id}/accept-company")
    public InternshipApplication acceptByCompany(@PathVariable Long id) {
        return internshipService.acceptByCompany(id, getAuthenticatedUserId());
    }

    @PutMapping("/internship-applications/{id}/reject")
    public InternshipApplication rejectByCompany(@PathVariable Long id) {
        return internshipService.rejectByCompany(id, getAuthenticatedUserId());
    }

    @PostMapping("/internship-applications/{id}/evaluate")
    public ResponseEntity<Evaluation> evaluateApplication(@PathVariable Long id, @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internshipService.submitEvaluation(id, request, getAuthenticatedUserId()));
    }

    @GetMapping("/admin/internship-applications")
    public List<InternshipApplication> getAllApplicationsForAdmin() {
        return internshipService.getAllApplicationsForAdmin();
    }

    @GetMapping("/admin/internships")
    public List<InternshipOffer> getAllOffersForAdmin() {
        return internshipService.getAllOffersForAdmin();
    }

    @GetMapping("/admin/stats/internships")
    public InternshipAdminStatsResponse getAdminInternshipStats() {
        return internshipService.getAdminInternshipStats();
    }

    @PutMapping("/admin/internships/{id}")
    public InternshipOffer updateOfferAdmin(@PathVariable Long id, @Valid @RequestBody InternshipOfferRequest request) {
        return internshipService.updateOffer(id, request, getAuthenticatedUserId(), true);
    }

    @DeleteMapping("/admin/internships/{id}")
    public ResponseEntity<Void> deleteOfferAdmin(@PathVariable Long id) {
        internshipService.deleteOffer(id, getAuthenticatedUserId(), true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/expire-internships")
    public ResponseEntity<String> manualExpireInternships() {
        int count = internshipService.deleteExpiredOffers();
        return ResponseEntity.ok("Successfully permanently deleted " + count + " expired internship offers.");
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Missing authentication context.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof Integer userId) {
            return userId.longValue();
        }
        if (principal instanceof String userIdAsText) {
            try {
                return Long.parseLong(userIdAsText);
            } catch (NumberFormatException ignored) {}
        }

        throw new AccessDeniedException("Authenticated user id is missing from JWT.");
    }
}
