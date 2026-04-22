package tn.esprit.forum;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    List<Reaction> findByPostId(Long postId);

    List<Reaction> findByCommentId(Long commentId);

    Optional<Reaction> findByUserIdAndPostId(Long userId, Long postId);

    Optional<Reaction> findByUserIdAndCommentId(Long userId, Long commentId);
}
