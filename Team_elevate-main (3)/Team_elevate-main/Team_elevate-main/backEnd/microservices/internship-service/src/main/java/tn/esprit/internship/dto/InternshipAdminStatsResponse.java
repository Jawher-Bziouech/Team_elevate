package tn.esprit.internship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipAdminStatsResponse {

    private long totalInternships;
    private long totalApplications;
    private long pendingApprovals;
    private double averageGrade;
    private long totalEvaluations;
}

