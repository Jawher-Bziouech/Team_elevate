package tn.esprit.quiz.Services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(MockitoExtension.class)
public class GamificationServiceTest {

    @InjectMocks
    private GamificationService gamificationService;

    @BeforeEach
    void setUp() {
        // No mocks needed because we are testing a pure math logic method
        // calculateCredits doesn't use the database or Feign clients!
    }

    // =========================================================================
    // TEST 1: EXCELLENT SCORE + SUPER FAST
    // =========================================================================
    @Test
    void testCalculateCredits_ExcellentScore_MaxSpeedBonus() {
        // Arrange
        double score = 95.0; // >= 90 means 3x multiplier
        int allowedTime = 1000; // 1000 seconds allowed
        int timeTaken = 200;    // Finished in 200 seconds (Super fast! 5x faster)
        
        // Expected Math:
        // Efficiency = 1000/200 = 5.0 (Capped at maximum 2.0)
        // Formula: 10 * 3 (score multiplier) * 2.0 (time efficiency) = 60 credits

        // Act
        int credits = gamificationService.calculateCredits(score, timeTaken, allowedTime);

        // Assert
        assertEquals(60, credits, "Should award maximum 60 credits for excellent score and speed");
    }

    // =========================================================================
    // TEST 2: GOOD SCORE + NORMAL SPEED
    // =========================================================================
    @Test
    void testCalculateCredits_GoodScore_NormalSpeed() {
        // Arrange
        double score = 80.0; // >= 75 means 2x multiplier
        int allowedTime = 600; // 10 minutes allowed
        int timeTaken = 600;   // Finished in exactly 10 minutes
        
        // Expected Math:
        // Efficiency = 600/600 = 1.0
        // Formula: 10 * 2 (score multiplier) * 1.0 (time efficiency) = 20 credits

        // Act
        int credits = gamificationService.calculateCredits(score, timeTaken, allowedTime);

        // Assert
        assertEquals(20, credits, "Should award exactly 20 credits for good score and normal speed");
    }

    // =========================================================================
    // TEST 3: PASSING SCORE + VERY SLOW
    // =========================================================================
    @Test
    void testCalculateCredits_PassingScore_SlowPenalty() {
        // Arrange
        double score = 60.0; // >= 50 means 1x multiplier
        int allowedTime = 600; // 10 minutes allowed
        int timeTaken = 1800;  // Finished in 30 minutes (Very slow!)
        
        // Expected Math:
        // Efficiency = 600/1800 = 0.33 (Capped at minimum 0.5)
        // Formula: 10 * 1 (score multiplier) * 0.5 (time efficiency) = 5 credits

        // Act
        int credits = gamificationService.calculateCredits(score, timeTaken, allowedTime);

        // Assert
        assertEquals(5, credits, "Should award minimum 5 credits due to heavy speed penalty");
    }

    // =========================================================================
    // TEST 4: FAILED QUIZ
    // =========================================================================
    @Test
    void testCalculateCredits_FailedQuiz_NoCredits() {
        // Arrange
        double score = 49.9; // < 50 means FAILED
        int allowedTime = 600; 
        int timeTaken = 100; // Even if they finished super fast!
        
        // Expected Math:
        // Score < 50 -> Immediate return 0.

        // Act
        int credits = gamificationService.calculateCredits(score, timeTaken, allowedTime);

        // Assert
        assertEquals(0, credits, "Should award exactly 0 credits for failing the quiz, regardless of speed");
    }
}
