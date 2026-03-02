package tn.esprit.forum;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;           // who receives the notification (post author)
    private Long postId;           // which post was commented on
    private String postTitle;      // post title for display
    private Long commentAuthorId;  // who wrote the comment
    private String message;        // e.g. "Someone commented on your post"
    private boolean isRead;        // has the user seen it?
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isRead = false;
    }
}