package esprit.tn.course;

import esprit.tn.course.entity.UserCourseProgress;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCourseProgressRepository extends JpaRepository<UserCourseProgress, Long> {
    Optional<UserCourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);
    List<UserCourseProgress> findByUserId(Long userId);
    // UserCourseProgressRepository.java
    long countByCourseId(Long courseId);
    // Keyword: findDistinctByUserIdAndIsCompletedTrue


    // Keyword: findByUserIdAndIsOpenedTrue

    List<UserCourseProgress> findDistinctByUserIdAndIsCompletedTrue(Long userId);
    List<UserCourseProgress> findByUserIdAndIsOpenedTrue(Long userId);

    // Pour scheduler
    List<UserCourseProgress> findByCourseId(Long courseId);

    // JPQL: somme du temps passé par utilisateur sur une catégorie
    @Query("SELECT SUM(p.viewTimeSeconds) FROM UserCourseProgress p WHERE p.userId = :userId AND p.course.category = :category")
    Long sumViewTimeByUserAndCategory(@Param("userId") Long userId, @Param("category") String category);
    @Modifying
    @Transactional
    @Query("DELETE FROM UserCourseProgress p WHERE p.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
