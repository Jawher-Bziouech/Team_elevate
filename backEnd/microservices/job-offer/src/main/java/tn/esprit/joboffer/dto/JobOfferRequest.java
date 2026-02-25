package tn.esprit.joboffer.dto;

import jakarta.validation.constraints.*;

public class JobOfferRequest {

    @NotBlank(message = "Job title is required")
    @Size(min = 3, max = 100, message = "Job title must be between 3 and 100 characters")
    private String jobTitle;

    @NotNull(message = "Firm ID is required")
    private Long firmId;

    @NotBlank(message = "Industry is required")
    @Size(min = 2, max = 50, message = "Industry must be between 2 and 50 characters")
    private String industry;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters")
    private String location;

    @NotBlank(message = "Salary range is required")
    @Pattern(regexp = "^\\d+-\\d+$", message = "Salary range must be in the format 'min-max' (e.g., '50000-70000')")
    private String salaryRange;

    // Constructors
    public JobOfferRequest() {}

    // Getters and Setters
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getFirmId() { return firmId; }
    public void setFirmId(Long firmId) { this.firmId = firmId; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
}