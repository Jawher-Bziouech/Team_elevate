package esprit.tn.course.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String category;
    private String level;
    private Integer durationHours;
    private String language;
    private Double price;
    private String status; // ACTIF, INACTIF, EN_PREPARATION

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedAt;

    // Relation avec le formateur
    @Column(name = "trainer_id")
    private Long trainerId;

    @Column(name = "trainer_name")
    private String trainerName;

    // Relation avec la formation
    @Column(name = "formation_id", nullable = false)
    private Long formationId;

    @Column(name = "formation_name")
    private String formationName;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        if (this.status == null) {
            this.status = "EN_PREPARATION";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}