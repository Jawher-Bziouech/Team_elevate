package tn.esprit.internship.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipOfferRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String requiredSkills;

    @NotBlank
    private String requiredStudyLevel;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotBlank
    private String location;

    private String remuneration;

    @NotBlank
    private String supervisorName;

    @NotNull
    private LocalDate expiryDate;

    private Boolean active;
}
