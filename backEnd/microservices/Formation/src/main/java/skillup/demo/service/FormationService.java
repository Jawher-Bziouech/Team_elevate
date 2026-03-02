package skillup.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormationService {

    @Autowired
    private FormationRepository formationRepository;

    // CRUD operations

    // CREATE
    public Formation addFormation(Formation formation) {
        return formationRepository.save(formation);
    }

    // READ ALL
    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    // READ BY ID
    public Formation getFormationById(Long id) {
        return formationRepository.findById(id).orElse(null);
    }

    // UPDATE
    public Formation updateFormation(Long id, Formation newFormation) {
        if (formationRepository.findById(id).isPresent()) {
            Formation existingFormation = formationRepository.findById(id).get();

            existingFormation.setTitre(newFormation.getTitre());
            existingFormation.setDescription(newFormation.getDescription());
            existingFormation.setCategorie(newFormation.getCategorie());
            existingFormation.setDureeHeures(newFormation.getDureeHeures());
            existingFormation.setDateDebut(newFormation.getDateDebut());
            existingFormation.setDateFin(newFormation.getDateFin());
            existingFormation.setPrix(newFormation.getPrix());
            existingFormation.setPlacesDisponibles(newFormation.getPlacesDisponibles());

            return formationRepository.save(existingFormation);
        }
        return null;
    }

    // DELETE
    public String deleteFormation(Long id) {
        if (formationRepository.findById(id).isPresent()) {
            formationRepository.deleteById(id);
            return "Formation supprimée avec succès";
        }
        return "Formation non trouvée";
    }
}