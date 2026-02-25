package tn.esprit.joboffer.service;

import tn.esprit.joboffer.dto.JobOfferRequest;
import tn.esprit.joboffer.dto.JobOfferResponse;

import java.util.List;
import java.util.Optional;

public interface JobOfferService {
    List<JobOfferResponse> getAllJobOffers();
    Optional<JobOfferResponse> getJobOfferById(Long id);
    JobOfferResponse createJobOffer(JobOfferRequest request);
    JobOfferResponse updateJobOffer(Long id, JobOfferRequest request);
    void deleteJobOffer(Long id);

    // Advanced business methods (to be added)
    List<JobOfferResponse> searchJobOffers(String company, String industry, String location, Integer minSalary, Integer maxSalary);
    List<JobOfferResponse> getJobOffersByCompany(String company);
    List<JobOfferResponse> getJobOffersByIndustry(String industry);
    List<JobOfferResponse> getJobOffersByLocation(String location);
    List<JobOfferResponse> getJobOffersBySalaryRange(String minSalary, String maxSalary);
}