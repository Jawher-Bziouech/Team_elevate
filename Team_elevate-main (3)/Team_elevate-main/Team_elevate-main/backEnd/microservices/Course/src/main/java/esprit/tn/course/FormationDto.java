// esprit.tn.course.client.FormationDto.java
/*package esprit.tn.course;

import lombok.Data;

@Data
public class FormationDto {
    private Long id;
    private String nom;
    private String description;
    private String responsable;
}*/
package esprit.tn.course;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FormationDto {




        private Long id;


        private String titre;


        private String description;

        private String categorie;
        private Integer dureeHeures;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private Double prix;
        private Integer placesDisponibles;



        private String imageUrl;


        private LocalDate dateDerniereMAJ;




        private String videoUrl;


}
