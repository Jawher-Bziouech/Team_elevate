package esprit.tn.ticket;



import esprit.tn.ticket.entity.Ticket;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "ticket_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false, length = 5000)
    private String content;

    @Column(nullable = false)
    private Long senderId; // ID de l'utilisateur qui envoie le message

    @Column(nullable = false)
    private String senderRole; // ADMIN, TRAINER, TRAINEE

    @Temporal(TemporalType.TIMESTAMP)
    private Date sentAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date lastEditedAt;

    private boolean isEdited;

    @PrePersist
    protected void onCreate() {
        sentAt = new Date();
        isEdited = false;
    }
}