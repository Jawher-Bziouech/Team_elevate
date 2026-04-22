package skillup.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import skillup.demo.model.Inscription;
import skillup.demo.model.Formation;
import skillup.demo.model.User;
import skillup.demo.repository.FormationRepository;
import skillup.demo.repository.InscriptionRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InscriptionService {

    @Autowired
    private InscriptionRepository inscriptionRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserClient userClient;


    public Inscription inscrireConnecte(Long formationId, String userEmail) {
        System.out.println("🔍 SERVICE - Recherche utilisateur avec email: " + userEmail);

        User user = null;

        try {
            user = userClient.getUserByEmail(userEmail);
            System.out.println("✅ Utilisateur trouvé via UserClient");
        } catch (Exception e) {
            System.err.println("⚠️ Erreur UserClient: " + e.getMessage());
            user = new User();
            user.setEmail(userEmail);
            user.setNom("Inscrit");
            user.setPrenom("Auto");
            user.setTelephone("Non renseigné");
            System.out.println("⚠️ Utilisateur temporaire créé pour: " + userEmail);
        }

        if (user == null) {
            user = new User();
            user.setEmail(userEmail);
            user.setNom("Inscrit");
            user.setPrenom("Auto");
            user.setTelephone("Non renseigné");
        }

        System.out.println("👤 Utilisateur: " + user.getNom() + " " + user.getPrenom() + " (" + user.getEmail() + ")");

        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        if (formation.getPlacesDisponibles() <= 0) {
            throw new RuntimeException("Plus de places disponibles");
        }

        if (inscriptionRepository.existsByEmailAndFormationId(userEmail, formationId)) {
            throw new RuntimeException("Vous êtes déjà inscrit à cette formation");
        }

        Inscription inscription = new Inscription();
        inscription.setNom(user.getNom() != null ? user.getNom() : "Non renseigné");
        inscription.setPrenom(user.getPrenom() != null ? user.getPrenom() : "Non renseigné");
        inscription.setEmail(userEmail);
        inscription.setTelephone(user.getTelephone() != null ? user.getTelephone() : "Non renseigné");
        inscription.setFormation(formation);
        inscription.setDateInscription(LocalDate.now());
        inscription.setStatut("INSCRIT");

        Inscription savedInscription = inscriptionRepository.save(inscription);
        System.out.println("✅ Inscription enregistrée avec ID: " + savedInscription.getId());

        formation.setPlacesDisponibles(formation.getPlacesDisponibles() - 1);
        formationRepository.save(formation);

        try {
            emailService.envoyerConfirmationInscription(savedInscription, formation);
            System.out.println("📧 Email de confirmation envoyé");
        } catch (Exception e) {
            System.err.println("⚠️ Erreur envoi email: " + e.getMessage());
        }

        return savedInscription;
    }

    public Inscription inscrire(Long formationId, Inscription inscription) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        if (formation.getPlacesDisponibles() <= 0) {
            throw new RuntimeException("Plus de places disponibles");
        }

        if (inscription.getEmail() == null || inscription.getEmail().trim().isEmpty()) {
            throw new RuntimeException("L'adresse email est obligatoire");
        }

        if (inscriptionRepository.existsByEmailAndFormationId(inscription.getEmail(), formationId)) {
            throw new RuntimeException("Vous êtes déjà inscrit à cette formation");
        }

        inscription.setFormation(formation);
        inscription.setDateInscription(LocalDate.now());
        inscription.setStatut("INSCRIT");

        Inscription saved = inscriptionRepository.save(inscription);

        formation.setPlacesDisponibles(formation.getPlacesDisponibles() - 1);
        formationRepository.save(formation);

        return saved;
    }

    public List<Inscription> getAllInscriptions() {
        return inscriptionRepository.findAll();
    }

    public List<Inscription> getInscriptionsByFormation(Long formationId) {
        return inscriptionRepository.findByFormationId(formationId);
    }

    public List<Inscription> getInscriptionsByUser(String email) {
        return inscriptionRepository.findByEmail(email);
    }

    public Inscription getInscriptionById(Long id) {
        return inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
    }

    public Inscription updateInscription(Long id, Inscription inscriptionDetails) {
        Inscription existing = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscriptionDetails.getNom() != null) existing.setNom(inscriptionDetails.getNom());
        if (inscriptionDetails.getPrenom() != null) existing.setPrenom(inscriptionDetails.getPrenom());
        if (inscriptionDetails.getEmail() != null) existing.setEmail(inscriptionDetails.getEmail());
        if (inscriptionDetails.getTelephone() != null) existing.setTelephone(inscriptionDetails.getTelephone());
        if (inscriptionDetails.getStatut() != null) existing.setStatut(inscriptionDetails.getStatut());

        return inscriptionRepository.save(existing);
    }

    public String annulerInscription(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        Formation formation = inscription.getFormation();
        formation.setPlacesDisponibles(formation.getPlacesDisponibles() + 1);
        formationRepository.save(formation);

        inscription.setStatut("ANNULÉE");
        inscriptionRepository.save(inscription);

        return "Inscription annulée avec succès";
    }

    public String deleteInscription(Long id) {
        if (inscriptionRepository.existsById(id)) {
            inscriptionRepository.deleteById(id);
            return "Inscription supprimée avec succès";
        }
        return "Inscription non trouvée";
    }


    public List<Inscription> getInscriptionsArchivees() {
        return inscriptionRepository.findByArchiveeTrue();
    }

    public List<Inscription> getInscriptionsActives() {
        return inscriptionRepository.findByArchiveeFalse();
    }

    public Inscription archiverInscription(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        inscription.setArchivee(true);
        inscription.setDateArchive(LocalDateTime.now());
        return inscriptionRepository.save(inscription);
    }

    public Inscription desarchiverInscription(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        inscription.setArchivee(false);
        inscription.setDateArchive(null);
        return inscriptionRepository.save(inscription);
    }


    public Map<String, Object> getArchivageStats() {
        Map<String, Object> stats = new HashMap<>();
        Pageable topTen = PageRequest.of(0, 10);

        stats.put("totalArchivees", inscriptionRepository.countByArchiveeTrue());
        stats.put("totalActives", inscriptionRepository.countByArchiveeFalse());
        stats.put("dernieresArchives", inscriptionRepository.findTop10ByArchiveeTrueOrderByDateArchiveDesc(topTen));
        stats.put("dernieresDesarchives", inscriptionRepository.findTop10ByArchiveeFalseOrderByDateArchiveDesc(topTen));
        stats.put("dateDernierRun", LocalDateTime.now());

        return stats;
    }
}