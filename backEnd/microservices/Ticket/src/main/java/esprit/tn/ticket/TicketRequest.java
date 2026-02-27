package esprit.tn.ticket;

import lombok.Data;

@Data
public class TicketRequest {
    private String description;
    private String category;
    private Long createdBy;
    private String createdByRole;
    private String createdByName;
}