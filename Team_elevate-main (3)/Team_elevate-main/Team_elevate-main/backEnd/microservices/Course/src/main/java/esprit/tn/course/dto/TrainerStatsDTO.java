package esprit.tn.course.dto;

import lombok.Data;

@Data
public class TrainerStatsDTO {
    private Long trainerId;
    private long totalCourses;
    private long totalDurationHours;
    private long uniqueStudents;
}