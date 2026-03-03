package tn.esprit.quiz;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuestionAnswerDTO {
    private Long questionId;
    private Long selectedAnswerId;
}
