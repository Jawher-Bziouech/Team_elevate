package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.Quiz;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
