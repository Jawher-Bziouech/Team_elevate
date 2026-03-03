package tn.esprit.forum;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import java.util.Optional;



@Service
public class ForumService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserClient userClient;
    private final NotificationRepository notificationRepository;
    private final ReactionRepository reactionRepository;


    public ForumService(PostRepository postRepository, CommentRepository commentRepository,
                        UserClient userClient, NotificationRepository notificationRepository,
                        ReactionRepository reactionRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userClient = userClient;
        this.notificationRepository = notificationRepository;
        this.reactionRepository = reactionRepository;
    }

    // --- Post Logic ---
    public List<Post> getAllPosts() {
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        List<Comment> comments = commentRepository.findByPostId(id);
        commentRepository.deleteAll(comments);
        postRepository.deleteById(id);
    }

    // --- Comment Logic ---
    public List<Comment> getCommentsByPost(Long postId) {
        return postRepository.findById(postId)
                .map(Post::getComments)
                .orElse(null);
    }

    public Comment saveComment(Comment comment) {
        Comment saved = commentRepository.save(comment);

        // Create notification for the post author
        if (comment.getPost() != null && comment.getPost().getId() != null) {
            postRepository.findById(comment.getPost().getId()).ifPresent(post -> {
                // Don't notify yourself
                if (!post.getAuthorId().equals(comment.getAuthorId())) {
                    Notification notif = new Notification();
                    notif.setUserId(post.getAuthorId());
                    notif.setPostId(post.getId());
                    notif.setPostTitle(post.getTitle());
                    notif.setCommentAuthorId(comment.getAuthorId());
                    notif.setMessage("Someone commented on your post: \"" + post.getTitle() + "\"");
                    notificationRepository.save(notif);
                }
            });
        }
        return saved;
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    // --- User via OpenFeign ---
    public UserDTO getUserById(Long userId) {
        return userClient.getUserById(userId);
    }

    // --- Notifications ---
    public List<Notification> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifs.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifs);
    }
    // --- Reactions ---
    public List<Reaction> getReactionsByPost(Long postId) {
        return reactionRepository.findByPostId(postId);
    }

    public List<Reaction> getReactionsByComment(Long commentId) {
        return reactionRepository.findByCommentId(commentId);
    }

    public Reaction reactToPost(Long userId, Long postId, String emoji) {
        Optional<Reaction> existing = reactionRepository.findByUserIdAndPostId(userId, postId);
        if (existing.isPresent()) {
            Reaction r = existing.get();
            if (r.getEmoji().equals(emoji)) {
                reactionRepository.delete(r); // toggle off
                return null;
            }
            r.setEmoji(emoji); // switch emoji
            return reactionRepository.save(r);
        }
        Reaction r = new Reaction();
        r.setUserId(userId);
        r.setPostId(postId);
        r.setEmoji(emoji);
        return reactionRepository.save(r);
    }

    public Reaction reactToComment(Long userId, Long commentId, String emoji) {
        Optional<Reaction> existing = reactionRepository.findByUserIdAndCommentId(userId, commentId);
        if (existing.isPresent()) {
            Reaction r = existing.get();
            if (r.getEmoji().equals(emoji)) {
                reactionRepository.delete(r); // toggle off
                return null;
            }
            r.setEmoji(emoji); // switch emoji
            return reactionRepository.save(r);
        }
        Reaction r = new Reaction();
        r.setUserId(userId);
        r.setCommentId(commentId);
        r.setEmoji(emoji);
        return reactionRepository.save(r);
    }
    public Post updatePost(Long id, Post updated) {
        return postRepository.findById(id).map(post -> {
            post.setTitle(updated.getTitle());
            post.setContent(updated.getContent());
            post.setTopic(updated.getTopic());
            return postRepository.save(post);
        }).orElseThrow();
    }
    public Comment updateComment(Long id, Comment updated) {
        return commentRepository.findById(id).map(comment -> {
            comment.setContent(updated.getContent());
            return commentRepository.save(comment);
        }).orElseThrow();
    }


}