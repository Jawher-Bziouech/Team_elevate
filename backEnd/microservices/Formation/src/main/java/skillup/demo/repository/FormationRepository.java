package skillup.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import skillup.demo.model.Formation;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {}
