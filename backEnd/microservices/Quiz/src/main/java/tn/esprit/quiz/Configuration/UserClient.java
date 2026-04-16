package tn.esprit.quiz.Configuration;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.quiz.DTOs.UserDTO;

import java.util.List;

/**
 * Feign HTTP client for inter-service communication with the User microservice.
 *
 * How it works:
 * - @FeignClient(name = "user") registers this as a declarative HTTP client
 * - Service name "user" is resolved via Eureka discovery (looks for spring.application.name=user)
 * - The Quiz service (port 8025) can call User service (port 8024) methods
 * - Feign automatically handles HTTP request/response serialization (JSON to Java objects)
 * - Exceptions and timeouts are handled gracefully
 *
 * In context: Used by GamificationService.getLeaderboard() to fetch usernames from User service.
 */
@FeignClient(name = "user")
public interface UserClient {

    /**
     * Fetch all users from the User microservice.
     * @return List of all users with id, username, email, role
     */
    @GetMapping("/users")
    List<UserDTO> getAllUsers();

    /**
     * Fetch a specific user by ID from the User microservice.
     * @param id User ID
     * @return User details or throws exception if not found
     */
    @GetMapping("/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
