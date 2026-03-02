package tn.esprit.forum;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ForumService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    // Constructor Injection
    public ForumService(PostRepository postRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    // --- Post Logic ---
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        // When a post is deleted, you might want to delete its comments too!
        List<Comment> comments = commentRepository.findByPostId(id);
        commentRepository.deleteAll(comments);
        postRepository.deleteById(id);
    }

    // --- Comment Logic ---
    // --- Comment Logic ---
    public List<Comment> getCommentsByPost(Long postId) {
        // Now that they are linked, you can just find the post
        // and return its list of comments!
        return postRepository.findById(postId)
                .map(Post::getComments)
                .orElse(null);
    }

    public Comment saveComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}