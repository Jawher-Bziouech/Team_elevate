package esprit.tn.course;

import esprit.tn.course.entity.Course;
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

        @Query("SELECT COUNT(c) FROM Course c WHERE c.formationId = :formationId")
        long countByFormationId(@Param("formationId") Long formationId);

        void deleteByFormationId(Long formationId);
}