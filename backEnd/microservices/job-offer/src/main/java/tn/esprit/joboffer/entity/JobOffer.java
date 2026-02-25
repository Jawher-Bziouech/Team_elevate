package tn.esprit.joboffer.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long opportunityId;

    @NotBlank(message = "Job title cannot be blank")
    @Size(min = 3, max = 100, message = "Job title must be between 3 and 100 characters")
    private String jobTitle;

    // Relationship with Firm (instead of String company)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "firm_id")
    private Firm firm;

    @NotBlank(message = "Industry cannot be blank")
    @Size(min = 2, max = 50, message = "Industry must be between 2 and 50 characters")
    private String industry;

    @NotBlank(message = "Location cannot be blank")
    @Size(min = 2, max = 100, message = "Location must be between 2 and 100 characters")
    private String location;

    @NotBlank(message = "Salary range cannot be blank")
    @Pattern(regexp = "^\\d+-\\d+$", message = "Salary range must be in the format 'min-max' (e.g., '50000-70000')")
    private String salaryRange;

    // Constructors
    public JobOffer() {}

    // Updated constructor – takes a Firm instead of company name
    public JobOffer(String jobTitle, Firm firm, String industry, String location, String salaryRange) {
        this.jobTitle = jobTitle;
        this.firm = firm;
        this.industry = industry;
        this.location = location;
        this.salaryRange = salaryRange;
    }

    // Getters and Setters (update accordingly)
    public Long getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Long opportunityId) {
        this.opportunityId = opportunityId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public Firm getFirm() {
        return firm;
    }

    public void setFirm(Firm firm) {
        this.firm = firm;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }
}