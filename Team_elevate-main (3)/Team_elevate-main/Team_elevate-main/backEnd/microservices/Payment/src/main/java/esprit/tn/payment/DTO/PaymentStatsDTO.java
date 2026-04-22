package esprit.tn.payment.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatsDTO {
    private BigDecimal totalRevenue;
    private Long totalSuccessfulPayments;
    private Long totalPayments;
    private Long pendingPayments;
    private Long failedPayments;
    private Long refundedPayments;
    private BigDecimal averagePaymentAmount;
    private BigDecimal monthlyRevenue;
    private Map<String, Long> paymentsByStatus;
    private Map<String, Long> paymentsByMethod;
}