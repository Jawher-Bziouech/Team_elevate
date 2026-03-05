package skillup.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import skillup.demo.model.Formation;
import skillup.demo.repository.FormationRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class FormationService {

    @Autowired
    private FormationRepository formationRepository;

    public Formation addFormation(Formation formation) {
        return formationRepository.save(formation);
    }

    public List<Formation> getAllFormations() {
        return formationRepository.findAll();
    }

    public Formation getFormationById(Long id) {
        return formationRepository.findById(id).orElse(null);
    }

    public Formation updateFormation(Long id, Formation newFormation) {
        Formation existingFormation = formationRepository.findById(id).orElse(null);

        if (existingFormation != null) {
            System.out.println("🔄 Mise à jour formation ID: " + id);

            // Mettre à jour tous les champs
            existingFormation.setTitre(newFormation.getTitre());
            existingFormation.setDescription(newFormation.getDescription());
            existingFormation.setCategorie(newFormation.getCategorie());
            existingFormation.setDureeHeures(newFormation.getDureeHeures());
            existingFormation.setDateDebut(newFormation.getDateDebut());
            existingFormation.setDateFin(newFormation.getDateFin());
            existingFormation.setPrix(newFormation.getPrix());
            existingFormation.setPlacesDisponibles(newFormation.getPlacesDisponibles());

            // ✅ AJOUTER CES LIGNES IMPORTANTES
            existingFormation.setImageUrl(newFormation.getImageUrl());
            existingFormation.setVideoUrl(newFormation.getVideoUrl());
            existingFormation.setDateDerniereMAJ(LocalDate.now());

            // ✅ Mettre à jour les technologies si présentes
            if (newFormation.getTechnologies() != null) {
                existingFormation.setTechnologies(newFormation.getTechnologies());
            }

            System.out.println("💾 Sauvegarde avec videoUrl: " + newFormation.getVideoUrl());

            return formationRepository.save(existingFormation);
        }
        return null;
    }

    public String deleteFormation(Long id) {
        if (formationRepository.findById(id).isPresent()) {
            formationRepository.deleteById(id);
            return "Formation supprimée avec succès";
        }
        return "Formation non trouvée";
    }

    public boolean hasInscriptions(Long id) {
        return false;
    }

    public String deleteFormationWithInscriptions(Long id) {
        return "";
    }

    public long getInscriptionsCount(Long id) {
        return 0;
    }
}