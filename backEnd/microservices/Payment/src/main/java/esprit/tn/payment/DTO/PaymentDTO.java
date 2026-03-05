package esprit.tn.payment.DTO;


import esprit.tn.payment.entity.PaymentMethod;
import esprit.tn.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private String paymentReference;
    private Long formationId;
    private String formationName;
    private Long userId;
    private String userName;
    private String userEmail;
    private Double amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}