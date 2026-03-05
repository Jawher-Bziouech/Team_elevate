package skillup.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import skillup.demo.model.Formation;
import skillup.demo.model.RapportObsolescence;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RapportObsolescenceRepository extends JpaRepository<RapportObsolescence, Long> {

    Optional<RapportObsolescence> findTopByFormationOrderByDateRapportDesc(Formation formation);

    List<RapportObsolescence> findByDateRapport(LocalDate date);

    @Query("SELECT r FROM RapportObsolescence r WHERE r.scoreObsolescence >= :seuil ORDER BY r.scoreObsolescence DESC")
    List<RapportObsolescence> findRisquesEleves(@Param("seuil") int seuil);

    @Query("SELECT r FROM RapportObsolescence r WHERE r.recommandation = :reco AND r.dateRapport = :date")
    List<RapportObsolescence> findByRecommandation(@Param("reco") String recommandation, @Param("date") LocalDate date);
}