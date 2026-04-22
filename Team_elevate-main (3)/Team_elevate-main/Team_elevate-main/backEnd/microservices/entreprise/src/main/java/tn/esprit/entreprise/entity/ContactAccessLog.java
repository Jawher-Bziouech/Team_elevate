package tn.esprit.entreprise.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ContactAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String username;
    private Long entrepriseId;
    private String plan;

    private LocalDateTime accessedAt;

    @PrePersist
    public void prePersist() {
        this.accessedAt = LocalDateTime.now();
    }

    public ContactAccessLog(Long userId, String username, Long entrepriseId, String plan) {
        this.userId = userId;
        this.username = username;
        this.entrepriseId = entrepriseId;
        this.plan = plan;
    }
}
