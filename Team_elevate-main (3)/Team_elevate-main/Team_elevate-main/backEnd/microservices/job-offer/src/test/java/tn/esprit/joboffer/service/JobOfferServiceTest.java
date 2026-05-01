package tn.esprit.joboffer.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.joboffer.client.EntrepriseClient;
import tn.esprit.joboffer.dto.EntrepriseDto;
import tn.esprit.joboffer.dto.JobOfferRequest;
import tn.esprit.joboffer.dto.JobOfferResponse;
import tn.esprit.joboffer.entity.JobOffer;
import tn.esprit.joboffer.repository.FirmRepository;
import tn.esprit.joboffer.repository.JobOfferRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JobOfferServiceTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private FirmRepository firmRepository;

    @Mock
    private EntrepriseClient entrepriseClient;

    @InjectMocks
    private JobOfferServiceImpl jobOfferService;

    private JobOffer jobOffer;
    private JobOfferRequest jobOfferRequest;
    private EntrepriseDto entrepriseDto;

    @BeforeEach
    void setUp() {
        jobOffer = new JobOffer();
        jobOffer.setOpportunityId(1L);
        jobOffer.setJobTitle("Software Engineer");
        jobOffer.setIndustry("IT");
        jobOffer.setLocation("Paris");
        jobOffer.setSalaryRange("50000-70000");
        jobOffer.setEntrepriseId(10L);

        jobOfferRequest = new JobOfferRequest();
        jobOfferRequest.setJobTitle("Software Engineer");
        jobOfferRequest.setIndustry("IT");
        jobOfferRequest.setLocation("Paris");
        jobOfferRequest.setSalaryRange("50000-70000");
        jobOfferRequest.setEntrepriseId(10L);

        entrepriseDto = new EntrepriseDto();
        entrepriseDto.setId(10L);
        entrepriseDto.setNom("Google");
        entrepriseDto.setSecteur("Tech");
    }

    @Test
    void testCreateJobOffer_Success() {
        // Mocking the Feign client call to validate entreprise
        when(entrepriseClient.getById(10L)).thenReturn(entrepriseDto);
        // Mocking the repository save
        when(jobOfferRepository.save(any(JobOffer.class))).thenReturn(jobOffer);

        JobOfferResponse response = jobOfferService.createJobOffer(jobOfferRequest);

        assertNotNull(response);
        assertEquals("Software Engineer", response.getJobTitle());
        assertEquals("Google", response.getEntrepriseNom());
        verify(jobOfferRepository, times(1)).save(any(JobOffer.class));
    }

    @Test
    void testCreateJobOffer_EntrepriseNotFound() {
        // Mocking the Feign client to return null or throw exception
        when(entrepriseClient.getById(10L)).thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            jobOfferService.createJobOffer(jobOfferRequest);
        });

        assertEquals("Entreprise not found with id: 10", exception.getMessage());
        verify(jobOfferRepository, never()).save(any(JobOffer.class));
    }

    @Test
    void testGetJobOfferById_Enrichment() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));
        when(entrepriseClient.getById(10L)).thenReturn(entrepriseDto);

        Optional<JobOfferResponse> response = jobOfferService.getJobOfferById(1L);

        assertTrue(response.isPresent());
        assertEquals("Google", response.get().getEntrepriseNom());
        assertEquals("Tech", response.get().getEntrepriseSecteur());
    }

    @Test
    void testGetJobOfferById_FallbackWhenEntrepriseServiceIsDown() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(jobOffer));
        // Mocking Feign client to throw exception
        when(entrepriseClient.getById(10L)).thenThrow(new RuntimeException("Service Down"));

        Optional<JobOfferResponse> response = jobOfferService.getJobOfferById(1L);

        assertTrue(response.isPresent());
        assertEquals("Unknown Company", response.get().getEntrepriseNom());
    }
}
