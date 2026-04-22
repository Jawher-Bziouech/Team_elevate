package skillup.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skillup.demo.model.Avis;

import java.util.List;
import java.util.Optional;

public interface AvisRepository extends JpaRepository<Avis, Long> {

    List<Avis> findByFormationId(Long formationId);

    List<Avis> findByInscriptionId(Long inscriptionId);

    Optional<Avis> findFirstByInscriptionId(Long inscriptionId);

    boolean existsByInscriptionId(Long inscriptionId);


}