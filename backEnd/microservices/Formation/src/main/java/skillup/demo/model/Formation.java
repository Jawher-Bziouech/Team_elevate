package skillup.demo;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@JsonPropertyOrder({"id", "titre", "description", "categorie", "dureeHeures", "dateDebut", "dateFin", "prix", "placesDisponibles"})
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

}
