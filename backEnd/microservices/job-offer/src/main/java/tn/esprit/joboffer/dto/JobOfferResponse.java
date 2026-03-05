package tn.esprit.joboffer.dto;

public class JobOfferResponse {
    private Long opportunityId;
    private String jobTitle;
    private String industry;
    private String location;
    private String salaryRange;
    private FirmDto firm;

    public JobOfferResponse() {}

    // Getters and Setters
    public Long getOpportunityId() { return opportunityId; }
    public void setOpportunityId(Long opportunityId) { this.opportunityId = opportunityId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public FirmDto getFirm() { return firm; }
    public void setFirm(FirmDto firm) { this.firm = firm; }
}