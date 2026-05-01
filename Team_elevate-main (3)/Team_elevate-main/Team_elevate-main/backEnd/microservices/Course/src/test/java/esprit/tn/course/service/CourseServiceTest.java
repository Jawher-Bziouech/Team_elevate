package esprit.tn.course.service;

import esprit.tn.course.CourseService;
import esprit.tn.course.entity.Course;
import esprit.tn.course.entity.UserCourseProgress;
import esprit.tn.course.CourseRepository;
import esprit.tn.course.UserCourseProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserCourseProgressRepository progressRepository;

    @InjectMocks
    private CourseService courseService;

    private Course course;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setId(100L);
        course.setTitle("Advanced Java");
        course.setDurationHours(5);
    }

    // =========================================================================
    // TEST: PROGRESS TRACKING LOGIC (Completing a course)
    // =========================================================================
    @Test
    void testUpdateProgress_CourseBecomesCompleted() {
        // Arrange: Course is 5 hours long (5 * 3600 = 18000 seconds)
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));

        // Arrange: User already watched 17000 seconds (not completed yet)
        UserCourseProgress existingProgress = new UserCourseProgress();
        existingProgress.setId(1L);
        existingProgress.setViewTimeSeconds(17000);
        existingProgress.setIsCompleted(false);
        
        when(progressRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.of(existingProgress));
        when(progressRepository.save(any(UserCourseProgress.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act: User watches 1000 more seconds (Total hits exactly 18000 seconds)
        UserCourseProgress updatedProgress = courseService.updateProgress(1L, 100L, 1000);

        // Assert: Your business logic should automatically mark the course as completed
        assertTrue(updatedProgress.getIsCompleted(), "Course should be marked as completed after reaching 18000 seconds");
        assertEquals(18000, updatedProgress.getViewTimeSeconds());
    }
}
