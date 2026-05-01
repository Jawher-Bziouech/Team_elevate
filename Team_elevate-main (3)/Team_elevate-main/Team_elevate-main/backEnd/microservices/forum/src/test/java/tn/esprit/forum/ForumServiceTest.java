package tn.esprit.forum;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ForumServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ForumService forumService;

    private Post post;
    private Comment comment;

    @BeforeEach
    void setUp() {
        // Setup a basic post
        post = new Post();
        post.setId(10L);
        post.setTitle("My awesome post");
        post.setAuthorId(1L); // The author of the post is User 1

        // Setup a basic comment
        comment = new Comment();
        comment.setId(100L);
        comment.setContent("Great post!");
        comment.setPost(post);
    }

    // =========================================================================
    // TEST A: DON't NOTIFY MYSELF RULE
    // =========================================================================
    @Test
    void testSaveComment_AuthorCommentsOnOwnPost_NoNotification() {
        // Arrange
        // User 1 (the author) is commenting on their own post
        comment.setAuthorId(1L); 
        
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        // Act
        Comment savedComment = forumService.saveComment(comment);

        // Assert
        assertNotNull(savedComment);
        
        // Business Logic Verification: Notification repository should NEVER be called
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    // =========================================================================
    // TEST B: NORMAL NOTIFICATION RULE
    // =========================================================================
    @Test
    void testSaveComment_OtherUserComments_SendsNotification() {
        // Arrange
        // User 5 (someone else) is commenting on User 1's post
        comment.setAuthorId(5L); 
        
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        // Act
        Comment savedComment = forumService.saveComment(comment);

        // Assert
        assertNotNull(savedComment);
        
        // Business Logic Verification: Notification repository MUST be called exactly once
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
}
