package tn.esprit.quiz;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Integer duration; // in minutes
    private String type;
    private String status;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Question> questions;
}
=======
public class Quiz {
}
>>>>>>> cb93fa2fdf96a55ba80d2c859ecd05d11de45e53
