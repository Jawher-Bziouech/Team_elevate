package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
}
