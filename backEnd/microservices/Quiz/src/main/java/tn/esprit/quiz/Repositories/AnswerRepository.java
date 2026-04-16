package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
}
