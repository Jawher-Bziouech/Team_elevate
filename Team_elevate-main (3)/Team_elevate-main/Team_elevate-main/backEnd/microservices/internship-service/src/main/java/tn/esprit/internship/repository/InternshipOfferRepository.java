package tn.esprit.internship.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.internship.model.InternshipOffer;

@Repository
public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {
    List<InternshipOffer> findByCompanyUserId(Long companyUserId);

    List<InternshipOffer> findByActiveTrueAndEndDateBeforeOrActiveTrueAndExpiryDateBefore(LocalDate endDate, LocalDate expiryDate);
}
