package tn.esprit.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserRestApi {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/hello")
    public String hello() {
        return "hello this is user";
    }

    @PostMapping
    public User makeUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @DeleteMapping
    public void deleteUser(@RequestParam Long userId) {
        userRepository.deleteById(userId);
    }

    @PutMapping
    public User modifyUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/signup")
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(Role.TRAINEE);
        user.setPlan(Plan.FREE);
        return userRepository.save(user);
    }

    @PostMapping("/signin")
    public String signIn(@RequestBody User loginRequest) {
        Optional<User> user = userRepository.findAll().stream()
                .filter(u -> u.getUsername().equals(loginRequest.getUsername()))
                .findFirst();

        if (user.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
            User u = user.get();
            return jwtUtils.generateToken(u.getUsername(), u.getRole(), u.getId(), u.getPlan());
        }
        throw new RuntimeException("Invalid username or password");
    }

    @PutMapping("/{id}/upgrade-plan")
    public ResponseEntity<String> upgradePlan(@PathVariable Long id, @RequestParam String plan) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            user.setPlan(Plan.valueOf(plan.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid plan: " + plan);
        }
        userRepository.save(user);
        return ResponseEntity.ok(jwtUtils.generateToken(user.getUsername(), user.getRole(), user.getId(), user.getPlan()));
    }

    @PutMapping("/{id}/cancel-plan")
    public ResponseEntity<String> cancelPlan(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPlan(Plan.FREE);
        userRepository.save(user);
        return ResponseEntity.ok(jwtUtils.generateToken(user.getUsername(), user.getRole(), user.getId(), user.getPlan()));
    }
}
