// InscriptionRepository.java
package skillup.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import skillup.demo.model.Formation;
import skillup.demo.model.Inscription;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    List<Inscription> findByFormationId(Long formationId);

    List<Inscription> findByEmail(String email);

    boolean existsByEmailAndFormationId(String email, Long formationId);

    long countByFormationId(Long formationId);  // ← DÉJÀ PRÉSENT

    @Modifying
    @Query("DELETE FROM Inscription i WHERE i.formation.id = :formationId")
    void deleteByFormationId(@Param("formationId") Long formationId);

    List<Inscription> findByStatut(String statut);

    List<Inscription> findByFormationIdAndStatut(Long formationId, String statut);

    List<Inscription> findByFormationAndDateInscriptionAfter(Formation formation, LocalDate sixMoisAvant);

    long countByFormationAndDateInscriptionAfter(Formation formation, LocalDate unAnAvant);

    long countByFormationAndDateInscriptionBetween(Formation formation, LocalDate deuxAnsAvant, LocalDate unAnAvant);

    long countByFormation(Formation formation);

    long countByFormationAndStatut(Formation formation, String annulee);
}