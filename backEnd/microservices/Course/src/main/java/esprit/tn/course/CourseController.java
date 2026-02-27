/*package esprit.tn.course;

import esprit.tn.course.entity.Course;
import esprit.tn.course.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public Course addCourse(@RequestBody Course course) {
        return courseService.addCourse(course);
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id,
                               @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }
}*/
// esprit.tn.course.CourseController.java
package esprit.tn.course;

import esprit.tn.course.BulkCourseRequest;
import esprit.tn.course.CourseRequest;
import esprit.tn.course.CourseResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
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

    // Ajouter un seul cours
    @PostMapping
    public ResponseEntity<CourseResponse> addCourse(@RequestBody CourseRequest request) {
        CourseResponse response = courseService.addCourse(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Ajouter plusieurs cours à une formation
    @PostMapping("/bulk")
    public ResponseEntity<List<CourseResponse>> addBulkCourses(@RequestBody BulkCourseRequest bulkRequest) {
        List<CourseResponse> responses = courseService.addBulkCourses(bulkRequest);
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }

    // Récupérer tous les cours
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        List<CourseResponse> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    // Récupérer les cours d'une formation spécifique
    @GetMapping("/formation/{formationId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByFormation(@PathVariable Long formationId) {
        List<CourseResponse> courses = courseService.getCoursesByFormation(formationId);
        return ResponseEntity.ok(courses);
    }

    // Récupérer un cours par ID
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    // Modifier un cours
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request) {
        CourseResponse updated = courseService.updateCourse(id, request);
        return ResponseEntity.ok(updated);
    }

    // Supprimer un cours
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // Supprimer tous les cours d'une formation
    @DeleteMapping("/formation/{formationId}")
    public ResponseEntity<Void> deleteCoursesByFormation(@PathVariable Long formationId) {
        courseService.deleteCoursesByFormation(formationId);
        return ResponseEntity.noContent().build();
    }
    @Value("${welcome.message}")
    private String welcomeMessage;
    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }
}