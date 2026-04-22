package esprit.tn.course;

import esprit.tn.course.entity.FavoriteCourse;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface FavoriteCourseRepository extends JpaRepository<FavoriteCourse, Long> {
    List<FavoriteCourse> findByUserId(Long userId);

    void deleteByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT f FROM FavoriteCourse f WHERE f.addedAt < :date")
    List<FavoriteCourse> findAllByAddedAtBefore(@Param("date") Date date);

    // Supprimer les favoris plus vieux qu'une certaine date (plus efficace)
    @Modifying
    @Transactional
    @Query("DELETE FROM FavoriteCourse f WHERE f.addedAt < :date")
    int deleteAllByAddedAtBefore(@Param("date") Date date); // retourne int
    @Modifying
    @Transactional
    @Query("DELETE FROM FavoriteCourse f WHERE f.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}

