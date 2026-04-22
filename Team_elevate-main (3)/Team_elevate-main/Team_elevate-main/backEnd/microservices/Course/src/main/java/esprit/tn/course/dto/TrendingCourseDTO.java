package esprit.tn.course.dto;

import lombok.Data;

@Data
public class TrendingCourseDTO {
    private Long courseId;
    private String title;
    private long completionsCount;
}
