package esprit.tn.course;

import esprit.tn.course.FormationClient;
import esprit.tn.course.BulkCourseRequest;
import esprit.tn.course.CourseRequest;
import esprit.tn.course.CourseResponse;
import esprit.tn.course.entity.Course;
import esprit.tn.course.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final FormationClient formationClient;

    @Transactional
    public CourseResponse addCourse(CourseRequest request) {
        // Vérifier que la formation existe
        if (!formationClient.formationExists(request.getFormationId())) {
            throw new RuntimeException("Formation non trouvée avec l'ID: " + request.getFormationId());
        }

        Course course = mapToEntity(request);
        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    @Transactional
    public List<CourseResponse> addBulkCourses(BulkCourseRequest bulkRequest) {
        // Vérifier que la formation existe
        if (!formationClient.formationExists(bulkRequest.getFormationId())) {
            throw new RuntimeException("Formation non trouvée avec l'ID: " + bulkRequest.getFormationId());
        }

        List<Course> courses = bulkRequest.getCourses().stream()
                .map(req -> {
                    Course course = mapToEntity(req);
                    course.setFormationId(bulkRequest.getFormationId());
                    course.setFormationName(bulkRequest.getFormationName());
                    return course;
                })
                .collect(Collectors.toList());

        List<Course> savedCourses = courseRepository.saveAll(courses);
        return savedCourses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getCoursesByFormation(Long formationId) {
        return courseRepository.findByFormationId(formationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course non trouvé avec l'ID: " + id));
        return mapToResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course non trouvé avec l'ID: " + id));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setLevel(request.getLevel());
        course.setDurationHours(request.getDurationHours());
        course.setLanguage(request.getLanguage());
        course.setPrice(request.getPrice());
        course.setStatus(request.getStatus());
        course.setTrainerId(request.getTrainerId());
        course.setTrainerName(request.getTrainerName());

        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course non trouvé avec l'ID: " + id);
        }
        courseRepository.deleteById(id);
    }

    @Transactional
    public void deleteCoursesByFormation(Long formationId) {
        courseRepository.deleteByFormationId(formationId);
        log.info("Tous les cours de la formation {} ont été supprimés", formationId);
    }

    private Course mapToEntity(CourseRequest request) {
        return Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .level(request.getLevel())
                .durationHours(request.getDurationHours())
                .language(request.getLanguage())
                .price(request.getPrice())
                .status(request.getStatus())
                .trainerId(request.getTrainerId())
                .trainerName(request.getTrainerName())
                .formationId(request.getFormationId())
                .formationName(request.getFormationName())
                .build();
    }

    private CourseResponse mapToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setCategory(course.getCategory());
        response.setLevel(course.getLevel());
        response.setDurationHours(course.getDurationHours());
        response.setLanguage(course.getLanguage());
        response.setPrice(course.getPrice());
        response.setStatus(course.getStatus());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        response.setTrainerId(course.getTrainerId());
        response.setTrainerName(course.getTrainerName());
        response.setFormationId(course.getFormationId());
        response.setFormationName(course.getFormationName());
        return response;
    }
}