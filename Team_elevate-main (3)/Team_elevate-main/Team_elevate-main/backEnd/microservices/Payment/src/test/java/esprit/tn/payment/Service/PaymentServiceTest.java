package esprit.tn.payment.Service;

import esprit.tn.payment.DTO.PaymentRequestDTO;
import esprit.tn.payment.Exception.PaymentException;
import esprit.tn.payment.Repository.PaymentRepository;
import esprit.tn.payment.client.FormationClient;
import esprit.tn.payment.client.dto.FormationSummaryDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private FormationClient formationClient;

    @InjectMocks
    private PaymentService paymentService;

    private PaymentRequestDTO paymentRequest;
    private FormationSummaryDTO mockFormation;

    @BeforeEach
    void setUp() {
        // Setup a basic payment request
        paymentRequest = new PaymentRequestDTO();
        paymentRequest.setFormationId(1L);
        paymentRequest.setUserId(100L);
        paymentRequest.setUserEmail("user@test.com");
        paymentRequest.setUserName("John Doe");

        // Setup a basic mock formation returned from the client
        mockFormation = new FormationSummaryDTO();
        mockFormation.setId(1L);
        mockFormation.setTitre("Java Masterclass");
    }

    // =========================================================================
    // TEST A: THE "SOLD OUT" RULE
    // =========================================================================
    @Test
    void testCreatePayment_WhenFormationIsSoldOut_ThrowsException() {
        // Arrange
        mockFormation.setPlacesDisponibles(0); // 0 seats left!
        mockFormation.setPrix(50.0);
        paymentRequest.setAmount(50.0); // Correct amount

        // Pretend the Formation microservice returns our sold-out formation
        when(formationClient.getFormationById(1L)).thenReturn(mockFormation);

        // Act & Assert
        PaymentException exception = assertThrows(PaymentException.class, () -> {
            paymentService.createPayment(paymentRequest);
        });

        // Verify the business logic error message matches exactly
        assertEquals("Cette formation est complete. Le paiement est refuse.", exception.getMessage());
        
        // Verify we NEVER tried to save a payment to the database
        verify(paymentRepository, never()).save(any());
    }

    // =========================================================================
    // TEST B: THE "OVERPAY" RULE
    // =========================================================================
    @Test
    void testCreatePayment_WhenAmountExceedsPrice_ThrowsException() {
        // Arrange
        mockFormation.setPlacesDisponibles(10); // Plenty of seats
        mockFormation.setPrix(50.0); // The course costs 50
        
        paymentRequest.setAmount(100.0); // User tries to send 100! (Fraud / Error)

        // Pretend the Formation microservice returns our formation
        when(formationClient.getFormationById(1L)).thenReturn(mockFormation);

        // Act & Assert
        PaymentException exception = assertThrows(PaymentException.class, () -> {
            paymentService.createPayment(paymentRequest);
        });

        // Verify the business logic error message matches exactly
        assertEquals("Le montant envoye ne peut pas depasser le prix de la formation.", exception.getMessage());
        
        // Verify we NEVER tried to save a payment to the database
        verify(paymentRepository, never()).save(any());
    }
}
