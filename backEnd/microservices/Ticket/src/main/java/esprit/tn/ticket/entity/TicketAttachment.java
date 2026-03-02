package esprit.tn.ticket.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "ticket_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore
    private Ticket ticket;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;

    private Long fileSize;

    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = new Date();
    }
}
