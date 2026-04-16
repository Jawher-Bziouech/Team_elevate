package tn.esprit.quiz.Controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.quiz.Entities.Quiz;
import tn.esprit.quiz.Services.QuizService;
import java.util.List;

/**
 * REST API Controller for Quiz CRUD operations.
 * Handles all HTTP requests for quiz management (GET, POST, DELETE).
 * Routes: /quiz
 */
@RestController
@RequestMapping("/quiz")
public class QuizRestApi {

    private final QuizService quizService;

    public QuizRestApi(QuizService quizService) {
        this.quizService = quizService;
    }

    /**
     * Retrieve all quizzes.
     * @return List of all quizzes from the database
     */
    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    /**
     * Retrieve a quiz by its ID.
     * @param id Quiz ID
     * @return Quiz object or null if not found
     */
    @GetMapping("/{id}")
    public Quiz getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id).orElse(null);
    }

    /**
     * Create a new quiz with questions and answers.
     * @param quiz Quiz object containing questions and answers
     * @return Saved quiz with generated ID
     */
    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizService.saveQuiz(quiz);
    }

    /**
     * Delete a quiz by its ID.
     * @param id Quiz ID to delete
     */
    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
    }
}
