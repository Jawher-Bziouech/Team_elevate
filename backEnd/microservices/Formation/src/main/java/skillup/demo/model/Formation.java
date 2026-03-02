package skillup.demo.model;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@JsonPropertyOrder({"id", "titre", "description", "categorie", "dureeHeures", "dateDebut", "dateFin", "prix", "placesDisponibles", "imageUrl"})
@Table(name = "formations")
public class Formation implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 1000)
    private String description;

    private String categorie;
    private Integer dureeHeures;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double prix;
    private Integer placesDisponibles;

    // ✅ CHAMP imageUrl AJOUTÉ
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // ✅ Date de dernière mise à jour
    private LocalDate dateDerniereMAJ;

    // ✅ Liste des technologies
    @ElementCollection
    @CollectionTable(name = "formation_technologies", joinColumns = @JoinColumn(name = "formation_id"))
    @Column(name = "technologie")
    private List<String> technologies = new ArrayList<>();

    // ✅ NOUVEAU CHAMP videoUrl
    @Column(name = "video_url", length = 500)
    private String videoUrl;

    // ✅ Constructeurs
    public Formation() {}

    public Formation(String titre, String description, String categorie,
                     Integer dureeHeures, LocalDate dateDebut, LocalDate dateFin,
                     Double prix, Integer placesDisponibles) {
        this.titre = titre;
        this.description = description;
        this.categorie = categorie;
        this.dureeHeures = dureeHeures;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.prix = prix;
        this.placesDisponibles = placesDisponibles;
        this.dateDerniereMAJ = LocalDate.now();
    }

    // ✅ Getter et Setter pour videoUrl
    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    // ✅ Méthode utilitaire pour ajouter une technologie
    public void addTechnologie(String technologie) {
        this.technologies.add(technologie);
    }

    // ✅ Méthode pour mettre à jour la date de modification
    public void updateDateDerniereMAJ() {
        this.dateDerniereMAJ = LocalDate.now();
    }

    // ✅ Lombok génère automatiquement les autres getters et setters
} // ← FIN DE LA CLASSE (une seule fois à la fin)