package tn.esprit.internship.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.internship.dto.ChatMessageRequest;
import tn.esprit.internship.model.ChatMessage;
import tn.esprit.internship.service.InternshipService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final InternshipService internshipService;

    @GetMapping("/internship-applications/{id}/chat")
    public List<ChatMessage> getChatMessages(@PathVariable Long id) {
        return internshipService.getChatMessages(id, getAuthenticatedUserId());
    }

    @PostMapping("/internship-applications/{id}/chat")
    public ResponseEntity<ChatMessage> sendChatMessage(
            @PathVariable Long id, 
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(internshipService.sendChatMessage(id, request.getContent(), getAuthenticatedUserId()));
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Missing authentication context.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof Integer userId) {
            return userId.longValue();
        }
        if (principal instanceof String userIdAsText) {
            try {
                return Long.parseLong(userIdAsText);
            } catch (NumberFormatException ignored) {}
        }

        throw new AccessDeniedException("Authenticated user id is missing from JWT.");
    }
}
