package tn.esprit.internship.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "internship_offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String requiredSkills;
    private String requiredStudyLevel;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String remuneration;
    private String supervisorName;
    private Long companyUserId;
    private LocalDate publishDate;
    private LocalDate expiryDate;

    @Builder.Default
    private boolean active = true;
}
