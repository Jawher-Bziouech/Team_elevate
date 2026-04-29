package esprit.tn.course.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CourseEntityTest {

    @Test
    void testCourseBuilderAndGetters() {
        // Arrange
        String title = "Java Programming";
        String description = "Learn Java from scratch";
        Double price = 99.99;

        // Act
        Course course = Course.builder()
                .title(title)
                .description(description)
                .price(price)
                .status("ACTIF")
                .build();

        // Assert
        assertEquals(title, course.getTitle());
        assertEquals(description, course.getDescription());
        assertEquals(price, course.getPrice());
        assertEquals("ACTIF", course.getStatus());
    }

    @Test
    void testCourseEquality() {
        // Simple test to verify Lombok's @Data is working (equals/hashCode)
        Course c1 = Course.builder().id(1L).title("Test").build();
        Course c2 = Course.builder().id(1L).title("Test").build();
        
        assertEquals(c1, c2);
        assertEquals(c1.hashCode(), c2.hashCode());
    }
}
