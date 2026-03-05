package tn.esprit.quiz.Services;

import org.springframework.stereotype.Service;
import tn.esprit.quiz.Entities.Quiz;
import tn.esprit.quiz.Repositories.QuizRepository;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for Quiz CRUD operations.
 * Delegates to QuizRepository for database operations.
 * Handles business logic for quiz creation, retrieval, and deletion.
 */
@Service
public class QuizService {

    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    /**
     * Retrieve all quizzes from the database.
     * @return List of all quizzes
     */
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    /**
     * Retrieve a quiz by ID.
     * @param id Quiz ID
     * @return Optional containing quiz if found
     */
    public Optional<Quiz> getQuizById(Long id) {
        return quizRepository.findById(id);
    }

    /**
     * Save a new quiz with its questions and answers.
     * Sets up bidirectional relationships (parent-child links) before persisting.
     * @param quiz Quiz object with nested questions and answers
     * @return Saved quiz with generated ID
     */
    public Quiz saveQuiz(Quiz quiz) {
        // Ensure parent-child links are set correctly before saving
        if (quiz.getQuestions() != null) {
            quiz.getQuestions().forEach(question -> {
                question.setQuiz(quiz);
                if (question.getAnswers() != null) {
                    question.getAnswers().forEach(answer -> answer.setQuestion(question));
                }
            });
        }
        return quizRepository.save(quiz);
    }

    /**
     * Delete a quiz by ID.
     * @param id Quiz ID to delete
     */
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}
