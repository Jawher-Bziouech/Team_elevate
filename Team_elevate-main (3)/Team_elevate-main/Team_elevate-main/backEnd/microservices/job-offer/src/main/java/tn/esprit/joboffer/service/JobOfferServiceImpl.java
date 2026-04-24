package tn.esprit.joboffer.service;

import org.springframework.stereotype.Service;
import tn.esprit.joboffer.client.EntrepriseClient;
import tn.esprit.joboffer.dto.EntrepriseDto;
import tn.esprit.joboffer.dto.FirmDto;
import tn.esprit.joboffer.dto.IndustryCountDto;
import tn.esprit.joboffer.dto.JobOfferRequest;
import tn.esprit.joboffer.dto.JobOfferResponse;
import tn.esprit.joboffer.entity.Firm;
import tn.esprit.joboffer.entity.JobOffer;
import tn.esprit.joboffer.repository.FirmRepository;
import tn.esprit.joboffer.repository.JobOfferRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobOfferServiceImpl implements JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final FirmRepository firmRepository;
    private final EntrepriseClient entrepriseClient;

    public JobOfferServiceImpl(JobOfferRepository jobOfferRepository,
                               FirmRepository firmRepository,
                               EntrepriseClient entrepriseClient) {
        this.jobOfferRepository = jobOfferRepository;
        this.firmRepository = firmRepository;
        this.entrepriseClient = entrepriseClient;
    }

    // Convert entity to DTO — enriches with Entreprise MS data when entrepriseId is set
    private JobOfferResponse convertToResponse(JobOffer jobOffer) {
        JobOfferResponse response = new JobOfferResponse();
        response.setOpportunityId(jobOffer.getOpportunityId());
        response.setJobTitle(jobOffer.getJobTitle());
        response.setIndustry(jobOffer.getIndustry());
        response.setLocation(jobOffer.getLocation());
        response.setSalaryRange(jobOffer.getSalaryRange());

        // Local Firm (legacy)
        if (jobOffer.getFirm() != null) {
            FirmDto firmDto = new FirmDto();
            firmDto.setId(jobOffer.getFirm().getId());
            firmDto.setNom(jobOffer.getFirm().getNom());
            firmDto.setSpecialite(jobOffer.getFirm().getSpecialite());
            response.setFirm(firmDto);
        }

        // Cross-service Entreprise enrichment (fallback to "Unknown Company" if MS is down)
        if (jobOffer.getEntrepriseId() != null) {
            response.setEntrepriseId(jobOffer.getEntrepriseId());
            try {
                EntrepriseDto e = entrepriseClient.getById(jobOffer.getEntrepriseId());
                response.setEntrepriseNom(e.getNom());
                response.setEntrepriseSecteur(e.getSecteur());
                response.setEntrepriseLogo(e.getLogo());
                response.setEntrepriseAdresse(e.getAdresse());
            } catch (Exception ex) {
                response.setEntrepriseNom("Unknown Company");
            }
        }

        return response;
    }

    @Override
    public List<JobOfferResponse> getAllJobOffers() {
        return jobOfferRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<JobOfferResponse> getJobOfferById(Long id) {
        return jobOfferRepository.findById(id)
                .map(this::convertToResponse);
    }

    @Override
    public JobOfferResponse createJobOffer(JobOfferRequest request) {
        // Validate entrepriseId via Feign
        if (request.getEntrepriseId() != null) {
            try {
                EntrepriseDto e = entrepriseClient.getById(request.getEntrepriseId());
                if (e == null || e.getNom() == null) {
                    throw new RuntimeException("Entreprise not found with id: " + request.getEntrepriseId());
                }
            } catch (RuntimeException ex) {
                throw ex;
            } catch (Exception ex) {
                throw new RuntimeException("Could not reach Entreprise service");
            }
        }

        JobOffer jobOffer = new JobOffer();
        jobOffer.setJobTitle(request.getJobTitle());
        if (request.getFirmId() != null) {
            Firm firm = firmRepository.findById(request.getFirmId())
                    .orElseThrow(() -> new RuntimeException("Firm not found with id: " + request.getFirmId()));
            jobOffer.setFirm(firm);
        }
        jobOffer.setEntrepriseId(request.getEntrepriseId());
        jobOffer.setIndustry(request.getIndustry());
        jobOffer.setLocation(request.getLocation());
        jobOffer.setSalaryRange(request.getSalaryRange());

        return convertToResponse(jobOfferRepository.save(jobOffer));
    }

    @Override
    public JobOfferResponse updateJobOffer(Long id, JobOfferRequest request) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JobOffer not found with id: " + id));

        jobOffer.setJobTitle(request.getJobTitle());
        jobOffer.setIndustry(request.getIndustry());
        jobOffer.setLocation(request.getLocation());
        jobOffer.setSalaryRange(request.getSalaryRange());

        if (request.getFirmId() != null) {
            Firm firm = firmRepository.findById(request.getFirmId())
                    .orElseThrow(() -> new RuntimeException("Firm not found with id: " + request.getFirmId()));
            jobOffer.setFirm(firm);
        }
        if (request.getEntrepriseId() != null) {
            jobOffer.setEntrepriseId(request.getEntrepriseId());
        }

        return convertToResponse(jobOfferRepository.save(jobOffer));
    }

    @Override
    public void deleteJobOffer(Long id) {
        jobOfferRepository.deleteById(id);
    }

    @Override
    public List<JobOfferResponse> getByEntrepriseId(Long entrepriseId) {
        return jobOfferRepository.findByEntrepriseId(entrepriseId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobOfferResponse> getJobOffersByCompany(String company) {
        return jobOfferRepository.findByFirmNomIgnoreCase(company)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobOfferResponse> getJobOffersByIndustry(String industry) {
        return jobOfferRepository.findByIndustryIgnoreCase(industry)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobOfferResponse> getJobOffersByLocation(String location) {
        return jobOfferRepository.findByLocationIgnoreCase(location)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobOfferResponse> searchJobOffers(String company, String industry, String location,
                                                   Integer minSalary, Integer maxSalary) {
        return jobOfferRepository.searchAll(company, industry, location, minSalary, maxSalary)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobOfferResponse> getJobOffersBySalaryRange(String minSalary, String maxSalary) {
        return jobOfferRepository.findBySalaryRangeBetween(minSalary, maxSalary)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<IndustryCountDto> getJobCountByIndustry() {
        return jobOfferRepository.countJobOffersByIndustry();
    }
}
