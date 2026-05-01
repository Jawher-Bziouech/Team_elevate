package tn.esprit.internship.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.internship.dto.InternshipApplicationRequest;
import tn.esprit.internship.model.InternshipOffer;
import tn.esprit.internship.repository.InternshipApplicationRepository;
import tn.esprit.internship.repository.InternshipOfferRepository;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InternshipServiceImplTest {

    @Mock
    private InternshipOfferRepository internshipOfferRepository;

    @Mock
    private InternshipApplicationRepository internshipApplicationRepository;

    @InjectMocks
    private InternshipServiceImpl internshipService;

    private InternshipOffer offer;
    private InternshipApplicationRequest request;

    @BeforeEach
    void setUp() {
        // Setup a valid, active internship offer
        offer = InternshipOffer.builder()
                .id(10L)
                .title("Software Engineering Intern")
                .active(true)
                .expiryDate(LocalDate.now().plusDays(30)) // Expires in the future
                .build();

        // Setup a basic application request
        request = new InternshipApplicationRequest();
        request.setStudentUserId(5L);
        request.setMotivationLetter("I would love to join your team!");
    }

    // =========================================================================
    // TEST B: THE DUPLICATE RULE
    // =========================================================================
    @Test
    void testApplyToOffer_WhenAlreadyApplied_ThrowsException() {
        // Arrange
        // 1. Pretend the database finds the active offer
        when(internshipOfferRepository.findById(10L)).thenReturn(Optional.of(offer));

        // 2. IMPORTANT: Pretend the database says the student HAS already applied!
        when(internshipApplicationRepository.existsByInternshipOfferIdAndStudentUserId(10L, 5L)).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            internshipService.applyToOffer(10L, request, 5L);
        });

        // Verify the business logic error message matches exactly
        assertEquals("You have already applied for this internship.", exception.getMessage());
        
        // Verify we NEVER tried to save a duplicate application to the database
        verify(internshipApplicationRepository, never()).save(any());
    }
}
