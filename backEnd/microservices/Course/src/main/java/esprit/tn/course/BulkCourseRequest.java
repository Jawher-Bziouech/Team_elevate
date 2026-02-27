package esprit.tn.course;

// esprit.tn.course.dto.BulkCourseRequest.java


import lombok.Data;
import java.util.List;

@Data
public class BulkCourseRequest {
    private List<CourseRequest> courses;
    private Long formationId;
    private String formationName;
}