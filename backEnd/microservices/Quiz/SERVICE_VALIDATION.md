# Quiz Microservice - Service Layer Validation & Examples

## Architecture Overview

```
LAYER SEPARATION
├── Controller Layer (REST Endpoints)
│   ├── QuizRestApi.java          → Handles /quiz requests
│   └── GamificationRestApi.java  → Handles /quiz/gamification requests
│
├── Service Layer (Business Logic)
│   ├── QuizService.java          → CRUD operations for quizzes
│   └── GamificationService.java  → Grading, badges, progression, leaderboards
│
├── Repository Layer (Data Access)
│   ├── QuizRepository.java
│   ├── QuestionRepository.java
│   ├── QuizAttemptRepository.java
│   └── UserProgressionRepository.java
│
└── DTOs & Entities (Data Transfer Objects)
    ├── QuizSubmissionRequest.java
    ├── QuizResultResponse.java
    └── UserDTO.java
```

---

## Service Layer Responsibilities

### 1. QuizService (Thin Service)
**Purpose:** CRUD operations with relationship management

**Methods:**
```java
public List<Quiz> getAllQuizzes()           // SELECT all
public Optional<Quiz> getQuizById(Long id)  // SELECT by id
public Quiz saveQuiz(Quiz quiz)             // INSERT/UPDATE + set bidirectional relationships
public void deleteQuiz(Long id)             // DELETE
```

**Why Service Layer?**
- Sets parent-child relationships before saving (ensures data integrity)
- Delegates database calls to repository
- Allows future business logic additions (validation, caching, etc.)

---

### 2. GamificationService (Rich Service)
**Purpose:** Complex business logic for gamification

**Core Methods:**

#### A. submitQuiz(QuizSubmissionRequest) - Main Orchestrator
```
Flow:
1. Validate quiz exists
2. Grade the quiz (check correct answers)
3. Calculate score & credits
4. Save attempt record
5. Update user progression (stats, streaks)
6. Evaluate & award badges
7. Return result to user
```

**Example Call:**
```json
POST /quiz/gamification/submit
{
  "userId": 101,
  "quizId": 5,
  "timeTakenSeconds": 120,
  "answers": [
    { "questionId": 1, "selectedAnswerId": 2 },
    { "questionId": 2, "selectedAnswerId": 5 },
    { "questionId": 3, "selectedAnswerId": 8 }
  ]
}
```

**Processing Steps:**

Step 1: Find Quiz
```java
Quiz quiz = quizRepository.findById(5)
// Returns Quiz with 3 questions, each with 4 possible answers
```

Step 2: Grade (Compare User Answers vs Correct Answers)
```
Question 1: Correct Answer = 2, User Selected = 2  ✅ Correct
Question 2: Correct Answer = 5, User Selected = 5  ✅ Correct
Question 3: Correct Answer = 8, User Selected = 7  ❌ Wrong

Score = 2/3 × 100 = 66.67%
Passed = true (>= 50%)
```

Step 3: Calculate Credits
```
Score: 66.67% → scoreMultiplier = 2 (because >= 75? No, >= 50? Yes)
Wait, let me recalculate:
  - 90+ → 3x
  - 75+ → 2x
  - 50+ → 1x

Score 66.67% → scoreMultiplier = 1x

Time Efficiency:
  - Quiz duration: 10 minutes = 600 seconds allowed
  - User took: 120 seconds
  - Efficiency = 600 / 120 = 5.0 → capped at 2.0
  - timeEfficiency = 2.0

Credits = 10 × 1 × 2.0 = 20 credits ✅
```

Step 4: Save Quiz Attempt
```java
QuizAttempt attempt = new QuizAttempt();
attempt.setUserId(101);
attempt.setQuizId(5);
attempt.setScore(66.67);
attempt.setTimeTakenSeconds(120);
attempt.setCreditsEarned(20);
attempt.setPassed(true);
attempt.setAttemptDate(LocalDateTime.now());
// + 3 AttemptAnswer records
quizAttemptRepository.save(attempt);  // Saved with ID = 42
```

