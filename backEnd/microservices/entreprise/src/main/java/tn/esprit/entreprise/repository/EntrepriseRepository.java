package tn.esprit.entreprise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.entreprise.entity.Entreprise;

import java.util.List;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {

    List<Entreprise> findByStatus(String status);

    List<Entreprise> findBySecteurIgnoreCase(String secteur);

    @Query("SELECT e FROM Entreprise e WHERE " +
           "(:nom IS NULL OR LOWER(e.nom) LIKE LOWER(CONCAT('%', :nom, '%'))) AND " +
           "(:secteur IS NULL OR LOWER(e.secteur) LIKE LOWER(CONCAT('%', :secteur, '%')))")
    List<Entreprise> search(@Param("nom") String nom, @Param("secteur") String secteur);

    @Query("SELECT DISTINCT e.secteur FROM Entreprise e WHERE e.secteur IS NOT NULL")
    List<String> findDistinctSecteurs();
}
