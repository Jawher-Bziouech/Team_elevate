# Quiz Microservice - Package Structure & Import Dependencies

## Directory Tree

```
backEnd/microservices/Quiz/
├── src/main/java/tn/esprit/quiz/
│   ├── QuizApplication.java                    [Entry Point]
│   │
│   ├── Controllers/                            [REST API Layer]
│   │   ├── QuizRestApi.java
│   │   └── GamificationRestApi.java
│   │
│   ├── Services/                               [Business Logic Layer]
│   │   ├── QuizService.java
│   │   └── GamificationService.java
│   │
│   ├── Repositories/                           [Data Access Layer]
│   │   ├── QuizRepository.java
│   │   ├── QuestionRepository.java
│   │   ├── AnswerRepository.java
│   │   ├── QuizAttemptRepository.java
│   │   ├── AttemptAnswerRepository.java
│   │   ├── UserProgressionRepository.java
│   │   └── UserBadgeRepository.java
│   │
│   ├── Entities/                               [JPA Domain Objects]
│   │   ├── Quiz.java
│   │   ├── Question.java
│   │   ├── Answer.java
│   │   ├── QuizAttempt.java
│   │   ├── AttemptAnswer.java
│   │   ├── UserProgression.java
│   │   ├── UserBadge.java
│   │   ├── LeaderboardEntry.java
│   │   ├── BadgeType.java                     [Enum]
│   │   └── Difficulty.java                    [Enum]
│   │
│   ├── DTOs/                                   [Data Transfer Objects]
│   │   ├── QuestionAnswerDTO.java
│   │   ├── QuizSubmissionRequest.java
│   │   ├── QuizResultResponse.java
│   │   └── UserDTO.java
│   │
│   └── Configuration/                          [Spring Configuration & Clients]
│       ├── CorsConfig.java
│       ├── GlobalExceptionHandler.java
│       └── UserClient.java                    [Feign Client]
│
├── src/main/resources/
│   └── application.properties
│
├── pom.xml
├── FEIGN_EXAMPLE.md                           [Documentation]
├── SERVICE_VALIDATION.md
└── PACKAGE_STRUCTURE.md

```

---

## Package Dependencies (Import Map)

### Controllers Layer
```java
// QuizRestApi.java
package tn.esprit.quiz.Controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.quiz.Entities.Quiz;              // ← Imports from Entities
import tn.esprit.quiz.Services.QuizService;       // ← Imports from Services
import java.util.List;
```

```java
// GamificationRestApi.java
package tn.esprit.quiz.Controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.quiz.DTOs.QuizResultResponse;    // ← Imports from DTOs
import tn.esprit.quiz.DTOs.QuizSubmissionRequest;
import tn.esprit.quiz.Entities.*;                 // ← Imports from Entities
import tn.esprit.quiz.Services.GamificationService; // ← Imports from Services
```

### Services Layer
```java
// QuizService.java
package tn.esprit.quiz.Services;

import org.springframework.stereotype.Service;
import tn.esprit.quiz.Entities.Quiz;              // ← Imports from Entities
import tn.esprit.quiz.Repositories.QuizRepository; // ← Imports from Repositories
import java.util.List;
import java.util.Optional;
```

```java
// GamificationService.java
package tn.esprit.quiz.Services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.quiz.Configuration.UserClient;   // ← Imports from Configuration
import tn.esprit.quiz.DTOs.*;                     // ← Imports from DTOs
import tn.esprit.quiz.Entities.*;                 // ← Imports from Entities
import tn.esprit.quiz.Repositories.*;             // ← Imports from Repositories
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
```

### Repositories Layer
```java
// QuizRepository.java
package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.Quiz;              // ← Imports from Entities
```

```java
// QuizAttemptRepository.java
package tn.esprit.quiz.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.quiz.Entities.QuizAttempt;       // ← Imports from Entities
import java.util.List;
```

### Entities Layer
```java
// Quiz.java
package tn.esprit.quiz.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
// No imports from other quiz packages (clean layer)
```

```java
// UserBadge.java
package tn.esprit.quiz.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
// Uses BadgeType enum from same package
```

### DTOs Layer
```java
// QuizResultResponse.java
package tn.esprit.quiz.DTOs;

import lombok.*;
import tn.esprit.quiz.Entities.BadgeType;        // ← Only imports Entities for enums
import java.util.List;
```

```java
// UserDTO.java
package tn.esprit.quiz.DTOs;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
// No imports from other packages (pure DTO)
```

### Configuration Layer
```java
// UserClient.java
package tn.esprit.quiz.Configuration;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.quiz.DTOs.UserDTO;               // ← Imports from DTOs
import java.util.List;
```

```java
// CorsConfig.java
package tn.esprit.quiz.Configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// No imports from other quiz packages
```

---

## Import Dependency Diagram

