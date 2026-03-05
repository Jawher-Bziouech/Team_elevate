package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.BadgeType;
import tn.esprit.quiz.Entities.UserBadge;
import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserId(Long userId);

    boolean existsByUserIdAndBadgeType(Long userId, BadgeType badgeType);
}
