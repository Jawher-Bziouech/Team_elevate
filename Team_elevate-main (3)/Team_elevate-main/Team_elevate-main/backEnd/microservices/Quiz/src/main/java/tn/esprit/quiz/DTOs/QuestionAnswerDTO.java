package tn.esprit.quiz.DTOs;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuestionAnswerDTO {
    private Long questionId;
    private Long selectedAnswerId;
}
