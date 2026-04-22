package esprit.tn.payment.mapper;

import esprit.tn.payment.entity.Payment;
import esprit.tn.payment.DTO.PaymentDTO;
import esprit.tn.payment.DTO.PaymentRequestDTO;
import esprit.tn.payment.entity.PaymentMethod;
import esprit.tn.payment.entity.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component  // Cette annotation est importante pour l'injection
public class PaymentMapper {

    /**
     * Convertit PaymentRequestDTO en entité Payment
     */
    public Payment toEntity(PaymentRequestDTO requestDTO) {
        if (requestDTO == null) {
            return null;
        }

        Payment payment = new Payment();
        payment.setFormationId(requestDTO.getFormationId());
        payment.setFormationName(requestDTO.getFormationName());
        payment.setUserId(requestDTO.getUserId());
        payment.setUserName(requestDTO.getUserName());
        payment.setUserEmail(requestDTO.getUserEmail());
        payment.setAmount(BigDecimal.valueOf(requestDTO.getAmount()));
        payment.setPaymentMethod(requestDTO.getPaymentMethod().toString());

        return payment;
    }

    /**
     * Convertit une entité Payment en PaymentDTO
     */
    public PaymentDTO toDto(Payment payment) {
        if (payment == null) {
            return null;
        }

        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setFormationId(payment.getFormationId());
        dto.setFormationName(payment.getFormationName());
        dto.setUserId(payment.getUserId());
        dto.setUserName(payment.getUserName());
        dto.setUserEmail(payment.getUserEmail());
        dto.setAmount(payment.getAmount().doubleValue());
        dto.setStatus(PaymentStatus.valueOf(payment.getStatus()));
        dto.setPaymentMethod(PaymentMethod.valueOf(payment.getPaymentMethod()));
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());

        return dto;
    }

    /**
     * Met à jour une entité existante à partir d'un DTO
     */
    public void updateEntityFromDto(PaymentRequestDTO requestDTO, Payment payment) {
        if (requestDTO == null || payment == null) {
            return;
        }

        payment.setFormationId(requestDTO.getFormationId());
        payment.setFormationName(requestDTO.getFormationName());
        payment.setUserId(requestDTO.getUserId());
        payment.setUserName(requestDTO.getUserName());
        payment.setUserEmail(requestDTO.getUserEmail());
        payment.setAmount(BigDecimal.valueOf(requestDTO.getAmount()));
        payment.setPaymentMethod(String.valueOf(requestDTO.getPaymentMethod()));
    }
}
