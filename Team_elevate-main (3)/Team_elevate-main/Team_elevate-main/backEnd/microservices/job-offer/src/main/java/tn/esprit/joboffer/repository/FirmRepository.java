package tn.esprit.joboffer.repository;

import tn.esprit.joboffer.entity.Firm;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FirmRepository extends JpaRepository<Firm, Long> {
    // You can add custom query methods later, e.g., findByNom(String nom)
}