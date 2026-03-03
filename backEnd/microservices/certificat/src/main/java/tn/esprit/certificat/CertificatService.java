package tn.esprit.certificat;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CertificatService {

    private final CertificatRepository repository;
    private final UserClient userClient;   // NEW: Feign client

    public CertificatService(CertificatRepository repository, UserClient userClient) {
        this.repository = repository;
        this.userClient = userClient;      // NEW: injected via constructor
    }

    public List<Certificat> getAllCertificats() {
        return repository.findAll();
    }

    public Optional<Certificat> getCertificatById(Long id) {
        return repository.findById(id);
    }

    public List<Certificat> getCertificatsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public Certificat saveCertificat(Certificat certificat) {
        return repository.save(certificat);
    }

    public void deleteCertificat(Long id) {
        repository.deleteById(id);
    }

    public List<Certificat> getCertificatsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<Certificat> getCertificatsByUserIdAndStatus(Long userId, String status) {
        return repository.findByUserIdAndStatus(userId, status);
    }

    public Certificat approveCertificat(Long id) {
        Certificat cert = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificat not found with id: " + id));
        cert.setStatus("APPROVED");
        return repository.save(cert);
    }

    public Certificat rejectCertificat(Long id) {
        Certificat cert = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificat not found with id: " + id));
        cert.setStatus("REJECTED");
        return repository.save(cert);
    }

    // NEW: Get user info via OpenFeign
    public UserDTO getUserForCertificat(Long userId) {
        return userClient.getUserById(userId);
    }
}