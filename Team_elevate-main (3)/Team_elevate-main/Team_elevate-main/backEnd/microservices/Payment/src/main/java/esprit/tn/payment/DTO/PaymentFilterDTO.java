package esprit.tn.payment.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFilterDTO {
    private String status;
    private String paymentMethod;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private BigDecimal amountMin;
    private BigDecimal amountMax;
    private String search;
    private List<String> statuses;
    private List<String> paymentMethods;
}