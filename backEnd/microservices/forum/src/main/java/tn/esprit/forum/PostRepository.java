package tn.esprit.forum;

<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorId(Long authorId);
}
=======
public interface PostRepository {
}
>>>>>>> cb93fa2fdf96a55ba80d2c859ecd05d11de45e53
