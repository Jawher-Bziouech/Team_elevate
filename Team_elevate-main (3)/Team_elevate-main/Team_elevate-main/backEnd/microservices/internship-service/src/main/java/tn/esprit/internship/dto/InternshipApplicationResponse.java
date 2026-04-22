package tn.esprit.internship.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplicationResponse {

    private Long id;
    private Long internshipOfferId;
    private Long studentUserId;
    private String studentName;
    private String cvFileName;
    private String motivationLetter;
    private LocalDateTime applicationDate;
    private String status;
    private Integer evaluationGrade;
}
