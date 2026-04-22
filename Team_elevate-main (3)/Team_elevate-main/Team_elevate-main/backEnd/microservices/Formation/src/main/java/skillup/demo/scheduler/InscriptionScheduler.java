package skillup.demo.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skillup.demo.model.Inscription;
import skillup.demo.repository.FormationRepository;
import skillup.demo.repository.InscriptionRepository;
import skillup.demo.service.EmailService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@EnableScheduling
public class InscriptionScheduler {

    @Autowired
    private InscriptionRepository inscriptionRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private EmailService emailService;


    @Scheduled(fixedDelay = 120000)
    @Transactional
    public void archiverInscriptionsFormationsTerminees() {
        System.out.println("📦 [SERVICE 1] Archivage des inscriptions des formations terminées - " + LocalDateTime.now());

        LocalDate today = LocalDate.now();

        List<Inscription> inscriptionsAArchiver = inscriptionRepository.findByFormationDateFinBefore(today);

        int compteur = 0;
        for (Inscription inscription : inscriptionsAArchiver) {
            if (!inscription.isArchivee()) {  // Vérifie si pas déjà archivée
                inscription.setArchivee(true);
                inscription.setDateArchive(LocalDateTime.now());
                inscriptionRepository.save(inscription);
                compteur++;
            }
        }

        System.out.println("📊 [SERVICE 1] " + compteur + " inscription(s) archivée(s)");
    }


    @Scheduled(fixedDelay = 180000)
    @Transactional
    public void nettoyerAnciennesArchives() {
        System.out.println("🗑️ [SERVICE 2] Nettoyage des anciennes archives - " + LocalDateTime.now());

        LocalDateTime dateLimite = LocalDateTime.now().minusDays(30);
        inscriptionRepository.deleteArchivedBefore(dateLimite);

        System.out.println("✅ [SERVICE 2] Nettoyage terminé");
    }

    @Scheduled(fixedDelay = 10000)  // S'exécute 10 secondes après démarrage
    public void desarchiverFormationsReactivees() {
        LocalDate today = LocalDate.now();
        System.out.println("🔄 [DÉSARCHIVAGE] Exécution à " + LocalDateTime.now());

        List<Inscription> aDesarchiver = inscriptionRepository.findByArchiveeTrueAndFormationDateFinAfter(today);

        System.out.println("📊 Nombre d'inscriptions à désarchiver : " + aDesarchiver.size());

        for (Inscription inscription : aDesarchiver) {
            System.out.println("   🔄 Désarchivage : " + inscription.getEmail()
                    + " (formation: " + inscription.getFormation().getTitre() + ")");
            inscription.setArchivee(false);
            inscription.setDateArchive(null);
            inscriptionRepository.save(inscription);
        }

        System.out.println("✅ [DÉSARCHIVAGE] Terminé - " + aDesarchiver.size() + " inscription(s) désarchivée(s)");
    }


}