package esprit.tn.course;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String category;
    private String level;
    private Integer durationHours;
    private String language;
    private Double price;
    private String status;
    private Long trainerId;
    private String trainerName;
    private Long formationId;
    private String formationName;
}