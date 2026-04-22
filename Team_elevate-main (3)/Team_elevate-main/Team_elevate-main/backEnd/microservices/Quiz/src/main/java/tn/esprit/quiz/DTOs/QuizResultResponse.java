package tn.esprit.quiz.DTOs;

import lombok.*;
import tn.esprit.quiz.Entities.BadgeType;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuizResultResponse {
    private Double score;
    private Boolean passed;
    private Integer creditsEarned;
    private List<BadgeType> newBadges;
    private Long attemptId;
}
