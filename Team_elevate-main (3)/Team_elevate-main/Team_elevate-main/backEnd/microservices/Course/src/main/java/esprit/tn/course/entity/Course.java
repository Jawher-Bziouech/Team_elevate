package esprit.tn.course.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
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

    private String contentType; // "PDF" or "VIDEO"
    private String contentUrl;   // file path or video URL

    private Long formationId;
    private String formationName;
    private Long trainerId;
    private String trainerName;
    @Builder.Default
    @Column(nullable = false)
    private Integer viewsCount = 0;
    @ManyToOne
    @JoinColumn(name = "prerequisite_id")
    private Course prerequisite; // cours précédent obligatoire

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        if (this.status == null) this.status = "EN_PREPARATION";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}