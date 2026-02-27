package tn.esprit.forum;

<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);
}
=======
public interface CommentRepository {
}
>>>>>>> cb93fa2fdf96a55ba80d2c859ecd05d11de45e53
