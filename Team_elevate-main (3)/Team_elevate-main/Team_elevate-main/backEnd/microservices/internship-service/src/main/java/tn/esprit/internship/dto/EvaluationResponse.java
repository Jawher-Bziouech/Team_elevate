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
public class EvaluationResponse {

    private Long id;
    private Long internshipApplicationId;
    private Integer grade;
    private String comment;
    private LocalDateTime evaluationDate;
}

