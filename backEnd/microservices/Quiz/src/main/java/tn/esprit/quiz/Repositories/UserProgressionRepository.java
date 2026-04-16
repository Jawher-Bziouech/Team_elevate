package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.UserProgression;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressionRepository extends JpaRepository<UserProgression, Long> {

    Optional<UserProgression> findByUserId(Long userId);

    List<UserProgression> findAllByOrderByTotalCreditsDesc();
}
