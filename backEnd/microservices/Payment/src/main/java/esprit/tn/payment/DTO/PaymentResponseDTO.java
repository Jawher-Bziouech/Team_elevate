package esprit.tn.payment.DTO;


import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class PaymentResponseDTO {
    private Long id;
    private String paymentReference;
    private Long formationId;
    private String formationName;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal amount;
    private String status; // PENDING, COMPLETED, FAILED
    private String paymentMethod;
    private LocalDateTime paymentDate;
}
