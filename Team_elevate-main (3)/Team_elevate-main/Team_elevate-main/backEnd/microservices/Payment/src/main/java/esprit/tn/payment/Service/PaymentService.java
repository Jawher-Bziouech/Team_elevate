package esprit.tn.payment.Service;

import esprit.tn.payment.DTO.CompletePaymentDTO;
import esprit.tn.payment.DTO.PaymentFilterDTO;
import esprit.tn.payment.DTO.PaymentResponseDTO;
import esprit.tn.payment.DTO.PaymentStatsDTO;
import esprit.tn.payment.DTO.PaymentRequestDTO;
import esprit.tn.payment.Exception.PaymentException;
import esprit.tn.payment.Exception.ResourceNotFoundException;
import esprit.tn.payment.Repository.PaymentRepository;
import esprit.tn.payment.client.FormationClient;
import esprit.tn.payment.client.dto.FormationSummaryDTO;
import esprit.tn.payment.entity.Payment;
import esprit.tn.payment.entity.PaymentMethod;
import esprit.tn.payment.entity.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final FormationClient formationClient;

    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {
        log.info("Creation d'un paiement pour l'utilisateur: {}", request.getUserEmail());

        FormationSummaryDTO formation = formationClient.getFormationById(request.getFormationId());
        validateFormationForPayment(formation, request);

        Payment payment = new Payment();
        payment.setFormationId(formation.getId());
        payment.setFormationName(resolveFormationName(request, formation));
        payment.setUserId(request.getUserId());
        payment.setUserName(request.getUserName().trim());
        payment.setUserEmail(request.getUserEmail().trim().toLowerCase());
        payment.setAmount(BigDecimal.valueOf(request.getAmount()));

        PaymentMethod requestedMethod = request.getPaymentMethod();
        if (requestedMethod == null || requestedMethod == PaymentMethod.USER_CHOICE) {
            payment.setPaymentMethod(PaymentMethod.USER_CHOICE.name());
            payment.setStatus(PaymentStatus.PENDING.name());
        } else {
            payment.setPaymentMethod(requestedMethod.name());
            payment.setStatus(PaymentStatus.COMPLETED.name());
        }

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    public PaymentResponseDTO completePayment(Long id, CompletePaymentDTO request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouve avec l'id: " + id));

        PaymentMethod chosenMethod = request.getPaymentMethod();
        if (chosenMethod == PaymentMethod.USER_CHOICE) {
            throw new PaymentException("Une vraie methode de paiement doit etre selectionnee.");
        }

        if (!PaymentStatus.PENDING.name().equals(payment.getStatus())) {
            throw new PaymentException("Seuls les paiements en attente peuvent etre completes.");
        }

        payment.setPaymentMethod(chosenMethod.name());
        payment.setStatus(PaymentStatus.COMPLETED.name());
        payment.setPaymentDate(LocalDateTime.now());

        return mapToResponse(paymentRepository.save(payment));
    }

    public Page<PaymentResponseDTO> getAllPaymentsWithFilters(PaymentFilterDTO filter, Pageable pageable) {
        return paymentRepository.findWithFilters(
                filter.getStatus(),
                filter.getPaymentMethod(),
                filter.getDateFrom(),
                filter.getDateTo(),
                filter.getAmountMin(),
                filter.getAmountMax(),
                filter.getSearch(),
                pageable
        ).map(this::mapToResponse);
    }

    public Page<PaymentResponseDTO> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouve avec l'id: " + id));
        return mapToResponse(payment);
    }

    public Page<PaymentResponseDTO> getPaymentsByUser(Long userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    public Page<PaymentResponseDTO> searchPayments(String search, Pageable pageable) {
        return paymentRepository.searchPayments(search, pageable)
                .map(this::mapToResponse);
    }

    public PaymentResponseDTO updatePaymentStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouve avec l'id: " + id));

        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        try {
            PaymentStatus.valueOf(normalizedStatus);
            payment.setStatus(normalizedStatus);
        } catch (IllegalArgumentException e) {
            throw new PaymentException("Statut invalide: " + status);
        }

        return mapToResponse(paymentRepository.save(payment));
    }

    public List<PaymentResponseDTO> bulkUpdateStatus(List<Long> paymentIds, String newStatus) {
        List<Payment> payments = paymentRepository.findByIdIn(paymentIds);
        String normalizedStatus = newStatus == null ? "" : newStatus.trim().toUpperCase();

        try {
            PaymentStatus.valueOf(normalizedStatus);
        } catch (IllegalArgumentException e) {
            throw new PaymentException("Statut invalide: " + newStatus);
        }

        payments.forEach(payment -> payment.setStatus(normalizedStatus));
        List<Payment> savedPayments = paymentRepository.saveAll(payments);

        return savedPayments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void bulkDelete(List<Long> paymentIds) {
        List<Payment> payments = paymentRepository.findByIdIn(paymentIds);
        paymentRepository.deleteAll(payments);
        log.info("Paiements supprimes en masse: {}", paymentIds.size());
    }

    public PaymentStatsDTO getAdvancedStats() {
        PaymentStatsDTO stats = new PaymentStatsDTO();

        BigDecimal totalRevenue = paymentRepository.getTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        Long totalSuccessfulPayments = paymentRepository.getTotalSuccessfulPayments();
        stats.setTotalSuccessfulPayments(totalSuccessfulPayments != null ? totalSuccessfulPayments : 0L);

        stats.setTotalPayments(paymentRepository.count());
        stats.setPendingPayments(paymentRepository.getPendingPaymentsCount());
        stats.setFailedPayments(paymentRepository.getFailedPaymentsCount());
        stats.setRefundedPayments(paymentRepository.getRefundedPaymentsCount());
        stats.setAveragePaymentAmount(paymentRepository.getAveragePaymentAmount());
        stats.setMonthlyRevenue(paymentRepository.getMonthlyRevenue());
        stats.setPaymentsByStatus(getPaymentsCountByStatus());
        stats.setPaymentsByMethod(getPaymentsCountByMethod());

        return stats;
    }

    public List<PaymentResponseDTO> getRecentPayments(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return paymentRepository.findRecentPayments(thirtyDaysAgo, Pageable.ofSize(limit))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public String exportToCSV(PaymentFilterDTO filter) {
        List<Payment> payments = paymentRepository.findWithFilters(
                filter.getStatus(),
                filter.getPaymentMethod(),
                filter.getDateFrom(),
                filter.getDateTo(),
                filter.getAmountMin(),
                filter.getAmountMax(),
                filter.getSearch(),
                Pageable.unpaged()
        ).getContent();

        StringBuilder csv = new StringBuilder();
        csv.append("Reference,Formation,Utilisateur,Email,Montant,Statut,Methode,Date\n");

        for (Payment payment : payments) {
            csv.append(String.format("%s,%s,%s,%s,%.2f,%s,%s,%s\n",
                    payment.getPaymentReference(),
                    payment.getFormationName(),
                    payment.getUserName(),
                    payment.getUserEmail(),
                    payment.getAmount(),
                    payment.getStatus(),
                    payment.getPaymentMethod(),
                    payment.getPaymentDate().toString()
            ));
        }

        return csv.toString();
    }

    public void sendPaymentReminder(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouve"));

        log.info("Rappel de paiement envoye pour: {} - {}", payment.getPaymentReference(), payment.getUserEmail());
    }

    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Paiement non trouve avec l'id: " + id);
        }
        paymentRepository.deleteById(id);
        log.info("Paiement supprime avec l'id: {}", id);
    }

    private void validateFormationForPayment(FormationSummaryDTO formation, PaymentRequestDTO request) {
        if (formation == null || formation.getId() == null) {
            throw new ResourceNotFoundException("Formation introuvable avec l'id: " + request.getFormationId());
        }

        Integer placesDisponibles = formation.getPlacesDisponibles();
        if (placesDisponibles != null && placesDisponibles <= 0) {
            throw new PaymentException("Cette formation est complete. Le paiement est refuse.");
        }

        if (formation.getPrix() != null && request.getAmount() != null) {
            BigDecimal requestedAmount = BigDecimal.valueOf(request.getAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal formationPrice = BigDecimal.valueOf(formation.getPrix()).setScale(2, java.math.RoundingMode.HALF_UP);
            if (requestedAmount.compareTo(formationPrice) > 0) {
                throw new PaymentException("Le montant envoye ne peut pas depasser le prix de la formation.");
            }
        }
    }

    private String resolveFormationName(PaymentRequestDTO request, FormationSummaryDTO formation) {
        if (request.getFormationName() != null && !request.getFormationName().isBlank()) {
            return request.getFormationName().trim();
        }
        if (formation.getTitre() == null || formation.getTitre().isBlank()) {
            throw new PaymentException("Le nom de la formation n'est pas disponible.");
        }
        return formation.getTitre().trim();
    }

    private Map<String, Long> getPaymentsCountByStatus() {
        List<Object[]> results = paymentRepository.countByStatus();
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Long) result[1]
                ));
    }

    private Map<String, Long> getPaymentsCountByMethod() {
        List<Object[]> results = paymentRepository.countByPaymentMethod();
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Long) result[1]
                ));
    }

    public Map<String, Object> getStats() {
        PaymentStatsDTO advancedStats = getAdvancedStats();
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalRevenue", advancedStats.getTotalRevenue());
        stats.put("totalSuccessfulPayments", advancedStats.getTotalSuccessfulPayments());
        stats.put("totalPayments", advancedStats.getTotalPayments());
        stats.put("pendingPayments", advancedStats.getPendingPayments());
        stats.put("failedPayments", advancedStats.getFailedPayments());
        stats.put("refundedPayments", advancedStats.getRefundedPayments());
        stats.put("averagePaymentAmount", advancedStats.getAveragePaymentAmount());
        stats.put("monthlyRevenue", advancedStats.getMonthlyRevenue());

        return stats;
    }

    private PaymentResponseDTO mapToResponse(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(payment.getId());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setFormationId(payment.getFormationId());
        dto.setFormationName(payment.getFormationName());
        dto.setUserId(payment.getUserId());
        dto.setUserName(payment.getUserName());
        dto.setUserEmail(payment.getUserEmail());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setStripePaymentIntentId(payment.getStripePaymentIntentId());
        return dto;
    }
}
