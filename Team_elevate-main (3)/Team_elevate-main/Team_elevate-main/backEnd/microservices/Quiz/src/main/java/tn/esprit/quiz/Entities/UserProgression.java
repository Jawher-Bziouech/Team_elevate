package tn.esprit.quiz.Entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserProgression {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long userId;

    private Integer totalCredits = 0;
    private Integer totalAttempts = 0;
    private Integer totalPassed = 0;
    private Double averageScore = 0.0;
    private Integer currentStreak = 0;
    private Integer bestStreak = 0;
    private Integer consecutivePassCount = 0;
}
