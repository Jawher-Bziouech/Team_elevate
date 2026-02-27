package tn.esprit.forum;

<<<<<<< HEAD
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/forum")
public class ForumRestApi {

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
}
=======
public class ForumRestApi {
}
>>>>>>> cb93fa2fdf96a55ba80d2c859ecd05d11de45e53
