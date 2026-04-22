package tn.esprit.certificat;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CertificatService {

    private final CertificatRepository repository;
    private final UserClient userClient;
    private final ForumClient forumClient;
// NEW: Feign client

    public CertificatService(CertificatRepository repository, UserClient userClient, ForumClient forumClient) {
        this.repository = repository;
        this.userClient = userClient;      // NEW: injected via constructor
        this.forumClient = forumClient;
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
    // NEW: Get certificate by credential ID for public verification
    // ORIGINAL METHOD: Get user info via OpenFeign (Needed for Emails & API)
    public UserDTO getUserForCertificat(Long userId) {
        return userClient.getUserById(userId);
    }
    // NEW METHOD: Get certificate by credential ID (Needed for QR Code)
    public Optional<Certificat> getCertificatByCredentialId(String credentialId) {
        return repository.findByCredentialId(credentialId);
    }
    public void shareToForum(Long certificatId, Long userId) {
        Certificat cert = repository.findById(certificatId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        PostDTO postPayload = new PostDTO();
        postPayload.setTitle("🏆 I just earned a new Certification!");
        String verificationUrl = "http://localhost:4200/verify?id=" + cert.getCredentialId();
        postPayload.setContent(
                "I am thrilled to announce that I successfully earned my **" + cert.getNom() + "** certification from " + cert.getIssuer() + "! 🎓🎉<br><br>" +
                        "<a href='" + verificationUrl + "' target='_blank' style='color: #0d6efd; font-weight: bold; text-decoration: underline;'>🔍 check it out !</a>"
        );        postPayload.setAuthorId(userId);
        postPayload.setTopic("Achievements");

        try {
            // NEW: Manually convert the Object into a JSON String!
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String jsonString = mapper.writeValueAsString(postPayload);

            // Send the raw JSON String!
            forumClient.createForumPost(jsonString);

        } catch (Exception e) {
            System.err.println("Failed to serialize or send post: " + e.getMessage());
        }
    }


}