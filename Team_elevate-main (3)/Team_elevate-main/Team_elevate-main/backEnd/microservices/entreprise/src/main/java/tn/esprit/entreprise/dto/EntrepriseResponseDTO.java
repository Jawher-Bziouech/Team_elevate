package tn.esprit.entreprise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EntrepriseResponseDTO {

    private Long id;
    private String nom;
    private String secteur;
    private String description;
    private String adresse;
    private String taille;
    private LocalDate dateCreation;
    private String status;
    private LocalDateTime createdAt;

    // Plan-gated fields
    private String email;
    private String telephone;
    private String siteWeb;
    private String logo;

    // Masking indicators
    private boolean emailMasked;
    private boolean phoneMasked;
    private boolean websiteMasked;
}
