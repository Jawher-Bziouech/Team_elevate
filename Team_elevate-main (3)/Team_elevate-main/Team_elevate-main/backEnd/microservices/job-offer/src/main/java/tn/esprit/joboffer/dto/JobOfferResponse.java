package tn.esprit.joboffer.dto;

public class JobOfferResponse {
    private Long opportunityId;
    private String jobTitle;
    private String industry;
    private String location;
    private String salaryRange;
    private FirmDto firm;

    // Cross-service Entreprise MS reference
    private Long entrepriseId;
    private String entrepriseNom;
    private String entrepriseSecteur;
    private String entrepriseLogo;
    private String entrepriseAdresse;

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

    public Long getEntrepriseId() { return entrepriseId; }
    public void setEntrepriseId(Long entrepriseId) { this.entrepriseId = entrepriseId; }

    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }

    public String getEntrepriseSecteur() { return entrepriseSecteur; }
    public void setEntrepriseSecteur(String entrepriseSecteur) { this.entrepriseSecteur = entrepriseSecteur; }

    public String getEntrepriseLogo() { return entrepriseLogo; }
    public void setEntrepriseLogo(String entrepriseLogo) { this.entrepriseLogo = entrepriseLogo; }

    public String getEntrepriseAdresse() { return entrepriseAdresse; }
    public void setEntrepriseAdresse(String entrepriseAdresse) { this.entrepriseAdresse = entrepriseAdresse; }
}
