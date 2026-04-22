# Feign Client - How It Works in Quiz Microservice

## What is Feign?

Feign is a **declarative HTTP client** that makes inter-service communication simple and clean. Instead of using RestTemplate or WebClient, you define a Java interface with HTTP annotations, and Feign generates the HTTP client automatically.

---

## How Feign Works in Our Architecture

### 1. Service Discovery with Eureka
```
User Microservice (port 8024)
    ↑ (Feign calls via Eureka)
    |
    |
Quiz Microservice (port 8025)
```

**Flow:**
1. Quiz microservice needs to get a user's username for the leaderboard
2. Instead of hardcoding `http://localhost:8024`, we use service name: `"user"`
3. Eureka resolves `"user"` to the actual IP/port (8024)
4. Feign makes the HTTP call automatically

---

## Our UserClient Example

### File: `tn/esprit/quiz/Configuration/UserClient.java`

```java
@FeignClient(name = "user")
public interface UserClient {

    @GetMapping("/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
```

### What Each Part Does:

| Part | Purpose |
|------|---------|
| `@FeignClient(name = "user")` | Register as HTTP client for service named "user" |
| `@GetMapping("/users/{id}")` | HTTP method + endpoint path |
| `@PathVariable("id")` | Map parameter to URL path |
| `UserDTO` | Auto-deserialize JSON response to Java object |

---

## Real-World Usage in Quiz Service

### Scenario: Building the Leaderboard

**Code in `GamificationService.getLeaderboard()`:**

```java
public List<LeaderboardEntry> getLeaderboard() {
    List<UserProgression> progressions = userProgressionRepository.findAllByOrderByTotalCreditsDesc();

    return progressions.stream().map(progression -> {
        LeaderboardEntry entry = new LeaderboardEntry();
        entry.setTotalCredits(progression.getTotalCredits());

        try {
            // FEIGN CALL HERE ↓
            UserDTO user = userClient.getUserById(progression.getUserId());
            // ↑ Feign handles: HTTP GET /users/{userId}, response parsing, errors

            if (user != null && user.getUsername() != null) {
                entry.setUsername(user.getUsername());
            } else {
                entry.setUsername("Unknown");
            }
        } catch (Exception e) {
            entry.setUsername("Unknown");  // Graceful fallback
        }
        return entry;
    }).collect(Collectors.toList());
}
```

### How Feign Executes This:

1. **Quiz calls:** `userClient.getUserById(123L)`
2. **Feign generates HTTP request:**
   ```
   GET http://user:8024/users/123
   (Eureka resolves "user" → actual service)
   ```
3. **User microservice responds:**
   ```json
   {
     "id": 123,
     "username": "john_doe",
     "email": "john@example.com",
     "role": "TRAINEE"
   }
   ```
4. **Feign deserializes to Java object:**
   ```java
   UserDTO {
     id: 123L,
     username: "john_doe",
     email: "john@example.com",
     role: "TRAINEE"
   }
   ```
5. **Return to service:** Service gets the UserDTO and adds username to leaderboard

---

## Step-by-Step Feign Flow

```
┌─────────────────────────────────────┐
│  Quiz Microservice                  │
│  ┌─────────────────────────────┐   │
│  │ GamificationService         │   │
│  │ calls: userClient.          │   │
│  │   getUserById(123L)         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         ↓ (1. Feign intercepts call)
┌─────────────────────────────────────┐
│  Feign Client                       │
│  - Builds: GET /users/123           │
│  - Adds headers, serialization      │
│  - Contacts Eureka: "where is user?"│
└─────────────────────────────────────┘
         ↓ (2. Eureka returns address)
┌─────────────────────────────────────┐
│  Eureka Service Registry            │
│  "user" service → localhost:8024    │
└─────────────────────────────────────┘
         ↓ (3. Make HTTP request)
┌─────────────────────────────────────┐
│  User Microservice (port 8024)      │
│  Endpoint: GET /users/123           │
│  Returns: JSON UserDTO              │
└─────────────────────────────────────┘
         ↓ (4. Parse response)
┌─────────────────────────────────────┐
│  Feign Deserializer                 │
│  JSON → UserDTO object              │
└─────────────────────────────────────┘
         ↓ (5. Return to service)
┌─────────────────────────────────────┐
│  GamificationService                │
│  receives: UserDTO object           │
│  uses: user.getUsername()           │
└─────────────────────────────────────┘
```

---

## Why Use Feign?

| Feature | Benefit |
|---------|---------|
| **Declarative** | Define interface, no boilerplate code |
| **Service Discovery** | Eureka resolves service names automatically |
| **Auto Serialization** | JSON ↔ Java objects handled automatically |
| **Error Handling** | Can catch FeignException and handle gracefully |
| **Clean Code** | No RestTemplate strings, type-safe method calls |

---

## Comparison: Without Feign vs With Feign

### ❌ Without Feign (Using RestTemplate)
```java
@Service
public class GamificationService {
    private final RestTemplate restTemplate;

    public UserDTO getUser(Long userId) {
        try {
            // Hardcoding, no service discovery
            String url = "http://localhost:8024/users/" + userId;
            return restTemplate.getForObject(url, UserDTO.class);
        } catch (Exception e) {
            return null;
        }
    }
}
```
**Problems:** Hardcoded URL, manual error handling, no service discovery

### ✅ With Feign (Our Implementation)
```java
@FeignClient(name = "user")
public interface UserClient {
    @GetMapping("/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}

@Service
public class GamificationService {
    private final UserClient userClient;  // Injected by Spring

    public UserDTO getUser(Long userId) {
        try {
            return userClient.getUserById(userId);  // Simple!
        } catch (Exception e) {
            return null;
        }
    }
}
```
**Benefits:** Clean interface, Eureka discovery, automatic JSON parsing, type-safe

---

## Configuration Required

### 1. Enable Feign in QuizApplication.java
```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "tn.esprit.quiz.Configuration")
public class QuizApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuizApplication.class, args);
    }
}
```

### 2. User Service Must Have Same Name in Eureka
User microservice (`application.properties` or `application.yml`):
```properties
spring.application.name=user
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
```

### 3. Quiz Service Configuration
```properties
spring.application.name=quiz
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
```

---

## Example API Call Trace

### Request from Frontend:
```
GET http://gateway:9090/quiz/gamification/leaderboard
```

### Gateway Routes to:
```
GET http://quiz:8025/quiz/gamification/leaderboard
```

### Quiz Service Does:
```java
List<UserProgression> progressions = userProgressionRepository.findAll();

progressions.forEach(prog -> {
    // FEIGN CALL HERE
    userClient.getUserById(prog.getUserId());
    // ↓ Feign makes HTTP call ↓
    // GET http://user:8024/users/{userId}
});
```

### Final Response to Frontend:
```json
[
  {
    "userId": 1,
    "username": "john_doe",
    "totalCredits": 2500,
    "totalAttempts": 45,
    "averageScore": 87.5
  },
  {
    "userId": 2,
    "username": "jane_smith",
    "totalCredits": 1800,
    "totalAttempts": 32,
    "averageScore": 82.0
  }
]
```

---

## Summary

**Feign = Simplified inter-service HTTP communication**
- Interface-based declarative client
- Automatic service discovery via Eureka
- JSON serialization/deserialization
- Error handling and retries
- Used in Quiz service to fetch user details from User service

