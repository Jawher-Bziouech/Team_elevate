package tn.esprit.quiz.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long quizId;
    private Double score;
    private Integer timeTakenSeconds;
    private Integer allowedTimeSeconds;
    private Integer creditsEarned;
    private Boolean passed;
    private LocalDateTime attemptDate;

    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL)
    private List<AttemptAnswer> attemptAnswers;

    @PrePersist
    protected void onCreate() {
        attemptDate = LocalDateTime.now();
    }
}
