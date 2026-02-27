/*package esprit.tn.course;

import esprit.tn.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
        List<Course> findByFormationId(Long formationId);

        List<Course> findByTrainerId(Long trainerId);

}*/
// esprit.tn.course.CourseRepository.java
package esprit.tn.course;

import esprit.tn.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

        // Trouver les cours par formation
        List<Course> findByFormationId(Long formationId);

        // Trouver les cours par formateur
        List<Course> findByTrainerId(Long trainerId);

        // Trouver les cours par statut
        List<Course> findByStatus(String status);

        // Compter les cours par formation
        @Query("SELECT COUNT(c) FROM Course c WHERE c.formationId = :formationId")
        long countByFormationId(@Param("formationId") Long formationId);

        // Supprimer tous les cours d'une formation
        void deleteByFormationId(Long formationId);
}
