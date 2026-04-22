package skillup.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import skillup.demo.model.Formation;
import skillup.demo.model.FormationPrediction;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormationPredictionRepository extends JpaRepository<FormationPrediction, Long> {

    List<FormationPrediction> findByDatePrediction(LocalDate date);

    Optional<FormationPrediction> findTopByFormationOrderByDatePredictionDesc(Formation formation);

    @Query("SELECT p FROM FormationPrediction p WHERE p.croissanceEstimee > :seuil AND p.datePrediction = CURRENT_DATE")
    List<FormationPrediction> findFortesCroissances(@Param("seuil") double seuil);

    // ✅ NOUVELLE MÉTHODE - Trouver les prédictions par formation
    List<FormationPrediction> findByFormationId(Long formationId);

    // ✅ NOUVELLE MÉTHODE - Supprimer les prédictions par formation
    @Modifying
    @Query("DELETE FROM FormationPrediction p WHERE p.formation.id = :formationId")
    void deleteByFormationId(@Param("formationId") Long formationId);
}