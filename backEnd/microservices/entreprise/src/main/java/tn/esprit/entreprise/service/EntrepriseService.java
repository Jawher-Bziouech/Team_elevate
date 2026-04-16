package tn.esprit.entreprise.service;

import tn.esprit.entreprise.entity.Entreprise;

import java.util.List;
import java.util.Optional;

public interface EntrepriseService {
    List<Entreprise> getAll();
    List<Entreprise> getApprovedEntreprises();
    Optional<Entreprise> getById(Long id);
    Entreprise create(Entreprise entreprise);
    Entreprise update(Long id, Entreprise entreprise);
    void delete(Long id);
    List<Entreprise> searchEntreprises(String nom, String secteur);
    List<Entreprise> getEntreprisesBySecteur(String secteur);
    Entreprise updateStatus(Long id, String status);
    List<String> getDistinctSecteurs();
}
