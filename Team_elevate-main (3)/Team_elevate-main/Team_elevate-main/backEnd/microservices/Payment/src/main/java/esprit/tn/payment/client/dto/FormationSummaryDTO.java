package esprit.tn.payment.client.dto;

import lombok.Data;

@Data
public class FormationSummaryDTO {
    private Long id;
    private String titre;
    private String categorie;
    private Integer dureeHeures;
    private String dateDebut;
    private String dateFin;
    private Double prix;
    private Integer placesDisponibles;
    private String videoUrl;
}
