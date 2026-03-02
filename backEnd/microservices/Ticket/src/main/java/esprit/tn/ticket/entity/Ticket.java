package esprit.tn.ticket.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    private String category;

    private Long createdBy;
    private String createdByRole;
    private String createdByName;

    private Long adminId;
    private String adminName;
    private String adminResponse;

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date responseDate;

    private boolean responseEditable;

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedAt;

    @Column(length = 2000)
    private String resolutionDescription;

    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date resolutionDate;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }
    // NOUVEAU: Pour les statistiques
    private Long responseTimeMinutes;

    // NOUVEAU: Pour les notes
    private Integer adminRating;
    private String adminRatingComment;


    /*@PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }*/

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
        // Calcul du temps de réponse si c'est la première réponse
        if (this.adminResponse != null && this.responseTimeMinutes == null && this.createdAt != null) {
            long diffInMillies = new Date().getTime() - this.createdAt.getTime();
            this.responseTimeMinutes = diffInMillies / (60 * 1000);
        }
    }
    // NOUVEAUX CHAMPS POUR L'ÉVALUATION
    private Integer rating; // 1 à 5
    private String ratingComment;// Commentaire optionnel

    @Temporal(TemporalType.TIMESTAMP)
    private Date ratingDate;

    // Nouvelle méthode pour vérifier si le ticket peut être évalué
    public boolean canBeRated() {
        return this.status == TicketStatus.RESOLVED || this.status == TicketStatus.CLOSED;
    }
}