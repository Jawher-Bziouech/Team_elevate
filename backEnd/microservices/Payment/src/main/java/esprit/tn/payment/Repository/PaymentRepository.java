package esprit.tn.payment.Repository;

import esprit.tn.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Trouver par utilisateur
    Page<Payment> findByUserId(Long userId, Pageable pageable);

    // Trouver par formation
    Page<Payment> findByFormationId(Long formationId, Pageable pageable);

    // Trouver par statut
    Page<Payment> findByStatus(String status, Pageable pageable);

    // Recherche
    @Query("SELECT p FROM Payment p WHERE " +
            "LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.formationName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Payment> searchPayments(@Param("search") String search, Pageable pageable);

    // Statistiques
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED'")
    Long getTotalSuccessfulPayments();
}