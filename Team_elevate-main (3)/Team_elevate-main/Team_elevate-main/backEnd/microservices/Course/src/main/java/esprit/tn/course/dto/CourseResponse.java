package esprit.tn.course.dto;

import lombok.Data;
import java.util.Date;

@Data
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String level;
    private Integer durationHours;
    private String language;
    private Double price;
    private String status;
    private Date createdAt;
    private Date updatedAt;
    private Long trainerId;
    private String trainerName;
    private Long formationId;
    private String formationName;
    private String contentType;
    private String contentUrl;
    private Long prerequisiteId;
    private Integer viewsCount;
}
