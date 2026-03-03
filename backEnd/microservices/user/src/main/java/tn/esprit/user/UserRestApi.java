package tn.esprit.user;


import org.springframework.beans.factory.annotation.Autowired;
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

        // Add this check!
        if (user.getRole() == null) {
            user.setRole(Role.TRAINEE);
        }

        return userRepository.save(user);
    }
    @PostMapping("/signin")
    public String signIn(@RequestBody User loginRequest) {

        Optional<User> user = userRepository.findAll().stream()
                .filter(u -> u.getUsername().equals(loginRequest.getUsername()))
                .findFirst();
        if (user.isPresent()) {
            // 4. Verify the password matches the hashed one
            if (passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
                // 5. Success! Return the JWT Token (the Badge)
                return jwtUtils.generateToken(user.get().getUsername(), user.get().getRole(), user.get().getId());            }
        }

        // 6. Fail
        throw new RuntimeException("Invalid username or password");

    }





}
