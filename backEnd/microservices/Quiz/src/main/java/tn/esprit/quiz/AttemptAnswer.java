package tn.esprit.quiz;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AttemptAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long questionId;
    private Long selectedAnswerId;
    private Boolean correct;

    @ManyToOne
    @JoinColumn(name = "quiz_attempt_id")
    @JsonBackReference
    private QuizAttempt quizAttempt;
}
