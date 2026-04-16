package tn.esprit.entreprise.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.entreprise.entity.Entreprise;
import tn.esprit.entreprise.repository.EntrepriseRepository;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepriseServiceImpl implements EntrepriseService {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

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
                .orElseThrow(() -> new RuntimeException("Entreprise not found with id: " + id));
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
        Entreprise entreprise = entrepriseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise not found with id: " + id));
        entreprise.setStatus(status);
        return entrepriseRepository.save(entreprise);
    }

    @Override
    public List<String> getDistinctSecteurs() {
        return entrepriseRepository.findDistinctSecteurs();
    }
}
