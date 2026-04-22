package skillup.demo.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import skillup.demo.model.Formation;
import skillup.demo.model.Inscription;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    // === MÉTHODES PRINCIPALES ===
    List<Inscription> findByFormationId(Long formationId);
    List<Inscription> findByEmail(String email);
    boolean existsByEmailAndFormationId(String email, Long formationId);
    long countByFormationId(Long formationId);

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

    @Query("SELECT i FROM Inscription i WHERE i.formation.dateFin < :date")
    List<Inscription> findByFormationDateFinBefore(@Param("date") LocalDate date);

    List<Inscription> findByArchiveeFalse();
    List<Inscription> findByArchiveeTrue();

    List<Inscription> findByDateArchiveBefore(LocalDateTime date);

    @Modifying
    @Query("DELETE FROM Inscription i WHERE i.archivee = true AND i.dateArchive < :date")
    void deleteArchivedBefore(@Param("date") LocalDateTime date);

    long countByStatut(String statut);

    List<Inscription> findByEmailContainingIgnoreCase(String email);

    @Query("SELECT i FROM Inscription i WHERE i.archivee = true AND i.formation.dateFin > :date")
    List<Inscription> findByArchiveeTrueAndFormationDateFinAfter(@Param("date") LocalDate date);

    long countByArchiveeTrue();
    long countByArchiveeFalse();

    @Query("SELECT i FROM Inscription i WHERE i.archivee = true ORDER BY i.dateArchive DESC")
    List<Inscription> findTop10ByArchiveeTrueOrderByDateArchiveDesc(Pageable pageable);

    @Query("SELECT i FROM Inscription i WHERE i.archivee = false AND i.dateArchive IS NOT NULL ORDER BY i.dateArchive DESC")
    List<Inscription> findTop10ByArchiveeFalseOrderByDateArchiveDesc(Pageable pageable);
}