package esprit.tn.payment.Controller;

import esprit.tn.payment.DTO.BulkUpdateDTO;
import esprit.tn.payment.DTO.CompletePaymentDTO;
import esprit.tn.payment.DTO.PaymentFilterDTO;
import esprit.tn.payment.DTO.PaymentResponseDTO;
import esprit.tn.payment.DTO.PaymentRequestDTO;
import esprit.tn.payment.DTO.PaymentStatsDTO;
import esprit.tn.payment.Service.PaymentService;
import esprit.tn.payment.Service.StripeService;
import esprit.tn.payment.entity.Payment;
import esprit.tn.payment.entity.PaymentStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeService stripeService;
    private final esprit.tn.payment.Repository.PaymentRepository paymentRepository;

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = paymentService.createPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/filter")
    public ResponseEntity<Page<PaymentResponseDTO>> getAllPaymentsWithFilters(
            @RequestBody PaymentFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(paymentService.getAllPaymentsWithFilters(filter, pageable));
    }

    @GetMapping
    public ResponseEntity<Page<PaymentResponseDTO>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(paymentService.getAllPayments(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PaymentResponseDTO>> getPaymentsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PaymentResponseDTO>> searchPayments(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        return ResponseEntity.ok(paymentService.searchPayments(q, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<PaymentResponseDTO> completePayment(
            @PathVariable Long id,
            @Valid @RequestBody CompletePaymentDTO request) {
        return ResponseEntity.ok(paymentService.completePayment(id, request));
    }

    @PostMapping("/bulk/status")
    public ResponseEntity<List<PaymentResponseDTO>> bulkUpdateStatus(@RequestBody BulkUpdateDTO bulkUpdate) {
        List<PaymentResponseDTO> updatedPayments = paymentService.bulkUpdateStatus(
                bulkUpdate.getPaymentIds(),
                bulkUpdate.getNewStatus()
        );
        return ResponseEntity.ok(updatedPayments);
    }

    @PostMapping("/bulk/delete")
    public ResponseEntity<Void> bulkDelete(@RequestBody BulkUpdateDTO bulkUpdate) {
        paymentService.bulkDelete(bulkUpdate.getPaymentIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/advanced")
    public ResponseEntity<PaymentStatsDTO> getAdvancedStats() {
        return ResponseEntity.ok(paymentService.getAdvancedStats());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(paymentService.getStats());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<PaymentResponseDTO>> getRecentPayments(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(paymentService.getRecentPayments(limit));
    }

    @PostMapping("/export/csv")
    public ResponseEntity<String> exportToCSV(@RequestBody PaymentFilterDTO filter) {
        String csvContent = paymentService.exportToCSV(filter);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "payments.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvContent);
    }

    @PostMapping("/{id}/reminder")
    public ResponseEntity<Void> sendPaymentReminder(@PathVariable Long id) {
        paymentService.sendPaymentReminder(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // ── Stripe plan upgrade flow ──────────────────────────────────────────────

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, Object>> createStripeIntent(@RequestBody Map<String, Object> body) {
        try {
            double amount = Double.parseDouble(body.get("amount").toString());
            String planName = body.getOrDefault("planName", "PLAN").toString();
            Long userId = Long.parseLong(body.get("userId").toString());
            Map<String, Object> result = stripeService.createPaymentIntent(amount, planName, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/record-stripe")
    public ResponseEntity<Map<String, Object>> recordStripePayment(@RequestBody Map<String, Object> body) {
        try {
            String paymentIntentId = body.get("paymentIntentId").toString();
            com.stripe.model.PaymentIntent intent = stripeService.verifyPaymentIntent(paymentIntentId);

            if (!"succeeded".equals(intent.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Payment not confirmed by Stripe: " + intent.getStatus()));
            }

            Payment payment = new Payment();
            payment.setStripePaymentIntentId(paymentIntentId);
            payment.setUserId(Long.parseLong(body.get("userId").toString()));
            payment.setUserName(body.getOrDefault("userName", "unknown").toString());
            payment.setUserEmail(body.getOrDefault("userEmail", "").toString());
            payment.setFormationName(body.getOrDefault("planName", "PLAN") + " Plan Upgrade");
            payment.setAmount(new java.math.BigDecimal(body.get("amount").toString()));
            payment.setPaymentMethod("CREDIT_CARD");
            payment.setStatus(PaymentStatus.COMPLETED.name());

            Payment saved = paymentRepository.save(payment);
            return ResponseEntity.ok(Map.of(
                    "paymentReference", saved.getPaymentReference(),
                    "id", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Payment service is running!");
    }
}