Step 5: Update Progression
```java
// Before
UserProgression {
  userId: 101,
  totalAttempts: 4,
  totalCredits: 150,
  totalPassed: 3,
  averageScore: 72.5,
  currentStreak: 2,
  bestStreak: 3,
  consecutivePassCount: 2
}

// After (after this quiz)
{
  totalAttempts: 5,           // +1
  totalCredits: 170,          // +20
  totalPassed: 4,             // +1 (passed)
  averageScore: 72.87,        // (72.5×4 + 66.67)/5
  currentStreak: 3,           // +1 (if same day)
  bestStreak: 3,              // unchanged
  consecutivePassCount: 3     // +1 (passed)
}
```

Step 6: Evaluate Badges (14 different badges checked)
```
VOLUME BADGES (based on totalAttempts = 5):
  ✓ FIRST_STEP       (>= 1)   → Already has
  ✓ QUIZ_ENTHUSIAST  (>= 10)  → Not yet (5 < 10)
  ✗ QUIZ_MASTER      (>= 50)  → Not yet

ACCURACY BADGES (based on score = 66.67%):
  ✗ PERFECT_SCORE    (== 100) → No
  ✓ SHARP_MIND       (5+ quizzes with 90+) → Check repo
  ✗ CONSISTENT       (10+ consecutive passes) → Only 3

SPEED BADGES (based on time = 120s / 600s = 20%):
  ✓ SPEED_DEMON      (< 25%)  → YES! Award this badge ⭐
  ✗ QUICK_THINKER    (5+ fast attempts) → Check repo

CREDIT BADGES (totalCredits = 170):
  ✓ CREDIT_STARTER   (>= 100) → Already has
  ✗ CREDIT_COLLECTOR (>= 500) → Not yet

STREAK BADGES (currentStreak = 3):
  ✓ THREE_DAY_STREAK (>= 3)   → YES! Award this badge ⭐
  ✗ SEVEN_DAY_STREAK (>= 7)   → Not yet
```

**New Badges Awarded:** [SPEED_DEMON, THREE_DAY_STREAK]

Step 7: Return Response
```json
{
  "score": 66.67,
  "passed": true,
  "creditsEarned": 20,
  "newBadges": ["SPEED_DEMON", "THREE_DAY_STREAK"],
  "attemptId": 42
}
```

---

## Service-to-Repository Interaction

### Example: Fetching Leaderboard
```java
public List<LeaderboardEntry> getLeaderboard() {
    // 1. Repository gets all progressions sorted by credits
    List<UserProgression> progressions =
        userProgressionRepository.findAllByOrderByTotalCreditsDesc();
    // SQL: SELECT * FROM user_progression ORDER BY total_credits DESC LIMIT 10;

    return progressions.stream().map(progression -> {
        LeaderboardEntry entry = new LeaderboardEntry();
        entry.setTotalCredits(progression.getTotalCredits());
        entry.setTotalAttempts(progression.getTotalAttempts());

        // 2. FEIGN CALL: Get user details from User microservice
        try {
            UserDTO user = userClient.getUserById(progression.getUserId());
            //  ↓ HTTP GET http://user:8024/users/{userId}
            entry.setUsername(user.getUsername());
        } catch (Exception e) {
            entry.setUsername("Unknown");
        }

        return entry;
    }).collect(Collectors.toList());
}
```

**Result:**
```json
[
  {
    "userId": 5,
    "username": "top_performer",
    "totalCredits": 3200,
    "totalAttempts": 67,
    "totalPassed": 62,
    "averageScore": 89.5,
    "currentStreak": 7,
    "bestStreak": 12
  },
  {
    "userId": 101,
    "username": "learner123",
    "totalCredits": 170,
    "totalAttempts": 5,
    "totalPassed": 4,
    "averageScore": 72.87,
    "currentStreak": 3,
    "bestStreak": 3
  }
]
```

---

## REST Endpoint Flows

### Endpoint 1: POST /quiz/gamification/submit

**Request:**
```
POST http://localhost:9090/quiz/gamification/submit
Content-Type: application/json

{
  "userId": 101,
  "quizId": 5,
  "timeTakenSeconds": 120,
  "answers": [...]
}
```

