# Hard Functions - Detailed Explanation for Validation

All complex functions in **GamificationService.java** have been heavily commented. This guide shows what each function does.

---

## 1️⃣ submitQuiz() - Main Orchestrator Function

**Location:** GamificationService.java, line 59

**Purpose:** Master function that orchestrates the entire quiz submission process

**Flow (7 Steps):**
```
STEP 1: Validate quiz exists
         ↓
STEP 2: Grade the quiz (compare answers)
         ↓
STEP 3: Calculate score & credits
         ↓
STEP 4: Save quiz attempt to database
         ↓
STEP 5: Update user progression (stats)
         ↓
STEP 6: Evaluate & award badges
         ↓
STEP 7: Build & return response
```

**Key Logic:**
```java
// Grade the quiz
for (QuestionAnswerDTO answerDTO : request.getAnswers()) {
    // Find question
    Question question = questions.stream()
        .filter(q -> q.getId().equals(answerDTO.getQuestionId()))
        .findFirst()
        .orElse(null);

    // Check if answer is correct
    boolean isCorrect = question.getAnswers().stream()
        .anyMatch(a -> a.getId().equals(answerDTO.getSelectedAnswerId())
                && Boolean.TRUE.equals(a.getIsCorrect()));

    // Count it
    if (isCorrect) correctCount++;
}

// Calculate score percentage
double score = (correctCount * 100.0) / totalQuestions;  // e.g., 2/3 * 100 = 66.67%
```

**Example:**
```
Input: Quiz 5, User 101, answered 2 of 3 correctly, took 120 seconds
Process:
  1. Grade: 2 correct → score = 66.67%
  2. Credits: 10 × 1 × 2.0 = 20 credits (score tier 1x, time 2.0x)
  3. Save QuizAttempt with ID 42
  4. Update progression: attempts 4→5, credits 150→170
  5. Award badges: [SPEED_DEMON, THREE_DAY_STREAK]
Output: QuizResultResponse(score=66.67%, credits=20, newBadges=[...])
```

---

## 2️⃣ calculateCredits() - Credit Calculation Formula

**Location:** GamificationService.java, line 123

**Purpose:** Calculate how many credits user earns from quiz attempt

**Formula:**
```
Credits = 10 × scoreMultiplier × timeEfficiency

scoreMultiplier:
  90-100% → 3x (excellent)
  75-89%  → 2x (good)
  50-74%  → 1x (passing)
  <50%    → 0x (failed - no credits)

timeEfficiency (capped 0.5-2.0):
  faster than allowed → bonus (up to 2.0x)
  slower than allowed → penalty (down to 0.5x)
```

**Key Logic:**
```java
// Step 1: Score multiplier based on percentage
int scoreMultiplier;
if (score >= 90) scoreMultiplier = 3;        // 90-100% → 3x
else if (score >= 75) scoreMultiplier = 2;  // 75-89% → 2x
else if (score >= 50) scoreMultiplier = 1;  // 50-74% → 1x
else return 0;                               // Failed → 0 credits

// Step 2: Time efficiency multiplier
double timeEfficiency = (double) allowedTimeSeconds / timeTakenSeconds;
// If allowed 600s, user took 150s → 600/150 = 4.0
// Cap between 0.5 and 2.0 → becomes 2.0

timeEfficiency = Math.max(0.5, Math.min(2.0, timeEfficiency));

// Step 3: Calculate credits
return (int) Math.round(10 * scoreMultiplier * timeEfficiency);
```

**Examples:**
```
Scenario 1: Excellent & Fast
  Score: 95% → multiplier = 3x
  Time: 120s of 600s allowed → 600/120 = 5.0 → capped to 2.0
  Credits = 10 × 3 × 2.0 = 60 ✅

Scenario 2: Good & Medium
  Score: 75% → multiplier = 2x
  Time: 300s of 600s allowed → 600/300 = 2.0
  Credits = 10 × 2 × 2.0 = 40 ✅

Scenario 3: Passing & Slow
  Score: 55% → multiplier = 1x
  Time: 800s of 600s allowed → 600/800 = 0.75 → capped to 0.5
  Credits = 10 × 1 × 0.5 = 5 ✅

Scenario 4: Failed
  Score: 40% → return 0 (no credits for failing)
```

---

## 3️⃣ updateProgression() - Update User Statistics

