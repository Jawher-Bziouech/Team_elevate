package esprit.tn.ticket;

import esprit.tn.ticket.entity.Ticket;
import esprit.tn.ticket.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedBy(Long createdBy);

    List<Ticket> findByAdminId(Long adminId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAdminResponseIsNull();

    @Query("SELECT t FROM Ticket t WHERE " +
            "(:startDate IS NULL OR t.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR t.createdAt <= :endDate) AND " +
            "(:ticketId IS NULL OR t.ticketId = :ticketId) AND " +
            "(:trainerName IS NULL OR LOWER(t.createdByName) LIKE LOWER(CONCAT('%', :trainerName, '%'))) AND " +
            "(:status IS NULL OR t.status = :status)")
    Page<Ticket> findTicketsWithFilters(
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            @Param("ticketId") Long ticketId,
            @Param("trainerName") String trainerName,
            @Param("status") TicketStatus status,
            Pageable pageable);
}