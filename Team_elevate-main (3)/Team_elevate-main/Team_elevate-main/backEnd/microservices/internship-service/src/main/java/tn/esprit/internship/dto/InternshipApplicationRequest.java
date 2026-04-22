package tn.esprit.internship.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplicationRequest {

    private Long studentUserId;

    @NotBlank
    private String cvData;

    @NotBlank
    private String cvFileName;

    @NotBlank
    private String motivationLetter;
}
