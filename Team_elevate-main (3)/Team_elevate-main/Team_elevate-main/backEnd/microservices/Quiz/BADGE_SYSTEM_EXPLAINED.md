# Badge System - Complete Explanation

## Overview

The Badge System gamifies the learning experience by awarding **14 different badges** based on user performance across 5 categories. Badges are awarded automatically when conditions are met after each quiz submission.

---

## The 14 Badges

### 1. **VOLUME BADGES** (Based on Total Attempts)
These badges reward users for participation and consistency.

| Badge | Condition | Meaning |
|-------|-----------|---------|
| 🏅 **FIRST_STEP** | Total attempts ≥ 1 | Took your first quiz |
| 🔥 **QUIZ_ENTHUSIAST** | Total attempts ≥ 10 | Completed 10 quizzes |
| 👑 **QUIZ_MASTER** | Total attempts ≥ 50 | Completed 50 quizzes |

**Example:**
```
User 1 attempts:
1st quiz  → awarded FIRST_STEP
10th quiz → awarded QUIZ_ENTHUSIAST
50th quiz → awarded QUIZ_MASTER
```

---

### 2. **ACCURACY BADGES** (Based on Score Performance)
These badges reward users for high scores and consistent passing.

| Badge | Condition | Meaning |
|-------|-----------|---------|
| ✨ **PERFECT_SCORE** | Current score = 100% | Got 100% on this quiz |
| 🧠 **SHARP_MIND** | 5+ quizzes with score ≥ 90% | Smart solver (5 quizzes 90%+) |
| 📈 **CONSISTENT** | Consecutive passes ≥ 10 | Passed 10 quizzes in a row |

**Example:**
```
User 2 progression:
Quiz 1: 95% ✓
Quiz 2: 92% ✓
Quiz 3: 88% ✓
Quiz 4: 91% ✓
Quiz 5: 89% ✓  → awarded SHARP_MIND (5 quizzes with 90%+)

Passing 10 quizzes consecutively → awarded CONSISTENT
```

---

### 3. **SPEED BADGES** (Based on Completion Speed)
These badges reward users for quick thinking.

| Badge | Condition | Meaning |
|-------|-----------|---------|
| ⚡ **SPEED_DEMON** | Current time < 25% of allowed | Finished in under 25% of time |
| 🚀 **QUICK_THINKER** | 5+ attempts finished in < 50% time | Generally fast (5 fast attempts) |

**Example - SPEED_DEMON:**
```
Quiz duration: 10 minutes (600 seconds allowed)
25% of allowed time: 150 seconds

User completes quiz in: 120 seconds
120 < 150? YES → awarded SPEED_DEMON

Calculation: timeRatio = 120/600 = 0.2 (20%)
0.2 < 0.25? YES ✓
```

**Example - QUICK_THINKER:**
```
User's attempts:
Quiz 1: took 100 sec (allowed 300) = 33% ✓ (< 50%)
Quiz 2: took 250 sec (allowed 600) = 41% ✓ (< 50%)
Quiz 3: took 350 sec (allowed 900) = 38% ✓ (< 50%)
Quiz 4: took 200 sec (allowed 500) = 40% ✓ (< 50%)
Quiz 5: took 150 sec (allowed 400) = 37% ✓ (< 50%)
→ awarded QUICK_THINKER (5 fast attempts)
```

---

### 4. **CREDIT BADGES** (Based on Total Credits Earned)
These badges reward users for cumulative high performance.

| Badge | Condition | Meaning |
|-------|-----------|---------|
| 💰 **CREDIT_STARTER** | Total credits ≥ 100 | Earned 100+ credits |
| 💎 **CREDIT_COLLECTOR** | Total credits ≥ 500 | Earned 500+ credits |
| 👸 **CREDIT_CHAMPION** | Total credits ≥ 2000 | Earned 2000+ credits |

