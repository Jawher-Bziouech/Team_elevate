package tn.esprit.joboffer.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.joboffer.entity.Application;
import tn.esprit.joboffer.repository.ApplicationRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final String uploadDir = "uploads/cv";

    public ApplicationController(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> apply(
            @RequestParam("jobOfferId") Long jobOfferId,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            @RequestParam("cvFile") MultipartFile cvFile
    ) {
        try {
            // Save file
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = cvFile.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storedFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(cvFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save application to DB
            Application application = new Application();
            application.setJobOfferId(jobOfferId);
            application.setFullName(fullName);
            application.setEmail(email);
            application.setPhone(phone);
            application.setCoverLetter(coverLetter);
            application.setCvFilePath(filePath.toString());

            Application saved = applicationRepository.save(application);

            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("message", "Application submitted successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload CV file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/job/{jobOfferId}")
    public ResponseEntity<?> getByJobOffer(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(applicationRepository.findByJobOfferId(jobOfferId));
    }

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @GetMapping("/cv/{id}")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) {
        try {
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            if (app.getCvFilePath() == null || app.getCvFilePath().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(app.getCvFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
