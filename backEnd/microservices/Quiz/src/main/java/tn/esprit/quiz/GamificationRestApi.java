package tn.esprit.quiz;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/quiz/gamification")
public class GamificationRestApi {

    private final GamificationService gamificationService;

    public GamificationRestApi(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @PostMapping("/submit")
    public QuizResultResponse submitQuiz(@RequestBody QuizSubmissionRequest request) {
        return gamificationService.submitQuiz(request);
    }

    @GetMapping("/attempts/user/{userId}")
    public List<QuizAttempt> getUserAttempts(@PathVariable Long userId) {
        return gamificationService.getUserAttempts(userId);
    }

    @GetMapping("/attempts/user/{userId}/quiz/{quizId}")
    public List<QuizAttempt> getUserQuizAttempts(@PathVariable Long userId, @PathVariable Long quizId) {
        return gamificationService.getUserQuizAttempts(userId, quizId);
    }

    @GetMapping("/progression/{userId}")
    public UserProgression getUserProgression(@PathVariable Long userId) {
        return gamificationService.getUserProgression(userId);
    }

    @GetMapping("/badges/{userId}")
    public List<UserBadge> getUserBadges(@PathVariable Long userId) {
        return gamificationService.getUserBadges(userId);
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntry> getLeaderboard() {
        return gamificationService.getLeaderboard();
    }
}
