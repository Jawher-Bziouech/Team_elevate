package skillup.demo.model;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@JsonPropertyOrder({
        "id",
        "nom",
        "prenom",
        "email",
        "telephone",
        "dateInscription",
        "statut",
        "formation"
})
@Table(name = "inscriptions")
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;

    @Column(nullable = false)
    private String email;

    private String telephone;
    private LocalDate dateInscription = LocalDate.now();
    private String statut = "CONFIRMEE";  // Valeur par défaut

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;
}