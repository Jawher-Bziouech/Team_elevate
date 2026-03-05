package skillup.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import skillup.demo.model.Inscription;
import skillup.demo.model.Formation;
import skillup.demo.repository.FormationRepository;
import skillup.demo.repository.InscriptionRepository;
import skillup.demo.service.EmailService;

import java.util.List;

@Service
public class InscriptionService {

    @Autowired
    private InscriptionRepository inscriptionRepository;

    @Autowired
    private FormationRepository formationRepository;  // Maintenant reconnu

    @Autowired
    private EmailService emailService;  // CORRECTION: EmailService au lieu de EmailSender

    public Inscription inscrire(Long formationId, Inscription inscription) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée avec l'id: " + formationId));

        if (formation.getPlacesDisponibles() <= 0) {
            throw new RuntimeException("Plus de places disponibles pour cette formation");
        }

        if (inscription.getEmail() == null || inscription.getEmail().trim().isEmpty()) {
            throw new RuntimeException("L'adresse email est obligatoire");
        }

        if (inscriptionRepository.existsByEmailAndFormationId(inscription.getEmail(), formationId)) {
            throw new RuntimeException("Vous êtes déjà inscrit à cette formation");
        }

        inscription.setFormation(formation);
        inscription.setDateInscription(java.time.LocalDate.now());
        inscription.setStatut("INSCRIT");

        Inscription savedInscription = inscriptionRepository.save(inscription);

        formation.setPlacesDisponibles(formation.getPlacesDisponibles() - 1);
        formationRepository.save(formation);

        try {
            emailService.envoyerConfirmationInscription(savedInscription, formation);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email: " + e.getMessage());
        }

        return savedInscription;
    }

    public List<Inscription> getAllInscriptions() {
        return inscriptionRepository.findAll();
    }

    public List<Inscription> getInscriptionsByFormation(Long formationId) {
        return inscriptionRepository.findByFormationId(formationId);
    }

    public Inscription getInscriptionById(Long id) {
        return inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée avec l'id: " + id));
    }

    public Inscription updateInscription(Long id, Inscription inscriptionDetails) {
        Inscription existingInscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée avec l'id: " + id));

        if (inscriptionDetails.getNom() != null) {
            existingInscription.setNom(inscriptionDetails.getNom());
        }
        if (inscriptionDetails.getPrenom() != null) {
            existingInscription.setPrenom(inscriptionDetails.getPrenom());
        }
        if (inscriptionDetails.getEmail() != null) {
            existingInscription.setEmail(inscriptionDetails.getEmail());
        }
        if (inscriptionDetails.getTelephone() != null) {
            existingInscription.setTelephone(inscriptionDetails.getTelephone());
        }
        if (inscriptionDetails.getStatut() != null) {
            existingInscription.setStatut(inscriptionDetails.getStatut());
        }

        return inscriptionRepository.save(existingInscription);
    }

    public String annulerInscription(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée avec l'id: " + id));

        Formation formation = inscription.getFormation();
        formation.setPlacesDisponibles(formation.getPlacesDisponibles() + 1);
        formationRepository.save(formation);

        inscription.setStatut("ANNULÉE");
        Inscription updatedInscription = inscriptionRepository.save(inscription);

        try {
            emailService.envoyerEmailAnnulation(updatedInscription, formation);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email d'annulation: " + e.getMessage());
        }

        return "Inscription annulée avec succès";
    }

    public String deleteInscription(Long id) {
        if (inscriptionRepository.existsById(id)) {
            inscriptionRepository.deleteById(id);
            return "Inscription supprimée avec succès";
        }
        return "Inscription non trouvée";
    }

    public long countInscriptionsByFormation(Long formationId) {
        return inscriptionRepository.countByFormationId(formationId);
    }
}