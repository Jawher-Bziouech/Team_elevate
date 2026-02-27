package tn.esprit.quiz;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    private Boolean isCorrect; // Support multiple correct answers!

    @ManyToOne
    @JoinColumn(name = "question_id")
    @JsonBackReference
    private Question question;
}
=======
public class Answer {
}
>>>>>>> cb93fa2fdf96a55ba80d2c859ecd05d11de45e53
