package esprit.tn.ticket;

import esprit.tn.ticket.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketTicketId(Long ticketId);
    void deleteByTicketTicketId(Long ticketId);
}
