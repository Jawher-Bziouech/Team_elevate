package esprit.tn.payment.Service;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentStats {
    private Double totalRevenue;
    private Long totalSuccessfulPayments;
}