**Example:**
```
User 3 credits progression:
Quiz 1: 20 credits  (total: 20)
Quiz 2: 15 credits  (total: 35)
Quiz 3: 25 credits  (total: 60)
Quiz 4: 30 credits  (total: 90)
Quiz 5: 15 credits  (total: 105) → awarded CREDIT_STARTER

Continue...
Quiz 20: total reaches 500 → awarded CREDIT_COLLECTOR
Quiz 50: total reaches 2000 → awarded CREDIT_CHAMPION
```

---

### 5. **STREAK BADGES** (Based on Consecutive Days)
These badges reward daily engagement and habit formation.

| Badge | Condition | Meaning |
|-------|-----------|---------|
| 🔥 **THREE_DAY_STREAK** | Consecutive days ≥ 3 | Quizzed 3 days in a row |
| 🌟 **SEVEN_DAY_STREAK** | Consecutive days ≥ 7 | Weekly engagement (7 days) |

**Example:**
```
User 4 daily activity:
Day 1 (Mon): Quiz attempt ✓
Day 2 (Tue): Quiz attempt ✓
Day 3 (Wed): Quiz attempt ✓  → awarded THREE_DAY_STREAK

Day 4 (Thu): Quiz attempt ✓
Day 5 (Fri): Quiz attempt ✓
Day 6 (Sat): Quiz attempt ✓
Day 7 (Sun): Quiz attempt ✓  → awarded SEVEN_DAY_STREAK

Day 8 (Mon): No quiz ✗
Day 9 (Tue): Quiz attempt ✓  → streak resets to 1

Note: Streak is based on attempt DATES, not consecutive attempts
```

---

## How the Badge Code Works

### Step 1: Badge Evaluation Triggered
After quiz submission, `submitQuiz()` calls `evaluateAndAwardBadges()`:

```java
@Transactional
public QuizResultResponse submitQuiz(QuizSubmissionRequest request) {
    // ... grade quiz, calculate credits, update progression ...

    // Evaluate badges (line 87 in GamificationService)
    List<BadgeType> newBadges = evaluateAndAwardBadges(
        request.getUserId(),
        score,
        request.getTimeTakenSeconds(),
        allowedTimeSeconds
    );
    // ... return response with newBadges ...
}
```

### Step 2: Get User's Current Progression
```java
private List<BadgeType> evaluateAndAwardBadges(
    Long userId,
    double score,
    int timeTakenSeconds,
    int allowedTimeSeconds
) {
    List<BadgeType> newBadges = new ArrayList<>();

    // Fetch current stats
    UserProgression progression = userProgressionRepository
        .findByUserId(userId)
        .orElse(null);

    if (progression == null) return newBadges;  // No stats = no badges
```

### Step 3: Check Each Badge (14 Total)
```java
    // VOLUME: Check attempt counts
    checkAndAward(userId, BadgeType.FIRST_STEP,
        progression.getTotalAttempts() >= 1,
        newBadges);

    checkAndAward(userId, BadgeType.QUIZ_ENTHUSIAST,
        progression.getTotalAttempts() >= 10,
        newBadges);

    checkAndAward(userId, BadgeType.QUIZ_MASTER,
        progression.getTotalAttempts() >= 50,
        newBadges);

    // ACCURACY: Check score-based conditions
    checkAndAward(userId, BadgeType.PERFECT_SCORE,
        score == 100.0,
        newBadges);

    // Query DB for high-score quizzes
    long highScoreQuizzes = quizAttemptRepository
        .countDistinctQuizzesWithScoreAbove90(userId);
    checkAndAward(userId, BadgeType.SHARP_MIND,
        highScoreQuizzes >= 5,
        newBadges);

    checkAndAward(userId, BadgeType.CONSISTENT,
        progression.getConsecutivePassCount() >= 10,
        newBadges);

    // SPEED: Calculate time efficiency
    double timeRatio = (double) timeTakenSeconds / allowedTimeSeconds;
    checkAndAward(userId, BadgeType.SPEED_DEMON,
        timeRatio < 0.25,
        newBadges);

    // Query DB for fast attempts
    long fastAttempts = quizAttemptRepository
        .findFastAttempts(userId)
        .size();
    checkAndAward(userId, BadgeType.QUICK_THINKER,
        fastAttempts >= 5,
        newBadges);

    // CREDITS: Check credit totals
    checkAndAward(userId, BadgeType.CREDIT_STARTER,
        progression.getTotalCredits() >= 100,
        newBadges);

    checkAndAward(userId, BadgeType.CREDIT_COLLECTOR,
        progression.getTotalCredits() >= 500,
        newBadges);

    checkAndAward(userId, BadgeType.CREDIT_CHAMPION,
        progression.getTotalCredits() >= 2000,
        newBadges);

    // STREAKS: Check consecutive days
    checkAndAward(userId, BadgeType.THREE_DAY_STREAK,
        progression.getCurrentStreak() >= 3,
        newBadges);

    checkAndAward(userId, BadgeType.SEVEN_DAY_STREAK,
        progression.getCurrentStreak() >= 7,
        newBadges);

    return newBadges;  // Return newly awarded badges
}
```

