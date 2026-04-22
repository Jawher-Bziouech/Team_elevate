package skillup.demo.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import skillup.demo.model.User;

import java.util.List;

@FeignClient(name = "user-service", url = "http://localhost:9090")
public interface UserClient {

    @GetMapping("/users/{id}")
    User getUserById(@PathVariable("id") Long id);

    @GetMapping("/users/by-email")
    User getUserByEmail(@RequestParam("email") String email);

    @GetMapping("/users")
    List<User> getAllUsers();
}