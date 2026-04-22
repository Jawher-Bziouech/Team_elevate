package esprit.tn.course;

import esprit.tn.course.dto.CourseRequest;
import esprit.tn.course.dto.CourseResponse;
import esprit.tn.course.dto.BulkCourseRequest;
import esprit.tn.course.entity.UserCourseProgress;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseController {
    @Value("${welcome.message}")
    private String welcomeMessage;
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

    @GetMapping("/search")
    public ResponseEntity<List<CourseResponse>> searchCourses(@RequestParam("query") String query) {
        List<CourseResponse> courses = courseService.searchCourses(query);
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

    // PDF Upload Endpoint (ADMIN)
    @PostMapping("/{id}/upload-pdf")
    public ResponseEntity<CourseResponse> uploadPdf(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            CourseResponse response = courseService.uploadCoursePdf(id, file);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Favorite Endpoints (TRAINER)
    @PostMapping("/{courseId}/favorite/{userId}")
    public ResponseEntity<Boolean> toggleFavorite(@PathVariable Long courseId, @PathVariable Long userId) {
        boolean isFavorite = courseService.toggleFavoriteCourse(userId, courseId);
        return ResponseEntity.ok(isFavorite);
    }

    @GetMapping("/favorites/user/{userId}")
    public ResponseEntity<List<CourseResponse>> getFavoriteCourses(@PathVariable Long userId) {
        List<CourseResponse> courses = courseService.getFavoriteCourses(userId);
        return ResponseEntity.ok(courses);
    }

    // Progress Endpoints (TRAINER)
    @GetMapping("/{courseId}/can-open/{userId}")
    public ResponseEntity<Boolean> checkCanOpenCourse(@PathVariable Long courseId, @PathVariable Long userId) {
        boolean canOpen = courseService.canOpenCourse(userId, courseId);
        return ResponseEntity.ok(canOpen);
    }

    @PostMapping("/{courseId}/progress/{userId}")
    public ResponseEntity<UserCourseProgress> updateProgress(
            @PathVariable Long courseId, 
            @PathVariable Long userId,
            @RequestParam("timeSpentDelta") Integer timeSpentDelta) {
        UserCourseProgress progress = courseService.updateProgress(userId, courseId, timeSpentDelta);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{courseId}/progress/{userId}")
    public ResponseEntity<UserCourseProgress> getProgress(@PathVariable Long courseId, @PathVariable Long userId) {
        UserCourseProgress progress = courseService.getCourseProgress(userId, courseId);
        return ResponseEntity.ok(progress);
    }
    // Ajoutez dans la classe CourseController

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<CourseResponse>> getRecommendationsByUserCategory(@PathVariable Long userId) {
        List<CourseResponse> recommendations = courseService.getRecommendationsByUserCategory(userId);
        return ResponseEntity.ok(recommendations);
    }
    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }
    @GetMapping("/search-by-title-sorted")
    public ResponseEntity<List<CourseResponse>> searchByTitleSorted(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(courseService.searchCoursesByTitleSortedByDuration(keyword));
    }

    // 2. Cours non commencés par un utilisateur (keywords)
    @GetMapping("/unstarted/{userId}")
    public ResponseEntity<List<CourseResponse>> getUnstartedCourses(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.getUnstartedCoursesByUser(userId));
    }

    // 3. Matching par préférences utilisateur
    @GetMapping("/match/{userId}")
    public ResponseEntity<List<CourseResponse>> matchCourses(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.matchCoursesByUserPreferences(userId));
    }

    // 4. Cours les plus populaires (JPQL)
    @GetMapping("/most-popular")
    public ResponseEntity<List<CourseResponse>> getMostPopularCourses() {
        return ResponseEntity.ok(courseService.getMostPopularCourses(10));
    }

    // 5. Scheduler peut être déclenché manuellement pour test
    @PostMapping("/admin/cleanup-favorites")
    public ResponseEntity<String> triggerCleanupFavorites() {
        courseService.cleanupOldFavorites();
        return ResponseEntity.ok("Nettoyage des favoris exécuté");
    }

    @PostMapping("/admin/archive-inactive")
    public ResponseEntity<String> triggerArchiveInactive() {
        courseService.archiveInactiveCourses();
        return ResponseEntity.ok("Archivage des cours inactifs exécuté");
    }
    // JPQL - Top 5 populaires
    @GetMapping("/popular")
    public ResponseEntity<List<CourseResponse>> getPopularCourses() {
        return ResponseEntity.ok(courseService.getTop5PopularCourses());
    }

    // JPQL - Recommandations par catégories
    @GetMapping("/recommendations/category/{userId}")
    public ResponseEntity<List<CourseResponse>> getRecommendedByCategory(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.getRecommendedCoursesByUser(userId));
    }

    // Keywords - recherche par mot-clé
    @GetMapping("/search/keyword")
    public ResponseEntity<List<CourseResponse>> searchByKeyword(@RequestParam("q") String keyword) {
        return ResponseEntity.ok(courseService.searchByKeyword(keyword));
    }

    // Matching - par compétences de l'utilisateur
    @GetMapping("/match/skills/{userId}")
    public ResponseEntity<List<CourseResponse>> matchBySkills(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.matchCoursesByUserSkills(userId));
    }
    @PostMapping("/{courseId}/progress/{userId}/save-time")
    public ResponseEntity<UserCourseProgress> saveVideoTime(
            @PathVariable Long courseId,
            @PathVariable Long userId,
            @RequestParam Integer currentTimeSeconds) {
        UserCourseProgress progress = courseService.saveVideoTime(userId, courseId, currentTimeSeconds);
        return ResponseEntity.ok(progress);
    }
}