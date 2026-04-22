package tn.esprit.joboffer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.joboffer.entity.Application;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobOfferId(Long jobOfferId);
    List<Application> findByEmail(String email);
}