**Location:** GamificationService.java, line 173

**Purpose:** Update user's overall statistics after quiz attempt

**Statistics Updated:**
```
totalAttempts    → +1
totalCredits     → +credits earned
averageScore     → recalculate
totalPassed      → +1 if passed
consecutivePass  → +1 if passed, reset to 0 if failed
currentStreak    → recalculate days
bestStreak       → track highest ever
```

**Key Logic:**

```java
// Step 1: Get or create progression
UserProgression progression = userProgressionRepository
    .findByUserId(userId)
    .orElseGet(() -> new UserProgression(...));  // Create if first quiz

// Step 2: Update attempt count
progression.setTotalAttempts(progression.getTotalAttempts() + 1);
progression.setTotalCredits(progression.getTotalCredits() + credits);

// Step 3: Recalculate average score
// Formula: newAverage = (oldAverage × oldCount + newScore) / newCount
double totalScoreSum = progression.getAverageScore() * (progression.getTotalAttempts() - 1) + score;
progression.setAverageScore(totalScoreSum / progression.getTotalAttempts());

// Step 4: Update pass stats
if (passed) {
    progression.setTotalPassed(progression.getTotalPassed() + 1);
    progression.setConsecutivePassCount(progression.getConsecutivePassCount() + 1);
} else {
    progression.setConsecutivePassCount(0);  // Failed breaks streak
}

// Step 5: Update day streak
updateDayStreak(userId, progression);

// Step 6: Save
userProgressionRepository.save(progression);
```

**Example:**
```
Before: totalAttempts=4, credits=150, avgScore=75, passed=3, consecutivePass=2, streak=1
Submit: score=66.67%, credits=20, passed=true

After:
  totalAttempts = 4 + 1 = 5
  totalCredits = 150 + 20 = 170
  averageScore = (75 × 4 + 66.67) / 5 = 72.53
  totalPassed = 3 + 1 = 4
  consecutivePassCount = 2 + 1 = 3
  currentStreak = calculated from dates
```

---

## 4️⃣ updateDayStreak() - Calculate Consecutive Days

**Location:** GamificationService.java, line 231

**Purpose:** Calculate how many consecutive days user has attempted a quiz

**Complexity:** Must determine consecutive days from attempt dates

**Key Logic:**
```java
// Step 1: Get all quiz attempts ordered by date DESC
List<QuizAttempt> recentAttempts = quizAttemptRepository.findRecentAttempts(userId);

// Step 2: Handle edge case - less than 2 attempts
if (recentAttempts.size() < 2) {
    progression.setCurrentStreak(1);
    return;
}

// Step 3: Extract unique DATES (remove duplicates if multiple quizzes same day)
// DateTime: [2024-01-15 10:30, 2024-01-15 14:20, 2024-01-14 09:00, 2024-01-13 11:00]
// LocalDate: [2024-01-15, 2024-01-14, 2024-01-13]
Set<LocalDate> attemptDays = recentAttempts.stream()
    .map(a -> a.getAttemptDate().toLocalDate())
    .collect(Collectors.toCollection(TreeSet::new));

// Step 4: Sort descending (most recent first)
List<LocalDate> sortedDays = new ArrayList<>(new TreeSet<>(attemptDays));
Collections.reverse(sortedDays);
// Result: [2024-01-15, 2024-01-14, 2024-01-13]

// Step 5: Count consecutive days
int streak = 1;  // Start with 1 (most recent day)
for (int i = 1; i < sortedDays.size(); i++) {
    // Check if each day is exactly 1 day before previous
    if (sortedDays.get(i - 1).minusDays(1).equals(sortedDays.get(i))) {
        streak++;  // Continue streak
    } else {
        break;  // Gap found, stop counting
    }
}
// Example: 2024-01-15 - 1 day = 2024-01-14 ✓
//          2024-01-14 - 1 day = 2024-01-13 ✓
//          → streak = 3

// Step 6: Update current and best streak
progression.setCurrentStreak(streak);
progression.setBestStreak(Math.max(progression.getBestStreak(), streak));
```

**Visual Example:**
```
Attempt Dates:
Jan 15 (Sun) - quiz attempt ✓
Jan 14 (Sat) - quiz attempt ✓
Jan 13 (Fri) - quiz attempt ✓
Jan 12 (Thu) - NO quiz ✗
Jan 11 (Wed) - quiz attempt ✓

Current Streak = 3 (Jan 15, 14, 13 are consecutive)
Best Streak = 4 (Jan 15, 14, 13, 12... wait, gap on Jan 12)
             Actually = 3 (consecutive from latest)
```

