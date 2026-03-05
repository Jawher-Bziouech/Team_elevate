package esprit.tn.payment.Service;

import esprit.tn.payment.DTO.PaymentRequestDTO;
import esprit.tn.payment.DTO.PaymentResponseDTO;
import esprit.tn.payment.entity.Payment;
import esprit.tn.payment.Repository.PaymentRepository;
import esprit.tn.payment.entity.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    // 1. CRÉER UN PAIEMENT
    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {
        log.info("Création d'un paiement pour l'utilisateur: {}", request.getUserEmail());

        Payment payment = new Payment();
        payment.setFormationId(request.getFormationId());
        payment.setFormationName(request.getFormationName());
        payment.setUserId(request.getUserId());
        payment.setUserName(request.getUserName());
        payment.setUserEmail(request.getUserEmail());

        // Conversion: Double → BigDecimal
        if (request.getAmount() != null) {
            payment.setAmount(BigDecimal.valueOf(request.getAmount()));
        }

        // Conversion: PaymentMethod (enum) → String
        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(request.getPaymentMethod().name());
        }

        // Simuler le traitement du paiement
        try {
            Thread.sleep(500);
            payment.setStatus(PaymentStatus.COMPLETED.name());  // ← Correction: .name()
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED.name());      // ← Correction: .name()
            log.error("Erreur lors du paiement", e);
        }

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    // 2. RÉCUPÉRER TOUS LES PAIEMENTS
    public Page<PaymentResponseDTO> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    // 3. RÉCUPÉRER UN PAIEMENT PAR ID
    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé avec l'id: " + id));
        return mapToResponse(payment);
    }

    // 4. RÉCUPÉRER LES PAIEMENTS D'UN UTILISATEUR
    public Page<PaymentResponseDTO> getPaymentsByUser(Long userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    // 5. RECHERCHER DES PAIEMENTS
    public Page<PaymentResponseDTO> searchPayments(String search, Pageable pageable) {
        return paymentRepository.searchPayments(search, pageable)
                .map(this::mapToResponse);
    }

    // 6. METTRE À JOUR LE STATUT
    public PaymentResponseDTO updatePaymentStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé avec l'id: " + id));

        // Vérifier si le statut est valide
        try {
            PaymentStatus.valueOf(status);
            payment.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide: " + status);
        }

        return mapToResponse(paymentRepository.save(payment));
    }

    // 7. STATISTIQUES
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        BigDecimal totalRevenue = paymentRepository.getTotalRevenue();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        Long totalSuccessfulPayments = paymentRepository.getTotalSuccessfulPayments();
        stats.put("totalSuccessfulPayments", totalSuccessfulPayments != null ? totalSuccessfulPayments : 0L);

        // Ajouter le nombre total de paiements
        stats.put("totalPayments", paymentRepository.count());

        return stats;
    }

    // 8. SUPPRIMER UN PAIEMENT
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Paiement non trouvé avec l'id: " + id);
        }
        paymentRepository.deleteById(id);
        log.info("Paiement supprimé avec l'id: {}", id);
    }

    // 9. MAPPER (Conversion Entité → DTO)
    private PaymentResponseDTO mapToResponse(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();

        dto.setId(payment.getId());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setFormationId(payment.getFormationId());
        dto.setFormationName(payment.getFormationName());
        dto.setUserId(payment.getUserId());
        dto.setUserName(payment.getUserName());
        dto.setUserEmail(payment.getUserEmail());

        // Conversion: BigDecimal → Double
        if (payment.getAmount() != null) {
            dto.setAmount(payment.getAmount());
        }

        dto.setStatus(payment.getStatus());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentDate(payment.getPaymentDate());

        return dto;
    }
}