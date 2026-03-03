package tn.esprit.forum;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Long authorId;
    private LocalDateTime createdAt;
    private String imageUrl;


    // JPA Relationship: Many Comments belong to One Post
    @ManyToOne
    @JoinColumn(name = "post_id") // This creates the "post_id" column in SQL
    @JsonBackReference // This is the "Child" side (hides the post in comment JSON to prevent loops)
    private Post post;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}