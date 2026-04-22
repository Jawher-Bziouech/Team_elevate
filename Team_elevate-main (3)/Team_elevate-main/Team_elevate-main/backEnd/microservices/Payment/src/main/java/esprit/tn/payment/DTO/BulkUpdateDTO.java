package esprit.tn.payment.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUpdateDTO {
    private List<Long> paymentIds;
    private String newStatus;
    private String operation; // "UPDATE_STATUS", "DELETE"
}