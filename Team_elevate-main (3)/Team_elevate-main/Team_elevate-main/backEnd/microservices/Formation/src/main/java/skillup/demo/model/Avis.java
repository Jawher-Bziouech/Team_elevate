package skillup.demo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "avis_formation")
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long inscriptionId;

    @Column(nullable = false)
    private Long formationId;

    @Column(nullable = false)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    private Ressenti ressenti;

    @Column(length = 500)
    private String commentaire;

    private LocalDateTime dateAvis;

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInscriptionId() { return inscriptionId; }
    public void setInscriptionId(Long inscriptionId) { this.inscriptionId = inscriptionId; }

    public Long getFormationId() { return formationId; }
    public void setFormationId(Long formationId) { this.formationId = formationId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Ressenti getRessenti() { return ressenti; }
    public void setRessenti(Ressenti ressenti) { this.ressenti = ressenti; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public LocalDateTime getDateAvis() { return dateAvis; }
    public void setDateAvis(LocalDateTime dateAvis) { this.dateAvis = dateAvis; }
}