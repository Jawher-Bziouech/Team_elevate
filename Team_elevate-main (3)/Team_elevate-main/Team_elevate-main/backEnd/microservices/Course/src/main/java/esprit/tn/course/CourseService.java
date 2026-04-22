package esprit.tn.course;

import esprit.tn.course.entity.Course;
import esprit.tn.course.entity.FavoriteCourse;
import esprit.tn.course.entity.UserCourseProgress;
import esprit.tn.course.dto.CourseRequest;
import esprit.tn.course.dto.CourseResponse;
import esprit.tn.course.dto.BulkCourseRequest;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final UserClient userClient;
    private final CourseRepository courseRepository;
    private final FormationClient formationClient;
    private final UserCourseProgressRepository progressRepository;
    private final FavoriteCourseRepository favoriteRepository;

    private static final String UPLOAD_DIR = "uploads/";

    // ========================= AJOUT (avec tolérance aux pannes) =========================
    @Transactional
    public CourseResponse addCourse(CourseRequest request) {
        // --- Vérification formation (non bloquante) ---
        if (request.getFormationId() != null) {
            try {
                boolean exists = formationClient.formationExists(request.getFormationId());
                if (!exists) {
                    log.warn("Formation {} non trouvée, le cours sera créé sans formation associée", request.getFormationId());
                    request.setFormationId(null);
                    request.setFormationName(null);
                }
            } catch (Exception e) {
                log.error("Erreur appel formationClient pour ID {} : {}", request.getFormationId(), e.getMessage());
                request.setFormationId(null);
                request.setFormationName(null);
            }
        }

        // --- Vérification trainer (non bloquante) ---
        if (request.getTrainerId() != null) {
            try {
                UserDTO trainer = userClient.getUserById(request.getTrainerId());
                if (trainer == null || !"TRAINER".equalsIgnoreCase(trainer.getRole())) {
                    log.warn("Trainer {} invalide, cours créé sans trainerName", request.getTrainerId());
                    request.setTrainerName(null);
                } else {
                    request.setTrainerName(trainer.getUsername());
                }
            } catch (FeignException e) {
                log.error("Erreur Feign userClient pour ID {} : {}", request.getTrainerId(), e.getMessage());
                request.setTrainerName(null);
            } catch (Exception e) {
                log.error("Erreur inattendue vérification trainer {} : {}", request.getTrainerId(), e.getMessage());
                request.setTrainerName(null);
            }
        }

        Course course = mapToEntity(request);
        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    // ========================= AJOUT EN LOT (avec tolérance) =========================
    @Transactional
    public List<CourseResponse> addBulkCourses(BulkCourseRequest bulkRequest) {
        if (bulkRequest.getFormationId() != null) {
            try {
                boolean exists = formationClient.formationExists(bulkRequest.getFormationId());
                if (!exists) {
                    log.warn("Formation {} non trouvée pour bulk, création sans formation", bulkRequest.getFormationId());
                    bulkRequest.setFormationId(null);
                    bulkRequest.setFormationName(null);
                }
            } catch (Exception e) {
                log.error("Erreur appel formationClient pour bulk : {}", e.getMessage());
                bulkRequest.setFormationId(null);
                bulkRequest.setFormationName(null);
            }
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

    // ========================= METHODES EXISTANTES (inchangées) =========================
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> searchCourses(String title) {
        return courseRepository.findByTitleContainingIgnoreCase(title).stream()
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
        course.setContentType(request.getContentType());
        course.setContentUrl(request.getContentUrl());

        if (request.getPrerequisiteId() != null) {
            Course prereq = courseRepository.findById(request.getPrerequisiteId())
                    .orElseThrow(() -> new RuntimeException("Prerequisite course not found"));
            course.setPrerequisite(prereq);
        } else {
            course.setPrerequisite(null);
        }

        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }

    /*@Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course non trouvé avec l'ID: " + id);
        }
        courseRepository.deleteById(id);
    }*/
    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Delete dependent records
        favoriteRepository.deleteByCourseId(course.getId());
        progressRepository.deleteByCourseId(course.getId());

        courseRepository.delete(course);
        log.info("Deleted course {} and its associated favorites/progress", id);
    }
    @Transactional
    public void deleteCoursesByFormation(Long formationId) {
        List<Course> courses = courseRepository.findByFormationId(formationId);
        for (Course course : courses) {
            favoriteRepository.deleteByCourseId(course.getId());
            progressRepository.deleteByCourseId(course.getId());
        }
        courseRepository.deleteByFormationId(formationId);
        log.info("Deleted all courses of formation {} and their dependencies", formationId);
    }
    /*@Transactional
    public void deleteCoursesByFormation(Long formationId) {
        courseRepository.deleteByFormationId(formationId);
        log.info("Tous les cours de la formation {} ont été supprimés", formationId);
    }*/

    @Transactional
    public CourseResponse uploadCoursePdf(Long id, MultipartFile file) throws IOException {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course non trouvé avec l'ID: " + id));

        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File dest = new File(uploadDir.getAbsolutePath() + File.separator + fileName);
        file.transferTo(dest);

        course.setContentUrl("/uploads/" + fileName);
        course.setContentType("PDF");
        courseRepository.save(course);

        return mapToResponse(course);
    }

    // ========================= FAVORIS =========================
    @Transactional
    public boolean toggleFavoriteCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course object not found"));

        if (favoriteRepository.existsByUserIdAndCourseId(userId, courseId)) {
            favoriteRepository.deleteByUserIdAndCourseId(userId, courseId);
            return false;
        } else {
            FavoriteCourse fav = new FavoriteCourse();
            fav.setUserId(userId);
            fav.setCourse(course);
            favoriteRepository.save(fav);
            return true;
        }
    }

    public List<CourseResponse> getFavoriteCourses(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(fav -> mapToResponse(fav.getCourse()))
                .collect(Collectors.toList());
    }

    // ========================= PROGRESSION =========================
    public boolean canOpenCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (course.getPrerequisite() == null) {
            return true;
        }

        Optional<UserCourseProgress> progress = progressRepository.findByUserIdAndCourseId(userId, course.getPrerequisite().getId());
        return progress.isPresent() && progress.get().getIsCompleted() != null && progress.get().getIsCompleted();
    }

    @Transactional
    public UserCourseProgress updateProgress(Long userId, Long courseId, Integer timeSpentDelta) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        UserCourseProgress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElse(new UserCourseProgress());

        if (progress.getId() == null) {
            progress.setUserId(userId);
            progress.setCourse(course);
            progress.setViewTimeSeconds(0);
            progress.setIsOpened(false);
            progress.setIsCompleted(false);
        }

        progress.setIsOpened(true);
        progress.setViewTimeSeconds(progress.getViewTimeSeconds() + timeSpentDelta);

        if (course.getDurationHours() != null && course.getDurationHours() > 0) {
            int requiredSeconds = course.getDurationHours() * 3600;
            if (progress.getViewTimeSeconds() >= requiredSeconds) {
                progress.setIsCompleted(true);
            }
        }

        return progressRepository.save(progress);
    }

    public UserCourseProgress getCourseProgress(Long userId, Long courseId) {
        return progressRepository.findByUserIdAndCourseId(userId, courseId).orElse(null);
    }

    // ========================= RECOMMANDATIONS =========================
    public List<CourseResponse> getRecommendationsByUserCategory(Long userId) {
        List<UserCourseProgress> progresses = progressRepository.findByUserId(userId);
        if (progresses.isEmpty()) {
            List<Course> popularCourses = courseRepository.findAll().stream()
                    .sorted((c1, c2) -> Long.compare(
                            progressRepository.countByCourseId(c2.getId()),
                            progressRepository.countByCourseId(c1.getId())
                    ))
                    .limit(6)
                    .collect(Collectors.toList());
            return popularCourses.stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        Map<String, Long> categoryCount = progresses.stream()
                .map(p -> p.getCourse().getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        if (categoryCount.isEmpty()) {
            return getAllCourses().stream().limit(6).collect(Collectors.toList());
        }

        String favoriteCategory = categoryCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        Set<Long> openedCourseIds = progresses.stream()
                .map(p -> p.getCourse().getId())
                .collect(Collectors.toSet());

        List<Course> recommended = courseRepository.findByCategory(favoriteCategory).stream()
                .filter(c -> !openedCourseIds.contains(c.getId()))
                .limit(6)
                .collect(Collectors.toList());

        if (recommended.isEmpty()) {
            recommended = courseRepository.findAll().stream()
                    .filter(c -> !openedCourseIds.contains(c.getId()))
                    .limit(6)
                    .collect(Collectors.toList());
        }

        return recommended.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ========================= SCHEDULERS =========================
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldFavorites() {
        Date twentyEightDaysAgo = Date.from(Instant.now().minusSeconds(28L * 24 * 3600));
        int deletedCount = favoriteRepository.deleteAllByAddedAtBefore(twentyEightDaysAgo);
        log.info("Nettoyage favoris: {} entrées supprimées (plus de 28 jours)", deletedCount);
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void archiveInactiveCourses() {
        Date thirtyDaysAgo = Date.from(Instant.now().minusSeconds(30L * 24 * 3600));
        List<Course> allCourses = courseRepository.findAll();
        int archivedCount = 0;
        for (Course course : allCourses) {
            List<UserCourseProgress> progresses = progressRepository.findByCourseId(course.getId());
            if (progresses.isEmpty()) {
                if (course.getCreatedAt() != null && course.getCreatedAt().before(thirtyDaysAgo)
                        && "EN_PREPARATION".equals(course.getStatus())) {
                    course.setStatus("ARCHIVED");
                    courseRepository.save(course);
                    archivedCount++;
                }
            } else {
                Date lastAccess = progresses.stream()
                        .map(UserCourseProgress::getLastAccessedAt)
                        .max(Date::compareTo)
                        .orElse(null);
                if (lastAccess != null && lastAccess.before(thirtyDaysAgo)) {
                    course.setStatus("INACTIVE");
                    courseRepository.save(course);
                    archivedCount++;
                }
            }
        }
        log.info("Archivage des cours inactifs: {} cours modifiés", archivedCount);
    }

    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanOldProgress() {
        Date oneYearAgo = Date.from(Instant.now().minus(365, ChronoUnit.DAYS));
        List<UserCourseProgress> oldProgress = progressRepository.findAll().stream()
                .filter(p -> p.getLastAccessedAt() != null && p.getLastAccessedAt().before(oneYearAgo))
                .collect(Collectors.toList());
        progressRepository.deleteAll(oldProgress);
        log.info("Suppression de {} progressions vieilles de plus d'un an", oldProgress.size());
    }

    // ========================= METHODES JPQL ET KEYWORDS =========================
    public List<CourseResponse> searchCoursesByTitleSortedByDuration(String keyword) {
        List<Course> courses = courseRepository.findByTitleContainingIgnoreCaseOrderByDurationHoursAsc(keyword);
        return courses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> getUnstartedCoursesByUser(Long userId) {
        List<UserCourseProgress> progresses = progressRepository.findByUserIdAndIsOpenedTrue(userId);
        Set<Long> openedCourseIds = progresses.stream()
                .map(p -> p.getCourse().getId())
                .collect(Collectors.toSet());
        List<Course> allCourses = courseRepository.findAll();
        List<Course> unstarted = allCourses.stream()
                .filter(c -> !openedCourseIds.contains(c.getId()))
                .collect(Collectors.toList());
        return unstarted.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> matchCoursesByUserPreferences(Long userId) {
        List<UserCourseProgress> completedProgresses = progressRepository.findDistinctByUserIdAndIsCompletedTrue(userId);
        if (completedProgresses.isEmpty()) {
            return getMostPopularCourses(6);
        }
        Map<String, Long> categoryCount = completedProgresses.stream()
                .map(p -> p.getCourse().getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        String preferredCategory = categoryCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        if (preferredCategory == null) {
            return getMostPopularCourses(6);
        }
        Set<Long> completedCourseIds = completedProgresses.stream()
                .map(p -> p.getCourse().getId())
                .collect(Collectors.toSet());
        List<Course> matchingCourses = courseRepository.findByCategory(preferredCategory).stream()
                .filter(c -> !completedCourseIds.contains(c.getId()))
                .limit(6)
                .collect(Collectors.toList());
        if (matchingCourses.isEmpty()) {
            return getMostPopularCourses(6);
        }
        return matchingCourses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> getMostPopularCourses(int limit) {
        List<Object[]> results = courseRepository.findMostOpenedCourses();
        List<Course> popularCourses = new ArrayList<>();
        for (Object[] row : results) {
            popularCourses.add((Course) row[0]);
        }
        return popularCourses.stream().limit(limit).map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> getTop5PopularCourses() {
        Pageable topFive = PageRequest.of(0, 5);
        List<Course> courses = courseRepository.findTop5ByOrderByViewsCountDesc(topFive);
        return courses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> getRecommendedCoursesByUser(Long userId) {
        List<UserCourseProgress> progresses = progressRepository.findByUserId(userId);
        if (progresses.isEmpty()) {
            return getTop5PopularCourses();
        }
        List<String> categories = progresses.stream()
                .map(p -> p.getCourse().getCategory())
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        List<Long> excludedCourseIds = progresses.stream()
                .map(p -> p.getCourse().getId())
                .collect(Collectors.toList());
        Pageable limit = PageRequest.of(0, 6);
        List<Course> recommended = courseRepository.findRecommendedByCategories(categories, excludedCourseIds, limit);
        if (recommended.isEmpty()) {
            return getTop5PopularCourses();
        }
        return recommended.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> searchByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCourses();
        }
        List<Course> courses = courseRepository.searchByKeyword(keyword.trim());
        return courses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CourseResponse> matchCoursesByUserSkills(Long userId) {
        List<UserCourseProgress> completed = progressRepository.findByUserId(userId).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsCompleted()))
                .collect(Collectors.toList());

        if (completed.isEmpty()) {
            return getTop5PopularCourses();
        }

        Set<String> keywords = new HashSet<>();
        for (UserCourseProgress prog : completed) {
            String title = prog.getCourse().getTitle();
            String[] words = title.toLowerCase().split("\\s+");
            for (String w : words) {
                if (w.length() > 3) keywords.add(w);
            }
        }

        List<Course> matchedCourses = new ArrayList<>();
        for (String kw : keywords) {
            matchedCourses.addAll(courseRepository.searchByKeyword(kw));
        }
        Set<Long> completedIds = completed.stream().map(p -> p.getCourse().getId()).collect(Collectors.toSet());
        List<Course> distinct = matchedCourses.stream()
                .filter(c -> !completedIds.contains(c.getId()))
                .distinct()
                .limit(6)
                .collect(Collectors.toList());

        if (distinct.isEmpty()) {
            return getTop5PopularCourses();
        }
        return distinct.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ========================= METHODES PRIVEES =========================
    private Course mapToEntity(CourseRequest request) {
        Course course = Course.builder()
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
                .contentType(request.getContentType())
                .contentUrl(request.getContentUrl())
                .build();

        if (request.getPrerequisiteId() != null) {
            Course prereq = courseRepository.findById(request.getPrerequisiteId()).orElse(null);
            course.setPrerequisite(prereq);
        }
        return course;
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
        response.setContentType(course.getContentType());
        response.setViewsCount(course.getViewsCount());
        response.setContentUrl(course.getContentUrl());
        if (course.getPrerequisite() != null) {
            response.setPrerequisiteId(course.getPrerequisite().getId());
        }
        return response;
    }
    @Transactional
    public UserCourseProgress saveVideoTime(Long userId, Long courseId, Integer currentTimeSeconds) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        UserCourseProgress progress = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElse(new UserCourseProgress());
        if (progress.getId() == null) {
            progress.setUserId(userId);
            progress.setCourse(course);
            progress.setViewTimeSeconds(0);
            progress.setIsOpened(false);
            progress.setIsCompleted(false);
        }
        progress.setLastVideoTime(currentTimeSeconds);
        return progressRepository.save(progress);
    }
}