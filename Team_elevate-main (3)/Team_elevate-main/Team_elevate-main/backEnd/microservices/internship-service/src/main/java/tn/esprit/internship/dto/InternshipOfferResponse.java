package tn.esprit.internship.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipOfferResponse {

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
    private String companyName;
    private LocalDate publishDate;
    private LocalDate expiryDate;
    private boolean active;
}
