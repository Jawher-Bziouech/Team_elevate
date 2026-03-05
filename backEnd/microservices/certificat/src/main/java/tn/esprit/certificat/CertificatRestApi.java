package tn.esprit.certificat;

import org.springframework.web.bind.annotation.*;
import java.util.List;
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
}