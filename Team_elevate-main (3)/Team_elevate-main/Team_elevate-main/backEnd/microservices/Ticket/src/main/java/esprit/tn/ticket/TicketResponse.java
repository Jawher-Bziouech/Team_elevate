package esprit.tn.ticket;

import esprit.tn.ticket.entity.TicketStatus;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class TicketResponse {
    private Long ticketId;
    private String description;
    private TicketStatus status;
    private String category;
    private Date createdAt;
    private Date updatedAt;

    private Long createdBy;
    private String createdByRole;
    private String createdByName;

    private Long adminId;
    private String adminName;
    private String adminResponse;
    private Date responseDate;
    private boolean responseEditable;

    private String resolutionDescription;
    private Date resolutionDate;
    private Integer rating;
    private String ratingComment;
    private Date ratingDate;
    private boolean canBeRated;

}