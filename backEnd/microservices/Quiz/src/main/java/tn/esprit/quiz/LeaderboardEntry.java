package tn.esprit.quiz;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LeaderboardEntry {
    private Long userId;
    private String username;
    private Integer totalCredits;
    private Integer totalAttempts;
    private Integer totalPassed;
    private Double averageScore;
    private Integer currentStreak;
    private Integer bestStreak;
}
