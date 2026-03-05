package tn.esprit.quiz.Services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.quiz.Configuration.UserClient;
import tn.esprit.quiz.DTOs.QuestionAnswerDTO;
import tn.esprit.quiz.DTOs.QuizResultResponse;
import tn.esprit.quiz.DTOs.QuizSubmissionRequest;
import tn.esprit.quiz.DTOs.UserDTO;
import tn.esprit.quiz.Entities.*;
import tn.esprit.quiz.Repositories.QuizAttemptRepository;
import tn.esprit.quiz.Repositories.QuizRepository;
import tn.esprit.quiz.Repositories.UserBadgeRepository;
import tn.esprit.quiz.Repositories.UserProgressionRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for gamification features (quiz grading, badges, leaderboards).
 * Handles:
 * - Quiz submission and grading logic
 * - Credit calculation based on score and time efficiency
 * - User progression tracking (stats, streaks, consecutive passes)
 * - Badge evaluation and awarding
 * - Leaderboard generation
 *
 * Uses UserClient (Feign) to fetch user details from the User microservice.
 */
@Service
public class GamificationService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserProgressionRepository userProgressionRepository;
    private final UserClient userClient;

    public GamificationService(QuizRepository quizRepository,
                               QuizAttemptRepository quizAttemptRepository,
                               UserBadgeRepository userBadgeRepository,
                               UserProgressionRepository userProgressionRepository,
                               UserClient userClient) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userProgressionRepository = userProgressionRepository;
        this.userClient = userClient;
    }

    /**
     * Submit a completed quiz for grading and gamification processing.
     * Orchestrates: grading, credit calculation, progression update, badge evaluation.
     * @param request Quiz submission with user answers and time taken
     * @return QuizResultResponse containing score, pass/fail, credits, new badges, and attempt ID
     */
    @Transactional
    public QuizResultResponse submitQuiz(QuizSubmissionRequest request) {
        // Step 1: Validate quiz exists
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + request.getQuizId()));

        // ========== STEP 2: GRADE THE QUIZ ==========
        // Compare user answers with correct answers
        List<Question> questions = quiz.getQuestions();
        int totalQuestions = questions.size();
        int correctCount = 0;

        List<AttemptAnswer> attemptAnswers = new ArrayList<>();

        // Loop through each user answer
        for (QuestionAnswerDTO answerDTO : request.getAnswers()) {
            // Find the question by ID
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(answerDTO.getQuestionId()))
                    .findFirst()
                    .orElse(null);

            if (question == null) continue;  // Skip if question not found

            // Check if selected answer is marked as correct
            // anyMatch returns true if ANY answer matches the selectedAnswerId AND is marked correct
            boolean isCorrect = question.getAnswers().stream()
                    .anyMatch(a -> a.getId().equals(answerDTO.getSelectedAnswerId())
                            && Boolean.TRUE.equals(a.getIsCorrect()));

            // Count correct answers
            if (isCorrect) correctCount++;

            // Record the answer (for attempt history)
            AttemptAnswer attemptAnswer = new AttemptAnswer();
            attemptAnswer.setQuestionId(answerDTO.getQuestionId());
            attemptAnswer.setSelectedAnswerId(answerDTO.getSelectedAnswerId());
            attemptAnswer.setCorrect(isCorrect);
            attemptAnswers.add(attemptAnswer);
        }

        // ========== STEP 3: CALCULATE SCORE & CREDITS ==========
        // Calculate percentage: (correct / total) × 100
        double score = totalQuestions > 0 ? (correctCount * 100.0) / totalQuestions : 0.0;

        // Pass threshold is 50%
        boolean passed = score >= 50.0;

        // Convert quiz duration from minutes to seconds (default 10 min if null)
        int allowedTimeSeconds = (quiz.getDuration() != null ? quiz.getDuration() : 10) * 60;

        // Calculate credits based on score and time efficiency
        int credits = calculateCredits(score, request.getTimeTakenSeconds(), allowedTimeSeconds);

        // ========== STEP 4: SAVE QUIZ ATTEMPT ==========
        // Create attempt record to store in database
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(request.getUserId());
        attempt.setQuizId(request.getQuizId());
        attempt.setScore(score);
        attempt.setTimeTakenSeconds(request.getTimeTakenSeconds());
        attempt.setAllowedTimeSeconds(allowedTimeSeconds);
        attempt.setCreditsEarned(credits);
        attempt.setPassed(passed);
        attempt.setAttemptAnswers(attemptAnswers);

        // Set bidirectional relationship: each answer knows which attempt it belongs to
        attemptAnswers.forEach(a -> a.setQuizAttempt(attempt));

        // Save to database and get generated ID
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // ========== STEP 5: UPDATE USER PROGRESSION ==========
        // Update user's overall statistics (attempts, credits, streaks, etc.)
        updateProgression(request.getUserId(), score, credits, passed);

        // ========== STEP 6: EVALUATE & AWARD BADGES ==========
        // Check if user qualifies for any of the 14 badges
        List<BadgeType> newBadges = evaluateAndAwardBadges(
            request.getUserId(),
            score,
            request.getTimeTakenSeconds(),
            allowedTimeSeconds
        );

        // ========== STEP 7: BUILD & RETURN RESPONSE ==========
        // Send back quiz result to frontend
        QuizResultResponse response = new QuizResultResponse();
        response.setScore(score);
        response.setPassed(passed);
        response.setCreditsEarned(credits);
        response.setNewBadges(newBadges);
        response.setAttemptId(savedAttempt.getId());
        return response;
    }

    /**
     * Calculate credits earned from a quiz attempt.
     * Formula: Credits = 10 × scoreMultiplier × timeEfficiency
     *
     * SCORE MULTIPLIER (based on quiz score):
     *   90-100%  →  3x  (excellent)
     *   75-89%   →  2x  (good)
     *   50-74%   →  1x  (passed)
     *   <50%     →  0x  (failed - no credits)
     *
     * TIME EFFICIENCY (reward for speed):
     *   faster than allowed  →  up to 2.0x
     *   slower than allowed  →  down to 0.5x
     *   Example: finished in 150s of 600s allowed = 600/150 = 4.0 → capped to 2.0
     *
     * @param score Quiz score (0-100%)
     * @param timeTakenSeconds Time taken to complete quiz
     * @param allowedTimeSeconds Time allowed for the quiz
     * @return Credits earned (0 if score < 50)
     */
    int calculateCredits(double score, int timeTakenSeconds, int allowedTimeSeconds) {
        // ========== STEP 1: DETERMINE SCORE MULTIPLIER ==========
        int scoreMultiplier;
        if (score >= 90) {
            scoreMultiplier = 3;  // Excellent score = 3x multiplier
        } else if (score >= 75) {
            scoreMultiplier = 2;  // Good score = 2x multiplier
        } else if (score >= 50) {
            scoreMultiplier = 1;  // Passing score = 1x multiplier
        } else {
            return 0;  // Failed quiz = 0 credits (no reward for failing)
        }

        // ========== STEP 2: CALCULATE TIME EFFICIENCY MULTIPLIER ==========
        // timeEfficiency = allowed / taken
        // If user finishes fast: taken < allowed → efficiency > 1.0 (bonus)
        // If user finishes slow: taken > allowed → efficiency < 1.0 (penalty)
        double timeEfficiency = (double) allowedTimeSeconds / timeTakenSeconds;

        // CAP efficiency between 0.5x (slowest) and 2.0x (fastest)
        // Math.max(0.5, ...) ensures minimum 0.5x if too slow
        // Math.min(..., 2.0) ensures maximum 2.0x if too fast
        timeEfficiency = Math.max(0.5, Math.min(2.0, timeEfficiency));

        // ========== STEP 3: CALCULATE FINAL CREDITS ==========
        // Formula: 10 (base) × scoreMultiplier × timeEfficiency
        // Examples:
        //   Score 95%, time 20% → 10 × 3 × 2.0 = 60 credits
        //   Score 75%, time 50% → 10 × 2 × 1.0 = 20 credits
        //   Score 55%, time 150% → 10 × 1 × 0.5 = 5 credits
        return (int) Math.round(10 * scoreMultiplier * timeEfficiency);
    }

    /**
     * Update user's overall progression statistics after a quiz attempt.
     * Tracks: total attempts, credits earned, average score, passes, consecutive passes, day streak.
     * Creates new progression record if user is attempting their first quiz.
     *
     * @param userId User ID
     * @param score Quiz score (0-100)
     * @param credits Credits earned from this quiz
     * @param passed Whether the quiz was passed (score >= 50)
     */
    private void updateProgression(Long userId, double score, int credits, boolean passed) {
        // ========== STEP 1: GET OR CREATE PROGRESSION RECORD ==========
        // First-time users don't have a progression record yet
        UserProgression progression = userProgressionRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create new record with all stats initialized to 0
                    UserProgression p = new UserProgression();
                    p.setUserId(userId);
                    p.setTotalCredits(0);
                    p.setTotalAttempts(0);
                    p.setTotalPassed(0);
                    p.setAverageScore(0.0);
                    p.setCurrentStreak(0);
                    p.setBestStreak(0);
                    p.setConsecutivePassCount(0);
                    return p;
                });

        // ========== STEP 2: UPDATE ATTEMPT COUNT & CREDITS ==========
        progression.setTotalAttempts(progression.getTotalAttempts() + 1);
        progression.setTotalCredits(progression.getTotalCredits() + credits);

        // ========== STEP 3: UPDATE AVERAGE SCORE ==========
        // Use running average formula to calculate new average
        // Formula: newAverage = (oldAverage × oldCount + newScore) / newCount
        // Example: average was 80 with 4 attempts, new score is 90
        //   newAverage = (80 × 4 + 90) / 5 = 410 / 5 = 82
        double totalScoreSum = progression.getAverageScore() * (progression.getTotalAttempts() - 1) + score;
        progression.setAverageScore(totalScoreSum / progression.getTotalAttempts());

        // ========== STEP 4: UPDATE PASS STATISTICS ==========
        if (passed) {
            // User passed this quiz
            progression.setTotalPassed(progression.getTotalPassed() + 1);
            // Increment consecutive passes counter
            progression.setConsecutivePassCount(progression.getConsecutivePassCount() + 1);
        } else {
            // User failed this quiz
            // Reset consecutive pass counter to 0 (streak is broken)
            progression.setConsecutivePassCount(0);
        }

        // ========== STEP 5: UPDATE DAY STREAK ==========
        // Calculate current streak from quiz attempt dates
        updateDayStreak(userId, progression);

        // ========== STEP 6: SAVE UPDATED PROGRESSION ==========
        userProgressionRepository.save(progression);
    }

    /**
     * Calculate consecutive day streak based on quiz attempt dates.
     * Streak = how many consecutive days user has attempted a quiz
     * Example: Mon, Tue, Wed = 3-day streak; Mon, Tue, (skip Wed), Thu = streak resets to 1
     *
     * @param userId User ID
     * @param progression User progression object to update
     */
    private void updateDayStreak(Long userId, UserProgression progression) {
        // ========== STEP 1: GET ALL RECENT QUIZ ATTEMPTS (ORDERED BY DATE DESC) ==========
        List<QuizAttempt> recentAttempts = quizAttemptRepository.findRecentAttempts(userId);

        // ========== STEP 2: HANDLE EDGE CASE: FIRST OR SECOND ATTEMPT ==========
        // If user has only 1 quiz attempt total, streak is 1
        if (recentAttempts.size() < 2) {
            progression.setCurrentStreak(1);
            progression.setBestStreak(Math.max(progression.getBestStreak(), 1));
            return;
        }

        // ========== STEP 3: EXTRACT UNIQUE ATTEMPT DAYS ==========
        // Convert attempt dates (with time) to just dates (YYYY-MM-DD)
        // Use TreeSet to remove duplicates (if user took multiple quizzes same day)
        // Example: [2024-01-15 10:30, 2024-01-15 14:20, 2024-01-14 09:00]
        //      →   [2024-01-15, 2024-01-14]
        Set<LocalDate> attemptDays = recentAttempts.stream()
                .map(a -> a.getAttemptDate().toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));

        // ========== STEP 4: SORT DATES IN DESCENDING ORDER (NEWEST FIRST) ==========
        // Create list from set, then reverse to get descending order
        // Example: [2024-01-15, 2024-01-14, 2024-01-13]
        List<LocalDate> sortedDays = new ArrayList<>(new TreeSet<>(attemptDays));
        Collections.reverse(sortedDays);

        // ========== STEP 5: COUNT CONSECUTIVE DAYS FROM MOST RECENT ==========
        int streak = 1;  // Start with streak of 1 (most recent day)

        // Compare each day with the previous day
        for (int i = 1; i < sortedDays.size(); i++) {
            // Check if this day is exactly 1 day before the previous day
            // sortedDays.get(i - 1) is the "more recent" day
            // sortedDays.get(i) is the "older" day
            // Example: sortedDays[0] = 2024-01-15
            //          sortedDays[1] = 2024-01-14 (should be 01-14 = 01-15 - 1 day)
            if (sortedDays.get(i - 1).minusDays(1).equals(sortedDays.get(i))) {
                // Days are consecutive! Continue the streak
                streak++;
            } else {
                // Gap found in dates, streak is broken
                break;
            }
        }

        // ========== STEP 6: UPDATE CURRENT & BEST STREAKS ==========
        // Current streak = how many consecutive days ending today
        progression.setCurrentStreak(streak);

        // Best streak = highest consecutive day streak ever achieved
        // Use Math.max to only update if new streak is higher
        progression.setBestStreak(Math.max(progression.getBestStreak(), streak));
    }

    /**
     * Evaluate and award badges based on user performance and progression.
     * Checks 14 different badge criteria across 5 categories:
     *
     * VOLUME BADGES (Participation):
     *   - FIRST_STEP: 1+ attempts
     *   - QUIZ_ENTHUSIAST: 10+ attempts
     *   - QUIZ_MASTER: 50+ attempts
     *
     * ACCURACY BADGES (Smart Learning):
     *   - PERFECT_SCORE: current score = 100%
     *   - SHARP_MIND: 5+ quizzes with 90%+ score
     *   - CONSISTENT: 10+ consecutive passes
     *
     * SPEED BADGES (Fast Thinking):
     *   - SPEED_DEMON: finished in < 25% of allowed time
     *   - QUICK_THINKER: 5+ attempts under 50% time
     *
     * CREDIT BADGES (Performance Value):
     *   - CREDIT_STARTER: 100+ total credits
     *   - CREDIT_COLLECTOR: 500+ total credits
     *   - CREDIT_CHAMPION: 2000+ total credits
     *
     * STREAK BADGES (Daily Engagement):
     *   - THREE_DAY_STREAK: 3+ consecutive days
     *   - SEVEN_DAY_STREAK: 7+ consecutive days
     *
     * @param userId User ID
     * @param score Current quiz score (0-100)
     * @param timeTakenSeconds Time taken for current attempt
     * @param allowedTimeSeconds Time allowed for the quiz
     * @return List of newly awarded badges (empty list if no new badges earned)
     */
    private List<BadgeType> evaluateAndAwardBadges(
        Long userId,
        double score,
        int timeTakenSeconds,
        int allowedTimeSeconds
    ) {
        List<BadgeType> newBadges = new ArrayList<>();

        // ========== STEP 1: GET CURRENT USER PROGRESSION ==========
        // Need user's stats to check badge criteria
        UserProgression progression = userProgressionRepository.findByUserId(userId).orElse(null);
        if (progression == null) return newBadges;  // No stats = can't award badges

        // ========== STEP 2: CHECK VOLUME BADGES (PARTICIPATION) ==========
        // These badges reward users for taking multiple quizzes
        checkAndAward(userId, BadgeType.FIRST_STEP,
            progression.getTotalAttempts() >= 1,
            newBadges);

        checkAndAward(userId, BadgeType.QUIZ_ENTHUSIAST,
            progression.getTotalAttempts() >= 10,
            newBadges);

        checkAndAward(userId, BadgeType.QUIZ_MASTER,
            progression.getTotalAttempts() >= 50,
            newBadges);

        // ========== STEP 3: CHECK ACCURACY BADGES (SMART LEARNING) ==========
        // PERFECT_SCORE: Check if current quiz score is exactly 100%
        checkAndAward(userId, BadgeType.PERFECT_SCORE,
            score == 100.0,
            newBadges);

        // SHARP_MIND: Count how many different quizzes user scored 90%+ on
        // This requires a database query to count past attempts with high scores
        long highScoreQuizzes = quizAttemptRepository.countDistinctQuizzesWithScoreAbove90(userId);
        checkAndAward(userId, BadgeType.SHARP_MIND,
            highScoreQuizzes >= 5,
            newBadges);

        // CONSISTENT: Check if user has passed 10 quizzes in a row
        checkAndAward(userId, BadgeType.CONSISTENT,
            progression.getConsecutivePassCount() >= 10,
            newBadges);

        // ========== STEP 4: CHECK SPEED BADGES (FAST THINKING) ==========
        // SPEED_DEMON: Calculate time ratio for current quiz
        // If user finishes in less than 25% of allowed time → fast enough for badge
        double timeRatio = (double) timeTakenSeconds / allowedTimeSeconds;
        checkAndAward(userId, BadgeType.SPEED_DEMON,
            timeRatio < 0.25,  // Less than 25% of allowed time
            newBadges);

        // QUICK_THINKER: Count how many quizzes user completed in less than 50% time
        // This requires database query to find all "fast" attempts
        long fastAttempts = quizAttemptRepository.findFastAttempts(userId).size();
        checkAndAward(userId, BadgeType.QUICK_THINKER,
            fastAttempts >= 5,
            newBadges);

        // ========== STEP 5: CHECK CREDIT BADGES (PERFORMANCE VALUE) ==========
        // These badges reward cumulative high performance (total credits earned)
        checkAndAward(userId, BadgeType.CREDIT_STARTER,
            progression.getTotalCredits() >= 100,
            newBadges);

        checkAndAward(userId, BadgeType.CREDIT_COLLECTOR,
            progression.getTotalCredits() >= 500,
            newBadges);

        checkAndAward(userId, BadgeType.CREDIT_CHAMPION,
            progression.getTotalCredits() >= 2000,
            newBadges);

        // ========== STEP 6: CHECK STREAK BADGES (DAILY ENGAGEMENT) ==========
        // These badges reward consistent daily participation
        checkAndAward(userId, BadgeType.THREE_DAY_STREAK,
            progression.getCurrentStreak() >= 3,
            newBadges);

        checkAndAward(userId, BadgeType.SEVEN_DAY_STREAK,
            progression.getCurrentStreak() >= 7,
            newBadges);

        // ========== STEP 7: RETURN NEW BADGES ==========
        // Return list of badges earned in this quiz attempt
        return newBadges;
    }

    /**
     * Check if badge condition is met and user doesn't already have it, then award.
     *
     * Logic:
     *   Award ONLY IF:
     *     ✓ Condition is true (badge criteria met)
     *     ✓ User doesn't already have this badge (prevents duplicate awards)
     *
     * @param userId User ID
     * @param badgeType Badge to potentially award
     * @param condition Boolean condition (true = criteria met)
     * @param newBadges List to add newly awarded badge to
     */
    private void checkAndAward(
        Long userId,
        BadgeType badgeType,
        boolean condition,
        List<BadgeType> newBadges
    ) {
        // Check TWO conditions:
        // 1. condition = true (badge criteria is met)
        // 2. !existsByUserIdAndBadgeType = user doesn't already have this badge
        if (condition && !userBadgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {

            // ========== CREATE & SAVE BADGE ==========
            UserBadge badge = new UserBadge();
            badge.setUserId(userId);
            badge.setBadgeType(badgeType);
            // earnedDate is auto-set by @PrePersist → LocalDateTime.now()

            // Save to database (this inserts new row in user_badge table)
            userBadgeRepository.save(badge);

            // ========== RECORD AS NEWLY AWARDED ==========
            // Add to list for API response (so frontend knows user earned new badge)
            newBadges.add(badgeType);
        }
    }

    public List<QuizAttempt> getUserAttempts(Long userId) {
        return quizAttemptRepository.findByUserIdOrderByAttemptDateDesc(userId);
    }

    public List<QuizAttempt> getUserQuizAttempts(Long userId, Long quizId) {
        return quizAttemptRepository.findByUserIdAndQuizIdOrderByAttemptDateDesc(userId, quizId);
    }

    public UserProgression getUserProgression(Long userId) {
        return userProgressionRepository.findByUserId(userId).orElse(null);
    }

    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public List<LeaderboardEntry> getLeaderboard() {
        List<UserProgression> progressions = userProgressionRepository.findAllByOrderByTotalCreditsDesc();
        return progressions.stream().map(progression -> {
            LeaderboardEntry entry = new LeaderboardEntry();
            entry.setUserId(progression.getUserId());
            entry.setTotalCredits(progression.getTotalCredits());
            entry.setTotalAttempts(progression.getTotalAttempts());
            entry.setTotalPassed(progression.getTotalPassed());
            entry.setAverageScore(progression.getAverageScore());
            entry.setCurrentStreak(progression.getCurrentStreak());
            entry.setBestStreak(progression.getBestStreak());

            try {
                UserDTO user = userClient.getUserById(progression.getUserId());
                if (user != null && user.getUsername() != null) {
                    entry.setUsername(user.getUsername());
                } else {
                    entry.setUsername("Unknown");
                }
            } catch (Exception e) {
                entry.setUsername("Unknown");
            }
            return entry;
        }).collect(Collectors.toList());
    }
}
