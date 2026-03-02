package tn.esprit.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class BadgeController {

    private final UserRepository userRepository;

    // 1. Récupérer les badges d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBadges(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }

        String badges = user.getBadges();
        List<String> badgeList = badges != null ? Arrays.asList(badges.split(",")) : new ArrayList<>();

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("badges", badgeList);
        response.put("count", badgeList.size());

        return ResponseEntity.ok(response);
    }

    // 2. Ajouter un badge
    @PostMapping("/user/{userId}/add")
    public ResponseEntity<?> addBadge(@PathVariable Long userId, @RequestParam String badge) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }

        String currentBadges = user.getBadges();
        if (currentBadges == null || currentBadges.isEmpty()) {
            user.setBadges(badge);
        } else if (!currentBadges.contains(badge)) {
            user.setBadges(currentBadges + "," + badge);
        }

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Badge ajouté avec succès");
        response.put("badges", user.getBadges());

        return ResponseEntity.ok(response);
    }

    // 3. Liste de tous les badges disponibles
    @GetMapping("/all")
    public ResponseEntity<?> getAllBadges() {
        List<Map<String, String>> badges = Arrays.asList(
                createBadge("NEWBIE", "🌟", "Nouveau membre"),
                createBadge("ACTIVE", "⚡", "Membre actif"),
                createBadge("EXPERT", "🏆", "Expert"),
                createBadge("HELPER", "🤝", "Aide les autres"),
                createBadge("VETERAN", "🎖️", "Ancien membre"),
                createBadge("POPULAR", "⭐", "Membre populaire")
        );

        return ResponseEntity.ok(badges);
    }

    private Map<String, String> createBadge(String name, String icon, String description) {
        Map<String, String> badge = new HashMap<>();
        badge.put("name", name);
        badge.put("icon", icon);
        badge.put("description", description);
        return badge;
    }
}