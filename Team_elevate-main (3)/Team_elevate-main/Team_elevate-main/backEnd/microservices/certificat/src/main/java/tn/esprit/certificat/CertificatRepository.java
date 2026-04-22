package tn.esprit.certificat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificatRepository extends JpaRepository<Certificat, Long> {
    List<Certificat> findByUserId(Long userId);

    // NEW: Find certificates by status (PENDING, APPROVED, REJECTED)
    List<Certificat> findByStatus(String status);

    // NEW: Find certificates by user AND status
    List<Certificat> findByUserIdAndStatus(Long userId, String status);
    // NEW: Used for public verification via QR Code
    Optional<Certificat> findByCredentialId(String credentialId);
}