package tn.esprit.forum;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RefreshScope

@RestController
@RequestMapping("/forum")
public class ForumRestApi {
    @Value("${welcome.message}")
    private String welcomeMessage;

    private final ForumService service;

    public ForumRestApi(ForumService service) {
        this.service = service;
    }

    // --- Posts ---
    @GetMapping("/posts")
    public List<Post> getAllPosts() {
        return service.getAllPosts();
    }

    @PostMapping("/posts")
    public Post createPost(@RequestBody Post post) {
        return service.savePost(post);
    }
    @PutMapping("/posts/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody Post updated) {
        return service.updatePost(id, updated);
    }

    @PutMapping("/comments/{id}")
    public Comment updateComment(@PathVariable Long id, @RequestBody Comment updated) {
        return service.updateComment(id, updated);
    }


    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable Long id) {
        service.deletePost(id);
    }

    // --- Comments ---
    @GetMapping("/posts/{postId}/comments")
    public List<Comment> getCommentsByPost(@PathVariable Long postId) {
        return service.getCommentsByPost(postId);
    }

    @PostMapping("/comments")
    public Comment addComment(@RequestBody Comment comment) {
        return service.saveComment(comment);
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        service.deleteComment(id);
    }
    // NEW: Get user info for a post author via OpenFeign
    @GetMapping("/users/{userId}")
    public UserDTO getUserById(@PathVariable Long userId) {
        return service.getUserById(userId);
    }
    // --- Notifications ---
    @GetMapping("/notifications/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return service.getNotifications(userId);
    }
    @GetMapping("/notifications/{userId}/count")
    public long getUnreadCount(@PathVariable Long userId) {
        return service.getUnreadCount(userId);
    }
    @PutMapping("/notifications/{userId}/read")
    public void markAllAsRead(@PathVariable Long userId) {
        service.markAllAsRead(userId);
    }
    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + filename);
            Files.write(path, file.getBytes());

            return ResponseEntity.ok("http://localhost:9090/forum/files/" + filename);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) throws Exception {
        Path path = Paths.get("uploads/" + filename);
        byte[] bytes = Files.readAllBytes(path);
        String contentType = Files.probeContentType(path);
        return ResponseEntity.ok()
                .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                .body(bytes);
    }
    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) throws Exception {
        Path path = Paths.get("uploads/" + filename);
        byte[] bytes = Files.readAllBytes(path);
        String contentType = Files.probeContentType(path);
        return ResponseEntity.ok()
                .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }

    // --- Reactions ---
    @GetMapping("/reactions/post/{postId}")
    public List<Reaction> getPostReactions(@PathVariable Long postId) {
        return service.getReactionsByPost(postId);
    }

    @GetMapping("/reactions/comment/{commentId}")
    public List<Reaction> getCommentReactions(@PathVariable Long commentId) {
        return service.getReactionsByComment(commentId);
    }

    @PostMapping("/reactions/post/{postId}")
    public Reaction reactToPost(@PathVariable Long postId,
                                @RequestParam Long userId,
                                @RequestParam String emoji) {
        return service.reactToPost(userId, postId, emoji);
    }

    @PostMapping("/reactions/comment/{commentId}")
    public Reaction reactToComment(@PathVariable Long commentId,
                                   @RequestParam Long userId,
                                   @RequestParam String emoji) {
        return service.reactToComment(userId, commentId, emoji);
    }


}