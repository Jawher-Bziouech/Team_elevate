package esprit.tn.ticket;


import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageResponse {
    private Long messageId;
    private String content;
    private Long senderId;
    private String senderRole;
    private String senderUsername;
    private Date sentAt;
    private boolean canBeEdited; // Pour vérifier si l'ADMIN peut encore modifier
}