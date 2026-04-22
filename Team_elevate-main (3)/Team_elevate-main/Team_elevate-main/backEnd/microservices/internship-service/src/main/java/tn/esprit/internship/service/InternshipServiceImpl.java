package tn.esprit.internship.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.internship.dto.EvaluationRequest;
import tn.esprit.internship.dto.InternshipAdminStatsResponse;
import tn.esprit.internship.dto.InternshipApplicationRequest;
import tn.esprit.internship.dto.InternshipOfferRequest;
import tn.esprit.internship.exception.ResourceNotFoundException;
import tn.esprit.internship.model.ChatMessage;
import tn.esprit.internship.model.Evaluation;
import tn.esprit.internship.model.InternshipApplication;
import tn.esprit.internship.model.InternshipOffer;
import tn.esprit.internship.repository.ChatMessageRepository;
import tn.esprit.internship.repository.EvaluationRepository;
import tn.esprit.internship.repository.InternshipApplicationRepository;
import tn.esprit.internship.repository.InternshipOfferRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class InternshipServiceImpl implements InternshipService {

    private final InternshipOfferRepository internshipOfferRepository;
    private final InternshipApplicationRepository internshipApplicationRepository;
    private final EvaluationRepository evaluationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public InternshipOffer createOffer(InternshipOfferRequest request, Long companyUserId) {
        InternshipOffer offer = InternshipOffer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .requiredStudyLevel(request.getRequiredStudyLevel())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .remuneration(request.getRemuneration())
                .supervisorName(request.getSupervisorName())
                .companyUserId(companyUserId)
                .publishDate(LocalDate.now())
                .expiryDate(request.getExpiryDate())
                .active(request.getActive() == null || request.getActive())
                .build();

        return internshipOfferRepository.save(offer);
    }

    @Override
    public InternshipOffer getOfferById(Long offerId) {
        return getOfferByIdOrThrow(offerId);
    }

    @Override
    public InternshipOffer updateOffer(Long offerId, InternshipOfferRequest request, Long companyUserId) {
        return updateOffer(offerId, request, companyUserId, false);
    }

    @Override
    public InternshipOffer updateOffer(Long offerId, InternshipOfferRequest request, Long companyUserId, boolean adminOverride) {
        InternshipOffer offer = getOfferByIdOrThrow(offerId);
        if (!adminOverride) {
            assertCompanyOwnership(offer, companyUserId);
        }

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setRequiredSkills(request.getRequiredSkills());
        offer.setRequiredStudyLevel(request.getRequiredStudyLevel());
        offer.setStartDate(request.getStartDate());
        offer.setEndDate(request.getEndDate());
        offer.setLocation(request.getLocation());
        offer.setRemuneration(request.getRemuneration());
        offer.setSupervisorName(request.getSupervisorName());
        offer.setExpiryDate(request.getExpiryDate());
        if (request.getActive() != null) {
            offer.setActive(request.getActive());
        }

        return internshipOfferRepository.save(offer);
    }

    @Override
    public void deleteOffer(Long offerId, Long companyUserId) {
        deleteOffer(offerId, companyUserId, false);
    }

    @Override
    public void deleteOffer(Long offerId, Long companyUserId, boolean adminOverride) {
        InternshipOffer offer = getOfferByIdOrThrow(offerId);
        if (!adminOverride) {
            assertCompanyOwnership(offer, companyUserId);
        }
        internshipOfferRepository.delete(offer);
    }

    @Override
    public InternshipApplication applyToOffer(Long offerId, InternshipApplicationRequest request, Long studentUserId) {
        InternshipOffer offer = getOfferByIdOrThrow(offerId);
        if (!offer.isActive()) {
            throw new IllegalArgumentException("Cannot apply to an inactive internship offer.");
        }

        if (offer.getExpiryDate() != null && offer.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot apply to an expired internship offer.");
        }

        if (request.getStudentUserId() != null && !request.getStudentUserId().equals(studentUserId)) {
            throw new IllegalArgumentException("studentUserId in payload does not match authenticated student.");
        }

        if (internshipApplicationRepository.existsByInternshipOfferIdAndStudentUserId(offerId, studentUserId)) {
            throw new IllegalArgumentException("You have already applied for this internship.");
        }

        InternshipApplication application = InternshipApplication.builder()
                .internshipOfferId(offerId)
                .studentUserId(studentUserId)
                .cvData(request.getCvData())
                .cvFileName(request.getCvFileName())
                .motivationLetter(request.getMotivationLetter())
                .applicationDate(LocalDateTime.now())
                .status("PENDING")
                .build();

        return internshipApplicationRepository.save(application);
    }

    @Override
    public List<InternshipApplication> getMyApplications(Long studentUserId) {
        return internshipApplicationRepository.findAll().stream()
                .filter(application -> studentUserId.equals(application.getStudentUserId()))
                .map(application -> {
                    internshipOfferRepository.findById(application.getInternshipOfferId())
                            .ifPresent(offer -> {
                                application.setOfferTitle(offer.getTitle());
                                application.setCompanyName(offer.getSupervisorName()); // Using supervisorName as company name placeholder
                            });
                    return application;
                })
                .toList();
    }

    @Override
    public List<InternshipOffer> getMyOffers(Long companyUserId) {
        if (companyUserId == null) {
            throw new IllegalArgumentException("Authenticated company user id is missing.");
        }
        return internshipOfferRepository.findByCompanyUserId(companyUserId);
    }

    @Override
    public List<InternshipApplication> getApplicationsByOffer(Long offerId, Long companyUserId) {
        InternshipOffer offer = getOfferByIdOrThrow(offerId);
        assertCompanyOwnership(offer, companyUserId);
        return internshipApplicationRepository.findByInternshipOfferId(offerId);
    }

    @Override
    public List<InternshipOffer> getPublicOffers() {
        LocalDate today = LocalDate.now();
        return internshipOfferRepository.findAll().stream()
                .filter(InternshipOffer::isActive)
                .filter(offer -> offer.getEndDate() == null || !offer.getEndDate().isBefore(today))
                .filter(offer -> offer.getExpiryDate() == null || !offer.getExpiryDate().isBefore(today))
                .toList();
    }

    @Override
    public InternshipApplication acceptByCompany(Long applicationId, Long companyUserId) {
        InternshipApplication application = getApplicationByIdOrThrow(applicationId);
        InternshipOffer offer = getOfferByIdOrThrow(application.getInternshipOfferId());

        if (!companyUserId.equals(offer.getCompanyUserId())) {
            throw new IllegalArgumentException("This company is not allowed to manage this application.");
        }

        String currentStatus = application.getStatus() == null ? "PENDING" : application.getStatus().toUpperCase();

        if (!"PENDING".equals(currentStatus)) {
            throw new IllegalArgumentException("Company can only accept applications in PENDING status.");
        }

        application.setStatus("ACCEPTED");
        return internshipApplicationRepository.save(application);
    }

    @Override
    public InternshipApplication rejectByCompany(Long applicationId, Long companyUserId) {
        InternshipApplication application = getApplicationByIdOrThrow(applicationId);
        InternshipOffer offer = getOfferByIdOrThrow(application.getInternshipOfferId());

        if (!companyUserId.equals(offer.getCompanyUserId())) {
            throw new IllegalArgumentException("This company is not allowed to manage this application.");
        }

        String currentStatus = application.getStatus() == null ? "PENDING" : application.getStatus().toUpperCase();

        if (!"PENDING".equals(currentStatus)) {
            throw new IllegalArgumentException("Company can only reject applications in PENDING status.");
        }

        application.setStatus("REJECTED");
        return internshipApplicationRepository.save(application);
    }

    @Override
    public List<InternshipApplication> getAllApplicationsForAdmin() {
        return internshipApplicationRepository.findAll();
    }

    @Override
    public List<InternshipOffer> getAllOffersForAdmin() {
        return internshipOfferRepository.findAll();
    }

    @Override
    public InternshipAdminStatsResponse getAdminInternshipStats() {
        long totalInternships = internshipOfferRepository.count();
        long totalApplications = internshipApplicationRepository.count();
        long pendingApprovals = internshipApplicationRepository.findAll().stream()
                .filter(application -> "PENDING".equalsIgnoreCase(application.getStatus()))
                .count();
        double averageGrade = evaluationRepository.findAll().stream()
                .filter(evaluation -> evaluation.getGrade() != null)
                .mapToInt(Evaluation::getGrade)
                .average()
                .orElse(0.0);
        long totalEvaluations = evaluationRepository.count();

        return InternshipAdminStatsResponse.builder()
                .totalInternships(totalInternships)
                .totalApplications(totalApplications)
                .pendingApprovals(pendingApprovals)
                .averageGrade(averageGrade)
                .totalEvaluations(totalEvaluations)
                .build();
    }

    @Override
    public Evaluation submitEvaluation(Long applicationId, EvaluationRequest request, Long companyUserId) {
        InternshipApplication application = getApplicationByIdOrThrow(applicationId);
        String status = application.getStatus() != null ? application.getStatus().toUpperCase() : "";
        if (!"ACCEPTED".equals(status) && !"ACCEPTED_BY_COMPANY".equals(status)) {
            throw new IllegalArgumentException("Only accepted applications can be evaluated.");
        }

        InternshipOffer offer = getOfferByIdOrThrow(application.getInternshipOfferId());
        if (!companyUserId.equals(offer.getCompanyUserId())) {
            throw new IllegalArgumentException("This company cannot evaluate applications for this offer.");
        }

        Evaluation evaluation = Evaluation.builder()
                .internshipApplicationId(applicationId)
                .grade(request.getGrade())
                .comment(request.getComment())
                .evaluationDate(LocalDateTime.now())
                .build();

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);

        if (savedEvaluation.getGrade() != null && savedEvaluation.getGrade() >= 10) {
            generateCertificatePlaceholder(application, savedEvaluation);
        }

        return savedEvaluation;
    }

    @Override
    public int deleteExpiredOffers() {
        LocalDate today = LocalDate.now();
        List<InternshipOffer> expiredOffers = internshipOfferRepository
                .findByActiveTrueAndEndDateBeforeOrActiveTrueAndExpiryDateBefore(today, today);
        
        if (expiredOffers.isEmpty()) {
            return 0;
        }

        List<Long> expiredIds = expiredOffers.stream().map(InternshipOffer::getId).toList();
        
        // Delete associated applications first to handle potential DB integrity (even if no JPA relation)
        internshipApplicationRepository.deleteByInternshipOfferIdIn(expiredIds);
        
        // Perma delete the offers
        internshipOfferRepository.deleteAll(expiredOffers);
        
        return expiredOffers.size();
    }

    private InternshipOffer getOfferByIdOrThrow(Long offerId) {
        return internshipOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship offer not found with id: " + offerId));
    }

    private InternshipApplication getApplicationByIdOrThrow(Long applicationId) {
        return internshipApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Internship application not found with id: " + applicationId));
    }

    private void assertCompanyOwnership(InternshipOffer offer, Long companyUserId) {
        if (companyUserId == null || !companyUserId.equals(offer.getCompanyUserId())) {
            throw new IllegalArgumentException("This company is not allowed to manage this offer.");
        }
    }

    private void generateCertificatePlaceholder(InternshipApplication application, Evaluation evaluation) {
        // Placeholder for certificate generation logic (PDF/event/notification can be added later).
    }

    // ─── Chat Methods ───────────────────────────────────────────────────────────

    @Override
    public List<ChatMessage> getChatMessages(Long applicationId, Long userId) {
        InternshipApplication application = getApplicationByIdOrThrow(applicationId);
        assertChatAccess(application, userId);
        return chatMessageRepository.findByApplicationIdOrderByTimestampAsc(applicationId);
    }

    @Override
    public ChatMessage sendChatMessage(Long applicationId, String content, Long userId) {
        InternshipApplication application = getApplicationByIdOrThrow(applicationId);
        assertChatAccess(application, userId);

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Message content cannot be empty.");
        }

        ChatMessage message = ChatMessage.builder()
                .applicationId(applicationId)
                .senderId(userId)
                .content(content.trim())
                .timestamp(LocalDateTime.now())
                .build();

        return chatMessageRepository.save(message);
    }

    /**
     * Ensures that only the student who applied OR the company that owns the
     * internship offer can access messages for this application.
     */
    private void assertChatAccess(InternshipApplication application, Long userId) {
        boolean isStudent = userId.equals(application.getStudentUserId());
        boolean isCompany = internshipOfferRepository.findById(application.getInternshipOfferId())
                .map(offer -> userId.equals(offer.getCompanyUserId()))
                .orElse(false);

        if (!isStudent && !isCompany) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to access this chat.");
        }
    }
}

