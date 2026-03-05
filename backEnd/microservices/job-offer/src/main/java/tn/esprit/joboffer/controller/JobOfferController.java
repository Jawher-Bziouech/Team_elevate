package tn.esprit.joboffer.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.joboffer.dto.IndustryCountDto;
import tn.esprit.joboffer.dto.JobOfferRequest;
import tn.esprit.joboffer.dto.JobOfferResponse;
import tn.esprit.joboffer.service.JobOfferService;
import java.util.List;

@RestController
@RequestMapping("/api/joboffers")
public class JobOfferController {

    private final JobOfferService service;

    public JobOfferController(JobOfferService service) {
        this.service = service;
    }

    // CRUD endpoints
    @GetMapping
    public List<JobOfferResponse> getAllJobOffers() {
        return service.getAllJobOffers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferResponse> getJobOfferById(@PathVariable Long id) {
        return service.getJobOfferById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<JobOfferResponse> createJobOffer(@Valid @RequestBody JobOfferRequest request) {
        JobOfferResponse created = service.createJobOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferResponse> updateJobOffer(@PathVariable Long id, @Valid @RequestBody JobOfferRequest request) {
        JobOfferResponse updated = service.updateJobOffer(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        service.deleteJobOffer(id);
        return ResponseEntity.noContent().build();
    }

    // Advanced search endpoints
    @GetMapping("/search/byCompany")
    public List<JobOfferResponse> getJobOffersByCompany(@RequestParam String company) {
        return service.getJobOffersByCompany(company);
    }

    @GetMapping("/search/byIndustry")
    public List<JobOfferResponse> getJobOffersByIndustry(@RequestParam String industry) {
        return service.getJobOffersByIndustry(industry);
    }

    @GetMapping("/search/byLocation")
    public List<JobOfferResponse> getJobOffersByLocation(@RequestParam String location) {
        return service.getJobOffersByLocation(location);
    }

    @GetMapping("/search/bySalaryRange")
    public List<JobOfferResponse> getJobOffersBySalaryRange(
            @RequestParam String min,
            @RequestParam String max) {
        return service.getJobOffersBySalaryRange(min, max);
    }

    // Combined search with multiple optional parameters
    @GetMapping("/search/all")
    public List<JobOfferResponse> searchAll(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) Integer maxSalary) {
        return service.searchJobOffers(company, industry, location, minSalary, maxSalary);
    }

    // NEW: Get job offer counts by industry
    @GetMapping("/stats/byIndustry")
    public List<IndustryCountDto> getJobCountByIndustry() {
        return service.getJobCountByIndustry();
    }
}