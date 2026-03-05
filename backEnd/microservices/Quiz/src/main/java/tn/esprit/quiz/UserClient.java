package tn.esprit.quiz;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "user")
public interface UserClient {
    @GetMapping("/users")
    List<UserDTO> getAllUsers();

    @GetMapping("/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
