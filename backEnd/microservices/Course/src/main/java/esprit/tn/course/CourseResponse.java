
// CourseResponseDTO.java
package esprit.tn.course;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;


/*@Data

public class CourseResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private Date createdAt;
}*/
// esprit.tn.course.dto.CourseResponse.java



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
}