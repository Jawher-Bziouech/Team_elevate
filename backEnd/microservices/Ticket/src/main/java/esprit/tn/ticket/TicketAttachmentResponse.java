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
public class TicketAttachmentResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Date uploadedAt;
    private String downloadUrl;
}
