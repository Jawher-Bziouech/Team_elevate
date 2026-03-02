package tn.esprit.certificat;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/certificats")
public class CertificatRestApi {

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
        return service.saveCertificat(certificat);
    }

    @PutMapping("/{id}")
    public Certificat updateCertificat(@PathVariable Long id, @RequestBody Certificat certificat) {
        // Simple update logic: ensure ID matches
        certificat.setId(id);
        return service.saveCertificat(certificat);
    }

    @DeleteMapping("/{id}")
    public void deleteCertificat(@PathVariable Long id) {
        service.deleteCertificat(id);
    }

    @GetMapping("/hello")
    public String hello() {
        return "hello! this is the professionally structured certificat microservice!";
    }
}