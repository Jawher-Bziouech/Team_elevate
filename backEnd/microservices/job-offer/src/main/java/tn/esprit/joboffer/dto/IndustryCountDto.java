package tn.esprit.joboffer.dto;

public class IndustryCountDto {
    private String industry;
    private long count;

    public IndustryCountDto(String industry, long count) {
        this.industry = industry;
        this.count = count;
    }

    // getters and setters
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}