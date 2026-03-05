package esprit.tn.payment.DTO;


import esprit.tn.payment.entity.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "Formation ID est requis")
    private Long formationId;

    @NotBlank(message = "Nom de la formation est requis")
    private String formationName;

    @NotNull(message = "User ID est requis")
    private Long userId;

    @NotBlank(message = "Nom de l'utilisateur est requis")
    private String userName;

    @Email(message = "Email invalide")
    @NotBlank(message = "Email est requis")
    private String userEmail;

    @NotNull(message = "Montant est requis")
    @Positive(message = "Le montant doit être positif")
    private Double amount;

    @NotNull(message = "Méthode de paiement est requise")
    private PaymentMethod paymentMethod;
}