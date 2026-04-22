package esprit.tn.payment.DTO;

import esprit.tn.payment.entity.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "Formation ID est requis")
    private Long formationId;

    private String formationName;

    @NotNull(message = "User ID est requis")
    private Long userId;

    @NotBlank(message = "Nom de l'utilisateur est requis")
    private String userName;

    @Email(message = "Email invalide")
    @NotBlank(message = "Email est requis")
    private String userEmail;

    @NotNull(message = "Montant est requis")
    @Positive(message = "Le montant doit etre positif")
    private Double amount;

    private PaymentMethod paymentMethod;
}
