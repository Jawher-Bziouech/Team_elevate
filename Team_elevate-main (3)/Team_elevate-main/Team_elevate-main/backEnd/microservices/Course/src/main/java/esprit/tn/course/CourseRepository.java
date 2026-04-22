package esprit.tn.course;

import esprit.tn.course.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
        List<Course> findByFormationId(Long formationId);
        List<Course> findByTrainerId(Long trainerId);
        List<Course> findByStatus(String status);
        List<Course> findByTitleContainingIgnoreCase(String title);
        // CourseRepository.java
        List<Course> findByCategory(String category);
        @Query("SELECT COUNT(c) FROM Course c WHERE c.formationId = :formationId")
        long countByFormationId(@Param("formationId") Long formationId);

        void deleteByFormationId(Long formationId);
        // Keyword method
        List<Course> findByTitleContainingIgnoreCaseOrderByDurationHoursAsc(String title);

        // pour le scheduler
        List<Course> findByStatusAndDurationHoursLessThan(String status, Integer maxHours);

        // Pour le matching, nous utiliserons des requêtes JPQL personnalisées
        // JPQL: cours les plus ouverts
        @Query("SELECT c, COUNT(p) as openCount FROM Course c JOIN UserCourseProgress p ON p.course.id = c.id WHERE p.isOpened = true GROUP BY c ORDER BY openCount DESC")
        List<Object[]> findMostOpenedCourses();

        // JPQL: cours les plus complétés
        @Query("SELECT c, COUNT(p) as completionCount FROM Course c LEFT JOIN UserCourseProgress p ON p.course.id = c.id AND p.isCompleted = true GROUP BY c ORDER BY completionCount DESC")
        List<Object[]> findMostCompletedCourses();

        // JPQL: cours non commencés par utilisateur dans une catégorie
        @Query("SELECT c FROM Course c WHERE c.category = :category AND c.id NOT IN (SELECT p.course.id FROM UserCourseProgress p WHERE p.userId = :userId)")
        List<Course> findUnstartedCoursesByCategory(@Param("userId") Long userId, @Param("category") String category);

        // Keyword method
        @Query("SELECT c FROM Course c ORDER BY c.viewsCount DESC")
        List<Course> findTop5ByOrderByViewsCountDesc(Pageable pageable);

        // JPQL : Recommandations par catégories (basé sur les catégories des cours déjà suivis par l'utilisateur)
        @Query("SELECT c FROM Course c WHERE c.category IN :categories AND c.id NOT IN :excludedCourseIds")
        List<Course> findRecommendedByCategories(@Param("categories") List<String> categories,
                                                 @Param("excludedCourseIds") List<Long> excludedCourseIds,
                                                 Pageable pageable);

        // Keywords : recherche par mots-clés dans titre et description (avec LIKE)
        @Query("SELECT c FROM Course c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
        List<Course> searchByKeyword(@Param("keyword") String keyword);
}