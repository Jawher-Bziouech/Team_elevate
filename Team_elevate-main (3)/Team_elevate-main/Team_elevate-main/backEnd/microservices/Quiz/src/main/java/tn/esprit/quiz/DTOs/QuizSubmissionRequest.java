package tn.esprit.quiz.DTOs;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuizSubmissionRequest {
    private Long userId;
    private Long quizId;
    private Integer timeTakenSeconds;
    private List<QuestionAnswerDTO> answers;
}
