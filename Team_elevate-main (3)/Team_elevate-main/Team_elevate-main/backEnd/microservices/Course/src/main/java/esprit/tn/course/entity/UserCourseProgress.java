package esprit.tn.course.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "user_course_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCourseProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // The TRAINER's ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private Integer viewTimeSeconds; // time spent viewing the course
    
    private Boolean isOpened; // true if the user opened the course
    
    private Boolean isCompleted; // true if the user completed the course

    @Temporal(TemporalType.TIMESTAMP)
    private Date lastAccessedAt;
    private Integer lastVideoTime; // in seconds, for video courses only
    @PrePersist
    protected void onCreate() {
        this.lastAccessedAt = new Date();
        if (this.viewTimeSeconds == null) this.viewTimeSeconds = 0;
        if (this.isOpened == null) this.isOpened = false;
        if (this.isCompleted == null) this.isCompleted = false;
        if (lastVideoTime == null) lastVideoTime = 0; // ajouter tast seen time
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastAccessedAt = new Date();
    }
}
