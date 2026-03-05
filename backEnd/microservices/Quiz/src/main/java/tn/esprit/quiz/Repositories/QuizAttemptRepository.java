package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.QuizAttempt;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserIdOrderByAttemptDateDesc(Long userId);

    List<QuizAttempt> findByUserIdAndQuizIdOrderByAttemptDateDesc(Long userId, Long quizId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT a.quizId) FROM QuizAttempt a WHERE a.userId = :userId AND a.score >= 90.0")
    long countDistinctQuizzesWithScoreAbove90(@Param("userId") Long userId);

    @Query("SELECT a FROM QuizAttempt a WHERE a.userId = :userId AND a.timeTakenSeconds < (a.allowedTimeSeconds / 2) AND a.passed = true")
    List<QuizAttempt> findFastAttempts(@Param("userId") Long userId);

    @Query("SELECT a FROM QuizAttempt a WHERE a.userId = :userId ORDER BY a.attemptDate DESC")
    List<QuizAttempt> findRecentAttempts(@Param("userId") Long userId);
}
