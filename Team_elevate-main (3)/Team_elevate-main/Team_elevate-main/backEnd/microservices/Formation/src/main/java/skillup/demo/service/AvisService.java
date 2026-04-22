package skillup.demo.service;

import org.springframework.stereotype.Service;
import skillup.demo.model.Avis;
import skillup.demo.model.Inscription;
import skillup.demo.model.Ressenti;
import skillup.demo.repository.AvisRepository;
import skillup.demo.repository.InscriptionRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AvisService {

    private final AvisRepository avisRepository;
    private final InscriptionRepository inscriptionRepository;

    public AvisService(AvisRepository avisRepository, InscriptionRepository inscriptionRepository) {
        this.avisRepository = avisRepository;
        this.inscriptionRepository = inscriptionRepository;
    }

    public Avis donnerAvis(Long inscriptionId, String ressentiStr, String commentaire) {
        var inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (avisRepository.existsByInscriptionId(inscriptionId)) {
            throw new RuntimeException("Avis déjà donné pour cette inscription");
        }

        Avis avis = new Avis();
        avis.setInscriptionId(inscriptionId);
        avis.setFormationId(inscription.getFormation().getId());
        avis.setUserEmail(inscription.getEmail());
        avis.setRessenti(Ressenti.valueOf(ressentiStr));
        avis.setCommentaire(commentaire);
        avis.setDateAvis(LocalDateTime.now());

        return avisRepository.save(avis);
    }

    public List<Avis> getAvisByFormation(Long formationId) {
        return avisRepository.findByFormationId(formationId);
    }

    // ✅ CORRECTION - Utilise findFirstByInscriptionId
    // ✅ CORRECTION - Syntaxe correcte du lambda
    public Avis getAvisByInscriptionId(Long inscriptionId) {
        return avisRepository.findFirstByInscriptionId(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Avis non trouvé pour l'inscription " + inscriptionId));
    }
    public boolean hasAvis(Long inscriptionId) {
        return avisRepository.existsByInscriptionId(inscriptionId);
    }

    public Map<String, Object> getStatistiques(Long formationId) {
        List<Avis> avisList = avisRepository.findByFormationId(formationId);

        long satisfaits = avisList.stream()
                .filter(a -> a.getRessenti() == Ressenti.SATISFAIT)
                .count();

        long neutres = avisList.stream()
                .filter(a -> a.getRessenti() == Ressenti.NEUTRE)
                .count();

        long insatisfaits = avisList.stream()
                .filter(a -> a.getRessenti() == Ressenti.INSATISFAIT)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", avisList.size());
        stats.put("satisfaits", satisfaits);
        stats.put("neutres", neutres);
        stats.put("insatisfaits", insatisfaits);
        stats.put("moyenne", avisList.isEmpty() ? 0 :
                (satisfaits * 5 + neutres * 3 + insatisfaits * 1) / (double) avisList.size());

        return stats;
    }
    public List<Inscription> getInscriptionsByUser(String email) {
        return inscriptionRepository.findByEmail(email);
    }
}