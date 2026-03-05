package tn.esprit.quiz.Controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.quiz.DTOs.QuizResultResponse;
import tn.esprit.quiz.DTOs.QuizSubmissionRequest;
import tn.esprit.quiz.Entities.LeaderboardEntry;
import tn.esprit.quiz.Entities.QuizAttempt;
import tn.esprit.quiz.Entities.UserBadge;
import tn.esprit.quiz.Entities.UserProgression;
import tn.esprit.quiz.Services.GamificationService;
import java.util.List;

/**
 * REST API Controller for gamification features.
 * Handles quiz submissions, user progression tracking, badges, and leaderboards.
 * Routes: /quiz/gamification
 */
@RestController
@RequestMapping("/quiz/gamification")
public class GamificationRestApi {

    private final GamificationService gamificationService;

    public GamificationRestApi(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    /**
     * Submit a completed quiz for grading and gamification processing.
     * @param request Quiz submission with user answers and time taken
     * @return Quiz result with score, pass/fail, credits earned, and new badges
     */
    @PostMapping("/submit")
    public QuizResultResponse submitQuiz(@RequestBody QuizSubmissionRequest request) {
        return gamificationService.submitQuiz(request);
    }

    /**
     * Get all quiz attempts for a user (ordered by most recent first).
     * @param userId User ID
     * @return List of quiz attempts
     */
    @GetMapping("/attempts/user/{userId}")
    public List<QuizAttempt> getUserAttempts(@PathVariable Long userId) {
        return gamificationService.getUserAttempts(userId);
    }

    /**
     * Get all attempts for a specific user on a specific quiz.
     * @param userId User ID
     * @param quizId Quiz ID
     * @return List of attempts on this quiz
     */
    @GetMapping("/attempts/user/{userId}/quiz/{quizId}")
    public List<QuizAttempt> getUserQuizAttempts(@PathVariable Long userId, @PathVariable Long quizId) {
        return gamificationService.getUserQuizAttempts(userId, quizId);
    }

    /**
     * Get user's overall progression statistics (credits, attempts, average score, streaks).
     * @param userId User ID
     * @return User progression data or null if not found
     */
    @GetMapping("/progression/{userId}")
    public UserProgression getUserProgression(@PathVariable Long userId) {
        return gamificationService.getUserProgression(userId);
    }

    /**
     * Get all badges earned by a user.
     * @param userId User ID
     * @return List of earned badges
     */
    @GetMapping("/badges/{userId}")
    public List<UserBadge> getUserBadges(@PathVariable Long userId) {
        return gamificationService.getUserBadges(userId);
    }

    /**
     * Get global leaderboard sorted by total credits (top performers first).
     * @return List of leaderboard entries with user names and stats
     */
    @GetMapping("/leaderboard")
    public List<LeaderboardEntry> getLeaderboard() {
        return gamificationService.getLeaderboard();
    }
}
