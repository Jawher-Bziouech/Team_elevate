package esprit.tn.ticket;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Date;
import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketRequest request);
    TicketResponse respondToTicket(Long ticketId, Long adminId, String adminName, String response);
    TicketResponse editResponse(Long ticketId, Long adminId, String newResponse);
    Page<TicketResponse> getAllTicketsPaginated(Pageable pageable, Date startDate, Date endDate, Long ticketId, String trainerName, String status);
    List<TicketResponse> getAllTickets();
    List<TicketResponse> getUserTickets(Long userId);
    TicketResponse getTicketById(Long ticketId, Long userId, String userRole);
    TicketResponse resolveTicket(Long ticketId, Long userId, String userRole, String resolution);
    TicketResponse closeTicket(Long ticketId, Long userId, String userRole);
}