---

## 5️⃣ evaluateAndAwardBadges() - Badge Evaluation

**Location:** GamificationService.java, line 279

**Purpose:** Check all 14 badge criteria and award new badges

**14 Badges in 5 Categories:**
```
VOLUME:  FIRST_STEP(1+), QUIZ_ENTHUSIAST(10+), QUIZ_MASTER(50+)
ACCURACY: PERFECT_SCORE(100%), SHARP_MIND(5×90%+), CONSISTENT(10 pass streak)
SPEED:   SPEED_DEMON(<25% time), QUICK_THINKER(5 fast)
CREDITS: CREDIT_STARTER(100+), COLLECTOR(500+), CHAMPION(2000+)
STREAKS: THREE_DAY_STREAK(3+days), SEVEN_DAY_STREAK(7+days)
```

**Key Logic:**
```java
// Step 1: Get user progression
UserProgression progression = userProgressionRepository.findByUserId(userId).orElse(null);

// Step 2: Loop through 14 badges
// VOLUME
checkAndAward(userId, FIRST_STEP, progression.getTotalAttempts() >= 1, newBadges);
checkAndAward(userId, QUIZ_ENTHUSIAST, progression.getTotalAttempts() >= 10, newBadges);

// ACCURACY
checkAndAward(userId, PERFECT_SCORE, score == 100.0, newBadges);
long highScoreQuizzes = quizAttemptRepository.countDistinctQuizzesWithScoreAbove90(userId);
checkAndAward(userId, SHARP_MIND, highScoreQuizzes >= 5, newBadges);

// SPEED
double timeRatio = (double) timeTakenSeconds / allowedTimeSeconds;
checkAndAward(userId, SPEED_DEMON, timeRatio < 0.25, newBadges);

// ... and so on for all 14 badges

// Step 3: Return newly awarded badges
return newBadges;
```

---

## 6️⃣ checkAndAward() - Award Single Badge

**Location:** GamificationService.java, line 397

**Purpose:** Helper method - award a badge if criteria met AND user doesn't have it

**Key Logic:**
```java
private void checkAndAward(
    Long userId,
    BadgeType badgeType,
    boolean condition,
    List<BadgeType> newBadges
) {
    // Award ONLY IF:
    // ✓ Condition is true (criteria met)
    // ✓ User doesn't already have badge (prevent duplicates)

    if (condition && !userBadgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {

        // Create badge
        UserBadge badge = new UserBadge();
        badge.setUserId(userId);
        badge.setBadgeType(badgeType);
        // earnedDate auto-set by @PrePersist

        // Save to database
        userBadgeRepository.save(badge);

        // Add to response list
        newBadges.add(badgeType);
    }
}
```

**Why This Design:**
- `existsByUserIdAndBadgeType()` checks database: prevent duplicate awards
- `condition && !exists` ensures: criteria met AND first time getting badge
- Only saves if BOTH conditions true

---

## Summary Table

| Function | Complexity | Purpose | Key Logic |
|----------|-----------|---------|-----------|
| **submitQuiz()** | 🔴 Hard | Master orchestrator | Grade → Credits → Save → Update → Badges → Return |
| **calculateCredits()** | 🟡 Medium | Formula: 10×multiplier×efficiency | Score 90+→3x, fast→2.0x |
| **updateProgression()** | 🟡 Medium | Update user stats | Running average, +1 attempt, streak logic |
| **updateDayStreak()** | 🔴 Hard | Calculate consecutive days | Extract dates → sort → loop checking gaps |
| **evaluateAndAwardBadges()** | 🟡 Medium | Check 14 badges | Loop 14 times, call checkAndAward() |
| **checkAndAward()** | 🟢 Easy | Award one badge | If condition AND !hasIt → save |

---

## For Your Validation

**Questions will likely ask about:**
1. How submitQuiz() orchestrates the flow
2. How calculateCredits() formula works (with examples)
3. How updateDayStreak() determines consecutive days
4. How checkAndAward() prevents duplicate badges
5. How evaluateAndAwardBadges() checks all 14 badges

**All functions now have step-by-step comments explaining every line!**

