package esprit.tn.payment.Repository;

import esprit.tn.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Trouver par utilisateur
    Page<Payment> findByUserId(Long userId, Pageable pageable);

    // Trouver par formation
    Page<Payment> findByFormationId(Long formationId, Pageable pageable);

    // Trouver par statut
    Page<Payment> findByStatus(String status, Pageable pageable);

    // Trouver par méthode de paiement
    Page<Payment> findByPaymentMethod(String paymentMethod, Pageable pageable);

    // Recherche avancée avec filtres multiples
    @Query("SELECT p FROM Payment p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod) AND " +
            "(:dateFrom IS NULL OR p.paymentDate >= :dateFrom) AND " +
            "(:dateTo IS NULL OR p.paymentDate <= :dateTo) AND " +
            "(:amountMin IS NULL OR p.amount >= :amountMin) AND " +
            "(:amountMax IS NULL OR p.amount <= :amountMax) AND " +
            "(:search IS NULL OR LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(p.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(p.formationName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payment> findWithFilters(
            @Param("status") String status,
            @Param("paymentMethod") String paymentMethod,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("amountMin") BigDecimal amountMin,
            @Param("amountMax") BigDecimal amountMax,
            @Param("search") String search,
            Pageable pageable);

    // Recherche basique
    @Query("SELECT p FROM Payment p WHERE " +
            "LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.formationName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Payment> searchPayments(@Param("search") String search, Pageable pageable);

    // Statistiques de base
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED'")
    Long getTotalSuccessfulPayments();

    // Statistiques avancées
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'PENDING'")
    Long getPendingPaymentsCount();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'FAILED'")
    Long getFailedPaymentsCount();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'REFUNDED'")
    Long getRefundedPaymentsCount();

    @Query("SELECT AVG(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal getAveragePaymentAmount();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND YEAR(p.paymentDate) = YEAR(CURRENT_DATE) AND MONTH(p.paymentDate) = MONTH(CURRENT_DATE)")
    BigDecimal getMonthlyRevenue();

    // Paiements récents (30 derniers jours)
    @Query("SELECT p FROM Payment p WHERE p.paymentDate >= :date ORDER BY p.paymentDate DESC")
    List<Payment> findRecentPayments(@Param("date") LocalDateTime date, Pageable pageable);

    // Trouver par IDs pour opérations en masse
    List<Payment> findByIdIn(List<Long> ids);

    // Compter par statut
    @Query("SELECT p.status, COUNT(p) FROM Payment p GROUP BY p.status")
    List<Object[]> countByStatus();

    // Compter par méthode de paiement
    @Query("SELECT p.paymentMethod, COUNT(p) FROM Payment p GROUP BY p.paymentMethod")
    List<Object[]> countByPaymentMethod();
}