package tn.esprit.internship.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.internship.dto.ParsedResumeDTO;
import tn.esprit.internship.service.ResumeParserService;

@RestController
@RequestMapping("/api/internships/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeParserService resumeParserService;

    @PostMapping(value = "/parse", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> parseResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }
        try {
            ParsedResumeDTO parsedData = resumeParserService.parseResume(file);
            return ResponseEntity.ok(parsedData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error parsing resume: " + e.getMessage());
        }
    }
}
