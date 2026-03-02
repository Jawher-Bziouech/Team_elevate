package esprit.tn.ticket;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TicketRequest {
    private String description;
    private String category;
    private Long createdBy;
    private String createdByRole;
    private String createdByName;
    //private MultipartFile[] attachments;
}