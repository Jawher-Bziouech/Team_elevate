package tn.esprit.joboffer.repository;

import tn.esprit.joboffer.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    // Find by firm name (case‑insensitive)
    List<JobOffer> findByFirmNomIgnoreCase(String firmName);

    // Find by industry (case‑insensitive)
    List<JobOffer> findByIndustryIgnoreCase(String industry);

    // Find by location (case‑insensitive)
    List<JobOffer> findByLocationIgnoreCase(String location);

    // Custom query for salary range (format "min-max")
    @Query("SELECT j FROM JobOffer j WHERE " +
            "CAST(SUBSTRING(j.salaryRange, 1, LOCATE('-', j.salaryRange)-1) AS integer) >= :minSalary AND " +
            "CAST(SUBSTRING(j.salaryRange, LOCATE('-', j.salaryRange)+1) AS integer) <= :maxSalary")
    List<JobOffer> findBySalaryRangeBetween(@Param("minSalary") String minSalary, @Param("maxSalary") String maxSalary);

    // Combined search with optional parameters (case‑insensitive partial matching)
    @Query("SELECT j FROM JobOffer j WHERE "
            + "(:company IS NULL OR LOWER(j.firm.nom) LIKE LOWER(CONCAT('%', :company, '%'))) AND "
            + "(:industry IS NULL OR LOWER(j.industry) LIKE LOWER(CONCAT('%', :industry, '%'))) AND "
            + "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND "
            + "(:minSalary IS NULL OR CAST(SUBSTRING(j.salaryRange, 1, LOCATE('-', j.salaryRange)-1) AS integer) >= :minSalary) AND "
            + "(:maxSalary IS NULL OR CAST(SUBSTRING(j.salaryRange, LOCATE('-', j.salaryRange)+1) AS integer) <= :maxSalary)")
    List<JobOffer> searchAll(@Param("company") String company,
                             @Param("industry") String industry,
                             @Param("location") String location,
                             @Param("minSalary") Integer minSalary,
                             @Param("maxSalary") Integer maxSalary);
}