package skillup.demo.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import skillup.demo.model.Formation;
import skillup.demo.model.Inscription;
import skillup.demo.model.User;
import skillup.demo.repository.FormationRepository;
import skillup.demo.repository.InscriptionRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InscriptionServiceTest {

    @Mock
    private InscriptionRepository inscriptionRepository;

    @Mock
    private FormationRepository formationRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private InscriptionService inscriptionService;

    private Formation formation;
    private User user;

    @BeforeEach
    void setUp() {
        formation = new Formation();
        formation.setId(1L);
        formation.setTitre("Spring Boot Formation");
        formation.setPlacesDisponibles(10); // Start with 10 places

        user = new User();
        user.setEmail("test@test.com");
        user.setNom("Doe");
        user.setPrenom("John");
    }

    // =========================================================================
    // TEST: SUCCESSFUL ENROLLMENT
    // =========================================================================
    @Test
    void testInscrireConnecte_Success() {
        // Arrange
        when(userClient.getUserByEmail("test@test.com")).thenReturn(user);
        when(formationRepository.findById(1L)).thenReturn(Optional.of(formation));
        when(inscriptionRepository.existsByEmailAndFormationId("test@test.com", 1L)).thenReturn(false);
        
        // Mock save returning the saved entity
        when(inscriptionRepository.save(any(Inscription.class))).thenAnswer(i -> {
            Inscription saved = i.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        // Act
        Inscription result = inscriptionService.inscrireConnecte(1L, "test@test.com");

        // Assert
        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
        assertEquals("INSCRIT", result.getStatut());
        
        // Very important business logic: places available should decrease by 1
        assertEquals(9, formation.getPlacesDisponibles(), "Places disponibles must be decremented");
        
        // Verify repository save and email service called
        verify(formationRepository, times(1)).save(formation);
        verify(emailService, times(1)).envoyerConfirmationInscription(any(), eq(formation));
    }
}
