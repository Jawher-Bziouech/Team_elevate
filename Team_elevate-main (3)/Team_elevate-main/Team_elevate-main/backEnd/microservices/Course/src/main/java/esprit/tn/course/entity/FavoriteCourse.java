package esprit.tn.course.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "favorite_courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // The TRAINER's ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Temporal(TemporalType.TIMESTAMP)
    private Date addedAt;

    @PrePersist
    protected void onCreate() {
        this.addedAt = new Date();
    }
}