**Flow:**
```
GamificationRestApi.submitQuiz(request)
    ↓
GamificationService.submitQuiz(request)
    ├─ quizRepository.findById(5)
    ├─ Grade answers
    ├─ quizAttemptRepository.save(attempt)
    ├─ updateProgression() → userProgressionRepository.save()
    ├─ evaluateAndAwardBadges() → userBadgeRepository.save()
    └─ return QuizResultResponse
    ↓
HTTP 200 OK + JSON response
```

**Response:**
```json
{
  "score": 66.67,
  "passed": true,
  "creditsEarned": 20,
  "newBadges": ["SPEED_DEMON"],
  "attemptId": 42
}
```

---

### Endpoint 2: GET /quiz/gamification/leaderboard

**Request:**
```
GET http://localhost:9090/quiz/gamification/leaderboard
```

**Flow:**
```
GamificationRestApi.getLeaderboard()
    ↓
GamificationService.getLeaderboard()
    ├─ userProgressionRepository.findAllByOrderByTotalCreditsDesc()
    └─ For each progression:
        ├─ Create LeaderboardEntry
        └─ userClient.getUserById(userId)  ← FEIGN CALL to User service
    ↓
HTTP 200 OK + JSON array
```

**Response:**
```json
[
  {
    "userId": 5,
    "username": "top_performer",
    "totalCredits": 3200,
    "totalAttempts": 67,
    "totalPassed": 62,
    "averageScore": 89.5,
    "currentStreak": 7,
    "bestStreak": 12
  }
]
```

---

### Endpoint 3: GET /quiz/gamification/progression/{userId}

**Request:**
```
GET http://localhost:9090/quiz/gamification/progression/101
```

**Flow:**
```
GamificationRestApi.getUserProgression(101)
    ↓
GamificationService.getUserProgression(101)
    ├─ userProgressionRepository.findByUserId(101)
    └─ return UserProgression or null
    ↓
HTTP 200 OK + JSON response
```

**Response:**
```json
{
  "id": 42,
  "userId": 101,
  "totalCredits": 170,
  "totalAttempts": 5,
  "totalPassed": 4,
  "averageScore": 72.87,
  "currentStreak": 3,
  "bestStreak": 3,
  "consecutivePassCount": 3
}
```

---

## Key Validation Points

### ✅ Proper Service Separation

| Layer | Responsibility | Example |
|-------|-----------------|---------|
| **Controller** | Route HTTP requests | Map /submit to service method |
| **Service** | Business logic | Grade quiz, award badges |
| **Repository** | Data persistence | Save/fetch from DB |
| **DTO** | Data transfer | JSON request/response objects |

### ✅ No Business Logic in Controllers
```java
// ❌ WRONG
@PostMapping("/submit")
public QuizResultResponse submitQuiz(@RequestBody QuizSubmissionRequest request) {
    // Don't do grading logic here
    int score = calculateScore(request);  // ❌ Wrong place
    return response;
}

// ✅ CORRECT
@PostMapping("/submit")
public QuizResultResponse submitQuiz(@RequestBody QuizSubmissionRequest request) {
    return gamificationService.submitQuiz(request);  // ✅ Delegate to service
}
```

### ✅ Services Only Talk to Repositories
```java
@Service
public class GamificationService {
    private final QuizAttemptRepository quizAttemptRepository;

    // ✅ Only repository calls
    public void saveAttempt(QuizAttempt attempt) {
        quizAttemptRepository.save(attempt);
    }

    // ✅ Can call other services (UserClient is a service-like interface)
    public UserDTO getUser(Long userId) {
        return userClient.getUserById(userId);  // ✅ Inter-service call via Feign
    }
}
```

---

## Testing Checklist

- [ ] Quiz Service retrieves all quizzes
- [ ] Quiz Service creates quiz with nested questions/answers
- [ ] Gamification Service grades quiz correctly (right/wrong answers)
- [ ] Credits calculated based on score and time
- [ ] User progression updated (attempts, credits, average score)
- [ ] Badges awarded correctly (14 different badge types)
- [ ] Day streak calculated from attempt dates
- [ ] Leaderboard fetches user details via Feign
- [ ] Exception handling for missing quiz/user
- [ ] All repositories persist data correctly