### Step 4: Helper Method - checkAndAward()
This is the **core logic** that decides whether to award a badge:

```java
private void checkAndAward(
    Long userId,
    BadgeType badgeType,
    boolean condition,
    List<BadgeType> newBadges
) {
    // Only award if:
    // 1. Condition is true (meets criteria)
    // 2. User doesn't already have this badge
    if (condition && !userBadgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {

        // Create new badge record
        UserBadge badge = new UserBadge();
        badge.setUserId(userId);
        badge.setBadgeType(badgeType);
        // earnedDate auto-set by @PrePersist (LocalDateTime.now())

        // Save to database
        userBadgeRepository.save(badge);

        // Add to "newly awarded" list (for response)
        newBadges.add(badgeType);
    }
}
```

**Key Point:** `existsByUserIdAndBadgeType()` ensures each badge is awarded **only once per user**

---

## Real-World Example: Complete Flow

### User submits a quiz:

```
POST /quiz/gamification/submit
{
  "userId": 101,
  "quizId": 5,
  "timeTakenSeconds": 100,
  "answers": [...]
}
```

### Processing steps:

**Step 1: Grade Quiz**
```
Score = 100% (perfect!)
```

**Step 2: Calculate Credits**
```
Credits = 60 (high score + fast time)
```

**Step 3: Update Progression (assumed current stats)**
```
BEFORE:
- totalAttempts: 9
- totalCredits: 490
- consecutivePassCount: 3
- currentStreak: 2

AFTER:
- totalAttempts: 10  (9 + 1)
- totalCredits: 550  (490 + 60)
- consecutivePassCount: 4  (3 + 1, passed again)
- currentStreak: 3  (2 + 1, quizzed today again)
```

**Step 4: Evaluate 14 Badges**

```
VOLUME:
✓ FIRST_STEP          (totalAttempts 10 >= 1)  → ALREADY HAS
✓ QUIZ_ENTHUSIAST     (totalAttempts 10 >= 10) → AWARD! (new)
✗ QUIZ_MASTER         (totalAttempts 10 >= 50) → NO

ACCURACY:
✓ PERFECT_SCORE       (score == 100)           → AWARD! (new)
? SHARP_MIND          (need to query DB for 90%+ quizzes)
               Query result: 6 quizzes with 90%+ → ALREADY HAS
✗ CONSISTENT          (consecutivePassCount 4 >= 10) → NO

SPEED:
✓ SPEED_DEMON         (100/600 = 16.7% < 25%) → AWARD! (new)
? QUICK_THINKER       (need to query for fast attempts)
               Query result: 7 fast attempts → ALREADY HAS

CREDITS:
✓ CREDIT_STARTER      (totalCredits 550 >= 100)  → ALREADY HAS
✓ CREDIT_COLLECTOR    (totalCredits 550 >= 500)  → AWARD! (new)
✗ CREDIT_CHAMPION     (totalCredits 550 >= 2000) → NO

STREAKS:
✓ THREE_DAY_STREAK    (currentStreak 3 >= 3)     → AWARD! (new)
✗ SEVEN_DAY_STREAK    (currentStreak 3 >= 7)     → NO
```

