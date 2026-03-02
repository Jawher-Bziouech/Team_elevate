package esprit.tn.ticket;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // 1. Créer un ticket
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    // 2. Répondre à un ticket
    @PostMapping("/{ticketId}/respond")
    public ResponseEntity<TicketResponse> respondToTicket(
            @PathVariable Long ticketId,
            @RequestParam Long adminId,
            @RequestParam String adminName,
            @RequestBody Map<String, String> request) {
        String response = request.get("response");
        return ResponseEntity.ok(ticketService.respondToTicket(ticketId, adminId, adminName, response));
    }

    // 3. Évaluer un ticket (NOUVEAU)
    @PostMapping("/{ticketId}/rate")
    public ResponseEntity<TicketResponse> rateTicket(
            @PathVariable Long ticketId,
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestBody RatingRequest ratingRequest) {
        return ResponseEntity.ok(ticketService.rateTicket(ticketId, userId, userRole, ratingRequest));
    }

    // 4. Modifier une réponse
    @PutMapping("/{ticketId}/edit-response")
    public ResponseEntity<TicketResponse> editResponse(
            @PathVariable Long ticketId,
            @RequestParam Long adminId,
            @RequestBody String newResponse) {
        return ResponseEntity.ok(ticketService.editResponse(ticketId, adminId, newResponse));
    }

    // 5. Récupérer tous les tickets (admin avec pagination)
    @GetMapping("/admin/all")
    public ResponseEntity<Page<TicketResponse>> getAllTicketsPaginated(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) Long ticketId,
            @RequestParam(required = false) String trainerName,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ticketService.getAllTicketsPaginated(pageable, startDate, endDate, ticketId, trainerName, status));
    }

    // 6. Récupérer tous les tickets (liste simple)
    @GetMapping("/admin/all-simple")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // 7. Récupérer les tickets d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponse>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }

    // 8. Récupérer un ticket par ID
    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long ticketId,
            @RequestParam Long userId,
            @RequestParam String userRole) {
        return ResponseEntity.ok(ticketService.getTicketById(ticketId, userId, userRole));
    }

    // 9. Résoudre un ticket
    @PostMapping("/{ticketId}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            @PathVariable Long ticketId,
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestBody String resolution) {
        return ResponseEntity.ok(ticketService.resolveTicket(ticketId, userId, userRole, resolution));
    }

    // 10. Fermer un ticket
    @PostMapping("/{ticketId}/close")
    public ResponseEntity<TicketResponse> closeTicket(
            @PathVariable Long ticketId,
            @RequestParam Long userId,
            @RequestParam String userRole) {
        return ResponseEntity.ok(ticketService.closeTicket(ticketId, userId, userRole));
    }

    @Value("${welcome.message}")
    private String welcomeMessage;

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }
}