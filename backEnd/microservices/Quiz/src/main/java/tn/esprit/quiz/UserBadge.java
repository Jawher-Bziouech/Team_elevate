package tn.esprit.quiz;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "badgeType"}))
public class UserBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private BadgeType badgeType;

    private LocalDateTime earnedDate;

    @PrePersist
    protected void onCreate() {
        earnedDate = LocalDateTime.now();
    }
}
