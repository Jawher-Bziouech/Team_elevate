package esprit.tn.course;

import lombok.Data;
import java.util.List;

@Data
public class BulkCourseRequest {
    private List<CourseRequest> courses;
    private Long formationId;
    private String formationName;
//  private String formationName;
}