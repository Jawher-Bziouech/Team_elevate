package tn.esprit.certificat;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
@RefreshScope
@RestController
@RequestMapping("/certificats")
public class CertificatRestApi {


    @Value("${welcome.message}")
    private String welcomeMessage;
    private final CertificatService service;

    // Professional standard: Constructor injection
    public CertificatRestApi(CertificatService service) {
        this.service = service;
    }

    @GetMapping
    public List<Certificat> getAllCertificats() {
        return service.getAllCertificats();
    }

    @GetMapping("/{id}")
    public Certificat getCertificatById(@PathVariable Long id) {
        return service.getCertificatById(id)
                .orElseThrow(() -> new RuntimeException("Certificat not found with id: " + id));
    }

    @GetMapping("/user/{userId}")
    public List<Certificat> getCertificatsByUserId(@PathVariable Long userId) {
        return service.getCertificatsByUserId(userId);
    }

    @PostMapping
    public Certificat createCertificat(@RequestBody Certificat certificat) {
        // NEW: Default status to PENDING when a user submits a request
        if (certificat.getStatus() == null) {
            certificat.setStatus("PENDING");
        }
        return service.saveCertificat(certificat);
    }

    @PutMapping("/{id}")
    public Certificat updateCertificat(@PathVariable Long id, @RequestBody Certificat certificat) {
        certificat.setId(id);
        return service.saveCertificat(certificat);
    }

    @DeleteMapping("/{id}")
    public void deleteCertificat(@PathVariable Long id) {
        service.deleteCertificat(id);
    }

    // ===== NEW ENDPOINTS =====

    // Filter by status (PENDING, APPROVED, REJECTED)
    @GetMapping("/status/{status}")
    public List<Certificat> getCertificatsByStatus(@PathVariable String status) {
        return service.getCertificatsByStatus(status);
    }

    // Approve a certificate request
    @PutMapping("/{id}/approve")
    public Certificat approveCertificat(@PathVariable Long id) {
        return service.approveCertificat(id);
    }

    // Reject a certificate request
    @PutMapping("/{id}/reject")
    public Certificat rejectCertificat(@PathVariable Long id) {
        return service.rejectCertificat(id);
    }

    @GetMapping("/hello")
    public String hello() {
        return "hello! this is the professionally structured certificat microservice!";
    }
    // NEW: Get user info for a certificate via OpenFeign
    @GetMapping("/{id}/user")
    public UserDTO getUserForCertificat(@PathVariable Long id) {
        Certificat cert = service.getCertificatById(id)
                .orElseThrow(() -> new RuntimeException("Certificat not found"));
        return service.getUserForCertificat(cert.getUserId());
    }
    // Get user info by userId (via OpenFeign)
    @GetMapping("/user-info/{userId}")
    public UserDTO getUserInfo(@PathVariable Long userId) {
        return service.getUserForCertificat(userId);
    }
    // DEBUG: temporary endpoint to see the actual Feign error
    @GetMapping("/debug-feign/{userId}")
    public String debugFeign(@PathVariable Long userId) {
        try {
            UserDTO user = service.getUserForCertificat(userId);
            return "SUCCESS: " + user.getUsername() + " / " + user.getEmail() + " / " + user.getRole();
        } catch (Exception e) {
            return "ERROR: " + e.getClass().getName() + " -> " + e.getMessage();
        }
    }
    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }
    @GetMapping("/verify/{credentialId}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String credentialId) {
        Optional<Certificat> certOpt = service.getCertificatByCredentialId(credentialId);
        if (certOpt.isPresent() && "APPROVED".equals(certOpt.get().getStatus())) {
            Certificat cert = certOpt.get();
            String holderName = "Student #" + cert.getUserId(); // Default fallback

            // Fetch the real username across the microservice!
            try {
                UserDTO user = service.getUserForCertificat(cert.getUserId());
                if (user != null && user.getUsername() != null) {
                    holderName = user.getUsername();
                }
            } catch (Exception e) {
                // Ignore microservice timeout/errors and just send the default ID
            }
            // Pack the certificate and the name together
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("certificate", cert);
            responseData.put("holderName", holderName);
            return ResponseEntity.ok(responseData);
        }
        return ResponseEntity.status(404).body("Invalid or Expired Certificate");
    }
    @PostMapping("/{id}/shareToForum")
    public void shareCertificateToForum(@PathVariable Long id, @RequestParam Long userId) {
        service.shareToForum(id, userId);
    }
    @PostMapping("/test-scheduler-data")
    public String createTestData() {
        // 1. Target for EXPIRING_SOON (Issued approx 710 days ago)
        Certificat soon = new Certificat();
        soon.setNom("Azure Cloud Expert");
        soon.setIssuer("Microsoft");
        soon.setDate(java.time.LocalDate.now().minusDays(710).toString());
        soon.setStatus("APPROVED");
        soon.setUserId(2L); // Targeted to User 2
        soon.setCredentialId(java.util.UUID.randomUUID().toString());
        service.saveCertificat(soon);

        // 2. Target for AUTO-EXPIRE (Issued 3 years ago)
        Certificat old = new Certificat();
        old.setNom("Legacy Java 8");
        old.setIssuer("Oracle");
        old.setDate(java.time.LocalDate.now().minusYears(3).toString());
        old.setStatus("APPROVED");
        old.setUserId(2L); // Targeted to User 2
        old.setCredentialId(java.util.UUID.randomUUID().toString());
        service.saveCertificat(old);

        return "Test data created for User 2! Watch your console logs for the scheduler.";
    }

}