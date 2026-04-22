package tn.esprit.internship.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.internship.model.InternshipApplication;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {

    List<InternshipApplication> findByInternshipOfferId(Long internshipOfferId);

    boolean existsByInternshipOfferIdAndStudentUserId(Long internshipOfferId, Long studentUserId);

    void deleteByInternshipOfferId(Long internshipOfferId);

    void deleteByInternshipOfferIdIn(List<Long> internshipOfferIds);
}
