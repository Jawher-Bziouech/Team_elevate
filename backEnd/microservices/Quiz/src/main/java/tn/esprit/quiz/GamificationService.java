package tn.esprit.quiz;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserProgressionRepository userProgressionRepository;

    public GamificationService(QuizRepository quizRepository,
                               QuizAttemptRepository quizAttemptRepository,
                               UserBadgeRepository userBadgeRepository,
                               UserProgressionRepository userProgressionRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userProgressionRepository = userProgressionRepository;
    }

    @Transactional
    public QuizResultResponse submitQuiz(QuizSubmissionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + request.getQuizId()));

        // Grade the quiz
        List<Question> questions = quiz.getQuestions();
        int totalQuestions = questions.size();
        int correctCount = 0;

        List<AttemptAnswer> attemptAnswers = new ArrayList<>();

        for (QuestionAnswerDTO answerDTO : request.getAnswers()) {
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(answerDTO.getQuestionId()))
                    .findFirst()
                    .orElse(null);

            if (question == null) continue;

            boolean isCorrect = question.getAnswers().stream()
                    .anyMatch(a -> a.getId().equals(answerDTO.getSelectedAnswerId()) && Boolean.TRUE.equals(a.getIsCorrect()));

            if (isCorrect) correctCount++;

            AttemptAnswer attemptAnswer = new AttemptAnswer();
            attemptAnswer.setQuestionId(answerDTO.getQuestionId());
            attemptAnswer.setSelectedAnswerId(answerDTO.getSelectedAnswerId());
            attemptAnswer.setCorrect(isCorrect);
            attemptAnswers.add(attemptAnswer);
        }

        double score = totalQuestions > 0 ? (correctCount * 100.0) / totalQuestions : 0.0;
        boolean passed = score >= 50.0;
        int allowedTimeSeconds = (quiz.getDuration() != null ? quiz.getDuration() : 10) * 60;
        int credits = calculateCredits(score, request.getTimeTakenSeconds(), allowedTimeSeconds);

        // Save attempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(request.getUserId());
        attempt.setQuizId(request.getQuizId());
        attempt.setScore(score);
        attempt.setTimeTakenSeconds(request.getTimeTakenSeconds());
        attempt.setAllowedTimeSeconds(allowedTimeSeconds);
        attempt.setCreditsEarned(credits);
        attempt.setPassed(passed);
        attempt.setAttemptAnswers(attemptAnswers);
        attemptAnswers.forEach(a -> a.setQuizAttempt(attempt));

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // Update progression
        updateProgression(request.getUserId(), score, credits, passed);

        // Evaluate badges
        List<BadgeType> newBadges = evaluateAndAwardBadges(request.getUserId(), score, request.getTimeTakenSeconds(), allowedTimeSeconds);

        QuizResultResponse response = new QuizResultResponse();
        response.setScore(score);
        response.setPassed(passed);
        response.setCreditsEarned(credits);
        response.setNewBadges(newBadges);
        response.setAttemptId(savedAttempt.getId());
        return response;
    }

    int calculateCredits(double score, int timeTakenSeconds, int allowedTimeSeconds) {
        int scoreMultiplier;
        if (score >= 90) scoreMultiplier = 3;
        else if (score >= 75) scoreMultiplier = 2;
        else if (score >= 50) scoreMultiplier = 1;
        else return 0;

        double timeEfficiency = (double) allowedTimeSeconds / timeTakenSeconds;
        timeEfficiency = Math.max(0.5, Math.min(2.0, timeEfficiency));

        return (int) Math.round(10 * scoreMultiplier * timeEfficiency);
    }

    private void updateProgression(Long userId, double score, int credits, boolean passed) {
        UserProgression progression = userProgressionRepository.findByUserId(userId)
                .orElseGet(() -> {
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

        progression.setTotalAttempts(progression.getTotalAttempts() + 1);
        progression.setTotalCredits(progression.getTotalCredits() + credits);

        // Update average score
        double totalScoreSum = progression.getAverageScore() * (progression.getTotalAttempts() - 1) + score;
        progression.setAverageScore(totalScoreSum / progression.getTotalAttempts());

        if (passed) {
            progression.setTotalPassed(progression.getTotalPassed() + 1);
            progression.setConsecutivePassCount(progression.getConsecutivePassCount() + 1);
        } else {
            progression.setConsecutivePassCount(0);
        }

        // Update day streak
        updateDayStreak(userId, progression);

        userProgressionRepository.save(progression);
    }

    private void updateDayStreak(Long userId, UserProgression progression) {
        List<QuizAttempt> recentAttempts = quizAttemptRepository.findRecentAttempts(userId);

        if (recentAttempts.size() < 2) {
            progression.setCurrentStreak(1);
            progression.setBestStreak(Math.max(progression.getBestStreak(), 1));
            return;
        }

        Set<LocalDate> attemptDays = recentAttempts.stream()
                .map(a -> a.getAttemptDate().toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));

        List<LocalDate> sortedDays = new ArrayList<>(new TreeSet<>(attemptDays));
        Collections.reverse(sortedDays);

        int streak = 1;
        for (int i = 1; i < sortedDays.size(); i++) {
            if (sortedDays.get(i - 1).minusDays(1).equals(sortedDays.get(i))) {
                streak++;
            } else {
                break;
            }
        }

        progression.setCurrentStreak(streak);
        progression.setBestStreak(Math.max(progression.getBestStreak(), streak));
    }

    private List<BadgeType> evaluateAndAwardBadges(Long userId, double score, int timeTakenSeconds, int allowedTimeSeconds) {
        List<BadgeType> newBadges = new ArrayList<>();
        UserProgression progression = userProgressionRepository.findByUserId(userId).orElse(null);
        if (progression == null) return newBadges;

        // Volume badges
        checkAndAward(userId, BadgeType.FIRST_STEP, progression.getTotalAttempts() >= 1, newBadges);
        checkAndAward(userId, BadgeType.QUIZ_ENTHUSIAST, progression.getTotalAttempts() >= 10, newBadges);
        checkAndAward(userId, BadgeType.QUIZ_MASTER, progression.getTotalAttempts() >= 50, newBadges);

        // Accuracy badges
        checkAndAward(userId, BadgeType.PERFECT_SCORE, score == 100.0, newBadges);
        long highScoreQuizzes = quizAttemptRepository.countDistinctQuizzesWithScoreAbove90(userId);
        checkAndAward(userId, BadgeType.SHARP_MIND, highScoreQuizzes >= 5, newBadges);
        checkAndAward(userId, BadgeType.CONSISTENT, progression.getConsecutivePassCount() >= 10, newBadges);

        // Speed badges
        double timeRatio = (double) timeTakenSeconds / allowedTimeSeconds;
        checkAndAward(userId, BadgeType.SPEED_DEMON, timeRatio < 0.25, newBadges);
        long fastAttempts = quizAttemptRepository.findFastAttempts(userId).size();
        checkAndAward(userId, BadgeType.QUICK_THINKER, fastAttempts >= 5, newBadges);

        // Credit badges
        checkAndAward(userId, BadgeType.CREDIT_STARTER, progression.getTotalCredits() >= 100, newBadges);
        checkAndAward(userId, BadgeType.CREDIT_COLLECTOR, progression.getTotalCredits() >= 500, newBadges);
        checkAndAward(userId, BadgeType.CREDIT_CHAMPION, progression.getTotalCredits() >= 2000, newBadges);

        // Consistency badges
        checkAndAward(userId, BadgeType.THREE_DAY_STREAK, progression.getCurrentStreak() >= 3, newBadges);
        checkAndAward(userId, BadgeType.SEVEN_DAY_STREAK, progression.getCurrentStreak() >= 7, newBadges);

        return newBadges;
    }

    private void checkAndAward(Long userId, BadgeType badgeType, boolean condition, List<BadgeType> newBadges) {
        if (condition && !userBadgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {
            UserBadge badge = new UserBadge();
            badge.setUserId(userId);
            badge.setBadgeType(badgeType);
            userBadgeRepository.save(badge);
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

    public List<UserProgression> getLeaderboard() {
        return userProgressionRepository.findAllByOrderByTotalCreditsDesc();
    }
}
