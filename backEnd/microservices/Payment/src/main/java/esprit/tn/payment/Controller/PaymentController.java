package esprit.tn.payment.Controller;

import esprit.tn.payment.DTO.PaymentRequestDTO;
import esprit.tn.payment.DTO.PaymentResponseDTO;
import esprit.tn.payment.Service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    // 1. Créer un paiement
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(@RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = paymentService.createPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. Récupérer tous les paiements (avec pagination)
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

    // 3. Récupérer un paiement par ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // 4. Récupérer les paiements d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PaymentResponseDTO>> getPaymentsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId, pageable));
    }

    // 5. Rechercher des paiements
    @GetMapping("/search")
    public ResponseEntity<Page<PaymentResponseDTO>> searchPayments(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        return ResponseEntity.ok(paymentService.searchPayments(q, pageable));
    }

    // 6. Mettre à jour le statut
    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    // 7. Statistiques
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(paymentService.getStats());
    }

    // 8. Supprimer un paiement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // 9. Test
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Payment service is running!");
    }
}