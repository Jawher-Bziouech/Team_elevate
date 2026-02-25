package tn.esprit.joboffer.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
public class Firm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Firm name is required")
    @Size(min = 2, max = 100, message = "Firm name must be between 2 and 100 characters")
    private String nom; // name

    @Size(max = 100, message = "Specialty must not exceed 100 characters")
    private String specialite; // specialty

    // Constructors
    public Firm() {}

    public Firm(String nom, String specialite) {
        this.nom = nom;
        this.specialite = specialite;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }
}