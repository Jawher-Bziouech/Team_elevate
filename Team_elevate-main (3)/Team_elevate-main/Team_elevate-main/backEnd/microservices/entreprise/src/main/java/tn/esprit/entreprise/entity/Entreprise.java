package tn.esprit.entreprise.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 100)
    private String nom;

    @Size(max = 100)
    private String secteur;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String adresse;

    @Email
    private String email;

    @Size(max = 20)
    private String telephone;

    private String siteWeb;

    private String logo;

    private String taille; // STARTUP, PME, GRANDE_ENTREPRISE

    private LocalDate dateCreation;

    private String status; // PENDING, APPROVED, REJECTED

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}