**Step 5: Return Response**

```json
{
  "score": 100.0,
  "passed": true,
  "creditsEarned": 60,
  "newBadges": [
    "QUIZ_ENTHUSIAST",
    "PERFECT_SCORE",
    "SPEED_DEMON",
    "CREDIT_COLLECTOR",
    "THREE_DAY_STREAK"
  ],
  "attemptId": 42
}
```

**Step 6: Database Records Created**

```sql
-- UserBadge table
INSERT INTO user_badge (user_id, badge_type, earned_date)
VALUES (101, 'QUIZ_ENTHUSIAST', NOW());

INSERT INTO user_badge (user_id, badge_type, earned_date)
VALUES (101, 'PERFECT_SCORE', NOW());

INSERT INTO user_badge (user_id, badge_type, earned_date)
VALUES (101, 'SPEED_DEMON', NOW());

INSERT INTO user_badge (user_id, badge_type, earned_date)
VALUES (101, 'CREDIT_COLLECTOR', NOW());

INSERT INTO user_badge (user_id, badge_type, earned_date)
VALUES (101, 'THREE_DAY_STREAK', NOW());
```

---

## Database Schema

### UserBadge Table
```sql
CREATE TABLE user_badge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    earned_date DATETIME NOT NULL,

    UNIQUE CONSTRAINT (user_id, badge_type)  -- Can't have duplicate
);
```

**Fields:**
- `id` - Primary key
- `user_id` - Reference to user
- `badge_type` - Enum: FIRST_STEP, QUIZ_ENTHUSIAST, etc.
- `earned_date` - Timestamp when badge was earned
- **UNIQUE constraint** - Ensures each badge awarded only once per user

---

## Key Implementation Details

### 1. One Badge Per User
```java
if (condition && !userBadgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {
    // Only save if condition is true AND user doesn't have badge
}
```
The `existsByUserIdAndBadgeType()` query prevents duplicate awards.

### 2. Database Unique Constraint
```java
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "badgeType"}))
public class UserBadge { ... }
```
Database enforces uniqueness at storage level.

### 3. Auto-Set earnedDate
```java
@PrePersist
protected void onCreate() {
    earnedDate = LocalDateTime.now();
}
```
Automatically sets timestamp when badge is saved.

### 4. Repository Custom Query
```java
boolean existsByUserIdAndBadgeType(Long userId, BadgeType badgeType);
```
Spring Data automatically generates SQL:
```sql
SELECT COUNT(*) > 0
FROM user_badge
WHERE user_id = ? AND badge_type = ?
```

---

## Getting User Badges

### Endpoint:
```
GET /quiz/gamification/badges/{userId}
```

### Code:
```java
public List<UserBadge> getUserBadges(Long userId) {
    return userBadgeRepository.findByUserId(userId);
}
```

### Response Example:
```json
[
  {
    "id": 1,
    "userId": 101,
    "badgeType": "FIRST_STEP",
    "earnedDate": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "userId": 101,
    "badgeType": "QUIZ_ENTHUSIAST",
    "earnedDate": "2024-01-22T14:20:00"
  },
  {
    "id": 3,
    "userId": 101,
    "badgeType": "PERFECT_SCORE",
    "earnedDate": "2024-01-25T09:45:00"
  }
]
```

---

## Summary

### Badge Flow:
```
User submits quiz
    ↓
Grade & calculate
    ↓
Update progression
    ↓
Evaluate 14 badges:
  - Check condition
  - Check if already has badge
  - If both true: save to DB
  - Add to newBadges list
    ↓
Return response with newBadges
```

### Key Points:
✅ 14 total badges across 5 categories
✅ Awarded automatically after each quiz
✅ Each badge awarded **only once per user**
✅ Database enforces uniqueness
✅ earnedDate tracked automatically
✅ Badges visible in user profile

