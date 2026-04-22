package esprit.tn.payment.DTO;

import esprit.tn.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompletePaymentDTO {

    @NotNull(message = "Methode de paiement est requise")
    private PaymentMethod paymentMethod;
}
