package tn.esprit.internship.service;

import java.util.List;
import tn.esprit.internship.dto.EvaluationRequest;
import tn.esprit.internship.dto.InternshipAdminStatsResponse;
import tn.esprit.internship.dto.InternshipApplicationRequest;
import tn.esprit.internship.dto.InternshipOfferRequest;
import tn.esprit.internship.model.Evaluation;
import tn.esprit.internship.model.InternshipApplication;
import tn.esprit.internship.model.ChatMessage;
import tn.esprit.internship.model.InternshipOffer;

public interface InternshipService {

    InternshipOffer createOffer(InternshipOfferRequest request, Long companyUserId);

    InternshipOffer getOfferById(Long offerId);

    InternshipOffer updateOffer(Long offerId, InternshipOfferRequest request, Long companyUserId);

    InternshipOffer updateOffer(Long offerId, InternshipOfferRequest request, Long companyUserId, boolean adminOverride);

    void deleteOffer(Long offerId, Long companyUserId);

    void deleteOffer(Long offerId, Long companyUserId, boolean adminOverride);

    InternshipApplication applyToOffer(Long offerId, InternshipApplicationRequest request, Long studentUserId);

    List<InternshipApplication> getMyApplications(Long studentUserId);

    List<InternshipOffer> getMyOffers(Long companyUserId);

    List<InternshipApplication> getApplicationsByOffer(Long offerId, Long companyUserId);

    List<InternshipOffer> getPublicOffers();

    InternshipApplication acceptByCompany(Long applicationId, Long companyUserId);

    InternshipApplication rejectByCompany(Long applicationId, Long companyUserId);

    List<InternshipApplication> getAllApplicationsForAdmin();

    List<InternshipOffer> getAllOffersForAdmin();

    InternshipAdminStatsResponse getAdminInternshipStats();

    Evaluation submitEvaluation(Long applicationId, EvaluationRequest request, Long companyUserId);

    int deleteExpiredOffers();

    List<ChatMessage> getChatMessages(Long applicationId, Long userId);
    ChatMessage sendChatMessage(Long applicationId, String content, Long userId);
}
