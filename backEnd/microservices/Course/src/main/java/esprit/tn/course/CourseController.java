package esprit.tn.course;

import esprit.tn.course.BulkCourseRequest;
import esprit.tn.course.CourseRequest;
import esprit.tn.course.CourseResponse;
import esprit.tn.course.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseResponse> addCourse(@RequestBody CourseRequest request) {
        CourseResponse response = courseService.addCourse(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<CourseResponse>> addBulkCourses(@RequestBody BulkCourseRequest bulkRequest) {
        List<CourseResponse> responses = courseService.addBulkCourses(bulkRequest);
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        List<CourseResponse> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/formation/{formationId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByFormation(@PathVariable Long formationId) {
        List<CourseResponse> courses = courseService.getCoursesByFormation(formationId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request) {
        CourseResponse updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/formation/{formationId}")
    public ResponseEntity<Void> deleteCoursesByFormation(@PathVariable Long formationId) {
        courseService.deleteCoursesByFormation(formationId);
        return ResponseEntity.noContent().build();
    }
}