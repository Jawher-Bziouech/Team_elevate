package tn.esprit.entreprise.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.entreprise.dto.EntrepriseResponseDTO;
import tn.esprit.entreprise.entity.ContactAccessLog;
import tn.esprit.entreprise.entity.Entreprise;
import tn.esprit.entreprise.repository.ContactAccessLogRepository;
import tn.esprit.entreprise.repository.EntrepriseRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EntrepriseServiceImpl implements EntrepriseService {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @Autowired
    private ContactAccessLogRepository accessLogRepository;

    // ── CRUD ─────────────────────────────────────────

    @Override
    public List<Entreprise> getAll() {
        return entrepriseRepository.findAll();
    }

    @Override
    public List<Entreprise> getApprovedEntreprises() {
        return entrepriseRepository.findByStatus("APPROVED");
    }

    @Override
    public Optional<Entreprise> getById(Long id) {
        return entrepriseRepository.findById(id);
    }

    @Override
    public Entreprise create(Entreprise entreprise) {
        return entrepriseRepository.save(entreprise);
    }

    @Override
    public Entreprise update(Long id, Entreprise entreprise) {
        Entreprise existing = entrepriseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise not found: " + id));
        existing.setNom(entreprise.getNom());
        existing.setSecteur(entreprise.getSecteur());
        existing.setDescription(entreprise.getDescription());
        existing.setAdresse(entreprise.getAdresse());
        existing.setEmail(entreprise.getEmail());
        existing.setTelephone(entreprise.getTelephone());
        existing.setSiteWeb(entreprise.getSiteWeb());
        existing.setLogo(entreprise.getLogo());
        existing.setTaille(entreprise.getTaille());
        existing.setDateCreation(entreprise.getDateCreation());
        return entrepriseRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        entrepriseRepository.deleteById(id);
    }

    @Override
    public List<Entreprise> searchEntreprises(String nom, String secteur) {
        return entrepriseRepository.search(nom, secteur);
    }

    @Override
    public List<Entreprise> getEntreprisesBySecteur(String secteur) {
        return entrepriseRepository.findBySecteurIgnoreCase(secteur);
    }

    @Override
    public Entreprise updateStatus(Long id, String status) {
        Entreprise e = entrepriseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise not found: " + id));
        e.setStatus(status);
        return entrepriseRepository.save(e);
    }

    @Override
    public List<String> getDistinctSecteurs() {
        return entrepriseRepository.findDistinctSecteurs();
    }

    // ── PLAN-AWARE ────────────────────────────────────

    @Override
    public List<EntrepriseResponseDTO> getApprovedForPlan(String role, String plan) {
        // ADMIN always sees full data regardless of plan
        String effectivePlan = "ADMIN".equalsIgnoreCase(role) ? "PRO" : plan;
        return entrepriseRepository.findByStatus("APPROVED")
                .stream()
                .map(e -> mapToDTO(e, effectivePlan))
                .collect(Collectors.toList());
    }

    @Override
    public EntrepriseResponseDTO getByIdForPlan(Long id, String role, String plan, Long userId, String username) {
        Entreprise e = entrepriseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise not found: " + id));

        // Log every view (for analytics — track who views what)
        if (userId != null) {
            accessLogRepository.save(new ContactAccessLog(userId, username, id, plan));
        }

        // ADMIN always sees full data
        String effectivePlan = "ADMIN".equalsIgnoreCase(role) ? "PRO" : plan;
        return mapToDTO(e, effectivePlan);
    }

    @Override
    public List<ContactAccessLog> getAccessLogs(Long entrepriseId) {
        return accessLogRepository.findByEntrepriseIdOrderByAccessedAtDesc(entrepriseId);
    }

    // ── MASKING LOGIC ─────────────────────────────────
    //
    // FREE  → email hidden,   phone hidden,   website hidden
    // BASIC → email visible,  phone hidden,   website visible
    // PRO   → email visible,  phone visible,  website visible
    // ADMIN → same as PRO (handled by caller upgrading plan to PRO)

    private EntrepriseResponseDTO mapToDTO(Entreprise e, String plan) {
        String normalised = plan != null ? plan.toUpperCase() : "FREE";

        boolean showEmail   = "BASIC".equals(normalised) || "PRO".equals(normalised);
        boolean showPhone   = "PRO".equals(normalised);
        boolean showWebsite = "BASIC".equals(normalised) || "PRO".equals(normalised);

        EntrepriseResponseDTO dto = new EntrepriseResponseDTO();
        dto.setId(e.getId());
        dto.setNom(e.getNom());
        dto.setSecteur(e.getSecteur());
        dto.setDescription(e.getDescription());
        dto.setAdresse(e.getAdresse());
        dto.setTaille(e.getTaille());
        dto.setDateCreation(e.getDateCreation());
        dto.setStatus(e.getStatus());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setLogo(e.getLogo());

        dto.setEmail(showEmail ? e.getEmail() : maskEmail(e.getEmail()));
        dto.setEmailMasked(!showEmail);

        dto.setTelephone(showPhone ? e.getTelephone() : maskPhone(e.getTelephone()));
        dto.setPhoneMasked(!showPhone);

        dto.setSiteWeb(showWebsite ? e.getSiteWeb() : maskWebsite(e.getSiteWeb()));
        dto.setWebsiteMasked(!showWebsite);

        return dto;
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) return null;
        int at = email.indexOf('@');
        if (at <= 1) return "•••@" + email.substring(at + 1);
        return email.charAt(0) + "•".repeat(Math.min(at - 1, 4)) + "@" + email.substring(at + 1);
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) return null;
        int keep = Math.min(4, phone.length());
        return phone.substring(0, keep) + " ••• ••• ••";
    }

    private String maskWebsite(String url) {
        if (url == null || url.isBlank()) return null;
        String clean = url.replaceAll("^https?://", "");
        int dot = clean.indexOf('.');
        if (dot < 0) return clean.substring(0, Math.min(4, clean.length())) + ".•••";
        return clean.substring(0, dot) + ".•••";
    }
}
