package tn.esprit.entreprise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.entreprise.entity.ContactAccessLog;

import java.util.List;

public interface ContactAccessLogRepository extends JpaRepository<ContactAccessLog, Long> {
    List<ContactAccessLog> findByEntrepriseIdOrderByAccessedAtDesc(Long entrepriseId);
}