```
QuizApplication (entry point)
    ↓ scans
┌───────────────────────────────────────────────┐
│ Controllers                                   │
│  ├─ imports Services                          │
│  └─ imports Entities, DTOs                    │
│      ↓                                         │
│  ┌─────────────────────────────────────────┐  │
│  │ Services                                │  │
│  │  ├─ imports Repositories                │  │
│  │  ├─ imports Entities                    │  │
│  │  ├─ imports DTOs                        │  │
│  │  ├─ imports Configuration (UserClient)  │  │
│  │  └─ manages business logic              │  │
│  │      ↓                                   │  │
│  │  ┌─────────────────────────────────────┐│  │
│  │  │ Repositories                        ││  │
│  │  │  └─ imports Entities               ││  │
│  │  │  └─ interacts with Database         ││  │
│  │  │      ↓                              ││  │
│  │  │  [MySQL pidb]                       ││  │
│  │  └─────────────────────────────────────┘│  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│ Configuration                                 │
│  └─ UserClient (Feign) for inter-service     │
│     communication                             │
│                                               │
│ Entities & DTOs (domain objects)              │
│  └─ no dependencies on other packages         │
└───────────────────────────────────────────────┘
```

---

## Dependency Direction (Clean Architecture)

### ✅ Allowed Imports
| From | To | Reason |
|------|-----|--------|
| Controller | Service | Delegates business logic |
| Controller | Entity/DTO | Uses for request/response |
| Service | Repository | Accesses data |
| Service | Entity/DTO | Transforms data |
| Service | Configuration | Uses Feign clients |
| Repository | Entity | Queries and persists |
| DTO | Entity (Enum only) | Uses shared enums |

### ❌ NOT Allowed (Bad Practice)
| From | To | Why |
|------|-----|-----|
| Controller | Repository | Skips business logic |
| Service | Controller | Circular dependency |
| Entity | Service | Violates layering |
| DTO | Service | Data objects shouldn't know business logic |

---

## Spring Component Scanning

### QuizApplication.java
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

**Scanning Behavior:**
1. `@SpringBootApplication` scans `tn.esprit.quiz` and all sub-packages
2. Finds and registers:
   - `@RestController` classes → Controllers/*
   - `@Service` classes → Services/*
   - `@Repository` classes → Repositories/*
   - `@Configuration` classes → Configuration/*
   - `@FeignClient` classes → Configuration/UserClient
3. Injects dependencies via constructor injection

---

## File Organization Summary

### By Type
| Type | Count | Location |
|------|-------|----------|
| Controllers | 2 | Controllers/ |
| Services | 2 | Services/ |
| Repositories | 7 | Repositories/ |
| Entities | 8 | Entities/ |
| Enums | 2 | Entities/ |
| DTOs | 4 | DTOs/ |
| Configuration | 3 | Configuration/ |
| **Total** | **28** | **Organized in 7 packages** |

### By Layer
| Layer | Purpose | Files |
|-------|---------|-------|
| **Presentation** | HTTP endpoints | 2 Controllers |
| **Business Logic** | Feature implementation | 2 Services |
| **Data Access** | DB queries | 7 Repositories |
| **Domain** | JPA entities | 8 Entities + 2 Enums |
| **Transfer** | API data format | 4 DTOs |
| **Infrastructure** | Spring config, clients | 3 Configuration |

---

## Key Naming Conventions

### Controllers
- Suffix: `RestApi` or `Controller`
- Packages: `tn.esprit.quiz.Controllers`
- Annotations: `@RestController`, `@RequestMapping`

### Services
- Suffix: `Service`
- Packages: `tn.esprit.quiz.Services`
- Annotations: `@Service`, `@Transactional`

### Repositories
- Suffix: `Repository`
- Packages: `tn.esprit.quiz.Repositories`
- Annotations: `@Repository`
- Extends: `JpaRepository<Entity, ID>`

### Entities
- No suffix (e.g., `Quiz`, `User`)
- Packages: `tn.esprit.quiz.Entities`
- Annotations: `@Entity`, `@Table`
- Relationships: `@OneToMany`, `@ManyToOne`

### DTOs
- Suffix: `DTO`, `Request`, `Response`
- Packages: `tn.esprit.quiz.DTOs`
- No annotations (plain POJOs with Lombok)

---

## How to Add a New Feature

### Example: Add an "Archive Quiz" Feature

1. **Add to Controller** (`QuizRestApi.java`)
   ```java
   @PutMapping("/{id}/archive")
   public void archiveQuiz(@PathVariable Long id) {
       quizService.archiveQuiz(id);
   }
   ```

2. **Add to Service** (`QuizService.java`)
   ```java
   public void archiveQuiz(Long id) {
       Quiz quiz = quizRepository.findById(id)
           .orElseThrow(() -> new RuntimeException("Quiz not found"));
       quiz.setStatus("ARCHIVED");
       quizRepository.save(quiz);
   }
   ```

3. **Repository stays the same** (save/findById already exist)

4. **Update Entity** (if needed - status already exists)

This follows the clean separation: Controller → Service → Repository

