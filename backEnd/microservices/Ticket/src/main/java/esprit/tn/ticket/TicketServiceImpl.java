package esprit.tn.ticket;

import esprit.tn.ticket.entity.Ticket;
import esprit.tn.ticket.entity.TicketStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final long EDIT_TIME_LIMIT = 30 * 60 * 1000;

    @Override
    public TicketResponse createTicket(TicketRequest request) {
        if (!"TRAINER".equals(request.getCreatedByRole()) &&
                !"TRAINEE".equals(request.getCreatedByRole())) {
            throw new RuntimeException("Seuls les TRAINERs et TRAINEEs peuvent créer des tickets");
        }

        Ticket ticket = Ticket.builder()
                .description(request.getDescription())
                .category(request.getCategory())
                .createdBy(request.getCreatedBy())
                .createdByRole(request.getCreatedByRole())
                .createdByName(request.getCreatedByName())
                .status(TicketStatus.OPEN)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToResponse(savedTicket);
    }

    @Override
    public TicketResponse respondToTicket(Long ticketId, Long adminId, String adminName, String response) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        ticket.setAdminId(adminId);
        ticket.setAdminName(adminName);
        ticket.setAdminResponse(response);
        ticket.setResponseDate(new Date());
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setResponseEditable(true);

        Ticket updatedTicket = ticketRepository.save(ticket);
        TicketResponse responseDTO = mapToResponse(updatedTicket);

        // Notification temps réel
        sendNotification(updatedTicket, "Votre ticket #" + ticketId + " a reçu une réponse");

        return responseDTO;
    }

    @Override
    public TicketResponse editResponse(Long ticketId, Long adminId, String newResponse) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        if (!ticket.getAdminId().equals(adminId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres réponses");
        }

        if (ticket.getResponseDate() != null) {
            long timeElapsed = new Date().getTime() - ticket.getResponseDate().getTime();
            if (timeElapsed > EDIT_TIME_LIMIT) {
                throw new RuntimeException("Délai de modification dépassé (30 minutes maximum)");
            }
        }

        ticket.setAdminResponse(newResponse);
        ticket.setResponseEditable(true);

        Ticket updatedTicket = ticketRepository.save(ticket);

        // Notification de modification
        sendNotification(updatedTicket, "La réponse à votre ticket #" + ticketId + " a été modifiée");

        return mapToResponse(updatedTicket);
    }

    private void sendNotification(Ticket ticket, String message) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("ticketId", ticket.getTicketId());
            notification.put("message", message);
            notification.put("adminResponse", ticket.getAdminResponse());
            notification.put("timestamp", new Date());

            messagingTemplate.convertAndSendToUser(
                    ticket.getCreatedBy().toString(),
                    "/queue/notifications",
                    notification
            );
        } catch (Exception e) {
            System.err.println("Erreur notification: " + e.getMessage());
        }
    }

    @Override
    public Page<TicketResponse> getAllTicketsPaginated(Pageable pageable, Date startDate, Date endDate,
                                                       Long ticketId, String trainerName, String status) {
        TicketStatus ticketStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                ticketStatus = TicketStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Ignorer
            }
        }

        Page<Ticket> ticketPage = ticketRepository.findTicketsWithFilters(
                startDate, endDate, ticketId, trainerName, ticketStatus, pageable);

        return ticketPage.map(this::mapToResponse);
    }

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getUserTickets(Long userId) {
        return ticketRepository.findByCreatedBy(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponse getTicketById(Long ticketId, Long userId, String userRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        if (!"ADMIN".equals(userRole) && !ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Vous n'avez pas accès à ce ticket");
        }

        return mapToResponse(ticket);
    }

    @Override
    public TicketResponse resolveTicket(Long ticketId, Long userId, String userRole, String resolution) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        if (!"ADMIN".equals(userRole) && !ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Non autorisé à résoudre ce ticket");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionDescription(resolution);
        ticket.setResolutionDate(new Date());

        Ticket updatedTicket = ticketRepository.save(ticket);

        sendNotification(updatedTicket, "Votre ticket #" + ticketId + " a été résolu");

        return mapToResponse(updatedTicket);
    }

    @Override
    public TicketResponse closeTicket(Long ticketId, Long userId, String userRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket non trouvé"));

        if (!"ADMIN".equals(userRole) && !ticket.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Non autorisé à fermer ce ticket");
        }

        ticket.setStatus(TicketStatus.CLOSED);

        Ticket updatedTicket = ticketRepository.save(ticket);

        sendNotification(updatedTicket, "Votre ticket #" + ticketId + " a été fermé");

        return mapToResponse(updatedTicket);
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setTicketId(ticket.getTicketId());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());
        response.setCategory(ticket.getCategory());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setCreatedByRole(ticket.getCreatedByRole());
        response.setCreatedByName(ticket.getCreatedByName());
        response.setAdminId(ticket.getAdminId());
        response.setAdminName(ticket.getAdminName());
        response.setAdminResponse(ticket.getAdminResponse());
        response.setResponseDate(ticket.getResponseDate());

        if (ticket.getResponseDate() != null) {
            long timeElapsed = new Date().getTime() - ticket.getResponseDate().getTime();
            response.setResponseEditable(timeElapsed <= EDIT_TIME_LIMIT);
        }

        response.setResolutionDescription(ticket.getResolutionDescription());
        response.setResolutionDate(ticket.getResolutionDate());

        return response;
    }
}