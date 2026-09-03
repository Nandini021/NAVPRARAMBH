# SIDDHI AI - Quick API Reference

## 🔥 Most Used Patterns

### Show Notification
```typescript
const notification = useNotification();

// Success
notification.success('Title', 'Message');

// Achievement
notification.achievement('Title', 'Message', 'SIDDHI says...');

// Internship alert
notification.internshipAlert('Google', 'SWE');

// Interview alert
notification.interviewAlert('Meta');
```

### Start Interview
```typescript
const interview = useInterviewCoach();

// Start HR interview
interview.start('hr', 'Google', 'Product Manager', 'medium');

// Submit answer
interview.submitAnswer(answer, feedback, score);

// Move to next
interview.nextQuestion();

// End interview
const result = interview.end();
// result.totalScore, result.questions, etc.
```

### Analyze Resume
```typescript
const resume = useResumeCoach();

// Analyze
const analysis = resume.analyze(resumeContent);

// Get data
resume.atsScore          // 0-100
resume.suggestions       // ResumeSuggestion[]
resume.strengths         // string[]
resume.weaknesses        // string[]
```

### Get Recommendations
```typescript
const recommendation = useRecommendation();

// Update context
recommendation.updateContext({
  resumeScore: 85,
  skills: ['React', 'Node.js'],
  appliedJobs: 5,
  targetRole: 'Senior SWE',
});

// Generate
recommendation.generate();

// Use
recommendation.recommendations.map(rec => (
  <RecommendationCard key={rec.id} rec={rec} />
));
```

### Play Games
```typescript
const game = useGameCompanion();

// Start
game.startGame('quiz');

// Complete
const session = game.completeGame(score, hintsUsed);

// Get progress
game.stats.level
game.stats.totalXP
game.stats.streak        // 🔥

// Get achievements
game.stats.achievements
```

---

## 📋 All Hooks Cheat Sheet

### Module 1-3: Core
```typescript
import { useEmotion, useSpeechSynthesis, useSpeechRecognition } from '@/hooks';

const emotion = useEmotion();
emotion.setEmotion('happy');
emotion.celebrateScore(95);

const speech = useSpeechSynthesis();
speech.speak('Hello!', { rate: 1, pitch: 1 });

const recognition = useSpeechRecognition();
recognition.startListening();
```

### Module 4-6: Context
```typescript
import { useMemory, useActivity } from '@/hooks';

const memory = useMemory();
memory.addMessage('user', 'Hello');
memory.setUserProfile(userId, name, email);

const activity = useActivity();
activity.setActivity('dashboard', 'browsing');
activity.isIdle()
```

### Module 7-11: Advanced
```typescript
import { 
  useRecommendation, 
  useNotification,
  useInterviewCoach,
  useResumeCoach,
  useGameCompanion
} from '@/hooks';

// Each returns actions + state
```

---

## 📦 Component Usage

### NotificationContainer (Required)
```typescript
import { NotificationContainer } from '@/components/siddhi';

export function App() {
  return (
    <>
      <YourApp />
      <NotificationContainer />  {/* Add this */}
    </>
  );
}
```

### Avatar (Emotion-Driven)
```typescript
import { Avatar, useEmotion } from '@/components/siddhi';

export function ChatWithSIDDHI() {
  const emotion = useEmotion();

  return <Avatar size="medium" emotion={emotion.emotion} />;
}
```

### Chat Panel
```typescript
import { ChatPanel } from '@/components/siddhi';

<ChatPanel 
  isOpen={true}
  onSendMessage={async (msg) => { /* call AI */ }}
/>
```

---

## 🎨 Notification Types

```typescript
// Success (3s)
notification.success(title, message, siddhiMessage?);

// Warning (5s)
notification.warning(title, message, siddhiMessage?);

// Reminder (5s)
notification.notify('reminder', title, message);

// Achievement (5s)
notification.achievement(title, message, siddhiMessage?);

// Internship Alert (6s, with personality)
notification.internshipAlert(company, role);

// Interview Alert (6s, with personality)
notification.interviewAlert(company);

// Custom
notification.notify(type, title, message, {
  siddhiMessage: 'SIDDHI says...',
  actionUrl: '/path',
  actionLabel: 'Go',
  duration: 4000,
});
```

---

## 🎯 Interview Modes

```typescript
// HR Interview
interview.start('hr', 'Google', 'PM');

// Technical Interview (system design, algorithms)
interview.start('technical', 'Meta', 'SWE');

// Behavioral Interview
interview.start('behavioral', 'Amazon', 'TPM');

// Coding Interview
interview.start('coding', 'Microsoft', 'SWE');

// Difficulties
'easy' | 'medium' | 'hard'
```

---

## 📊 Resume Analysis

```typescript
// After analyzing:
analysis.atsScore           // 0-100
analysis.strengths          // string[]
analysis.weaknesses         // string[]
analysis.suggestions        // ResumeSuggestion[]
  ├─ .id
  ├─ .section (summary|experience|skills|education|projects)
  ├─ .issue
  ├─ .suggestion
  ├─ .priority (high|medium|low)
  └─ .impact (0-10)

// Methods
resume.analyze(content)           // Analyze resume
resume.getHighPriority()          // High-priority suggestions
resume.getHistory(limit)          // Previous analyses
resume.getScoreTrend()            // Score over time
```

---

## 🎮 Game System

```typescript
// Game types
'quiz' | 'coding' | 'puzzle' | 'case-study'

// XP System
// 1000 XP = 1 level
// Base: (score/max) * 100
// Coding games: 1.5x
// Case studies: 1.3x
// Perfect score: 1.5x

// Streaks
// ≥80% = maintain streak
// <80% = reset to 0
// Unbroken: +1 each time

// Achievements
// Common: 25% unlock rate
// Uncommon: 10% unlock rate
// Rare: 2% unlock rate
// Legendary: <1% unlock rate

// Access
game.stats.level
game.stats.totalXP
game.stats.streak             // 🔥
game.stats.bestStreak
game.stats.gamesPlayed
game.stats.averageScore
game.stats.achievementCount
game.xpProgress.percentage    // To next level
```

---

## 🔗 Recommendations

```typescript
// 10 Types
'next-course'
'next-skill'
'resume-improvement'
'interview-prep'
'job-match'
'internship-match'
'career-path'
'skill-gap'
'certification'
'project-idea'

// Context
updateContext({
  currentPage?: string;
  resumeScore?: number;
  skills: string[];
  completedCourses: string[];
  appliedJobs: number;
  applicationSuccess: number;
  targetRole?: string;
  targetCompanies: string[];
});

// Each recommendation has
rec.type              // Type
rec.title
rec.description
rec.reason
rec.priority          // high|medium|low
rec.score             // 0-100
rec.actionUrl
rec.metadata
rec.timestamp
```

---

## 🎨 Emotion States

```typescript
useEmotion() returns {
  emotion: 'idle' | 'happy' | 'thinking' | 'typing' | 
           'listening' | 'celebrating' | 'focused' | 
           'concerned' | 'motivating' | 'sleep',
  
  setEmotion(emotion, trigger?),
  celebrateScore(score),      // Auto-selects emotion
  startThinking(),
  stopThinking(),
  startListening(),
  stopListening(),
  showConcern(reason),
  motivate(message),
  sleep(),
  wake(),
}
```

---

## 🔄 Memory Access

```typescript
const memory = useMemory();

// Chat
memory.addMessage(role, content, metadata?);   // 'user' | 'ai'
memory.getMessages(limit?);

// User Profile
memory.setUserProfile(userId, userName, email);
memory.userProfile;

// Interview
memory.startInterview(mode, company, position);
memory.endInterview();
memory.addInterviewQuestion(q, answer, feedback);
memory.interviews;

// Quiz
memory.addQuizResult(topic, score, answers);
memory.quizProgress;

// Resume
memory.updateResume(content, score, feedback);
memory.resume;

// Activity
memory.addActivity(type, metadata?);
memory.getActivity(limit?);

// Logout
memory.clearMemory();  // Clears everything
```

---

## 🛠️ Store Direct Access

```typescript
import { recommendationStore, notificationStore, ... } from '@/store';

// Get current state
const state = store.getState?.();

// Subscribe directly (not recommended for React)
const unsubscribe = store.subscribe((state) => {
  console.log('Updated:', state);
});

// Don't forget cleanup
return unsubscribe;
```

---

## ✅ Common Patterns

### Pattern: Interview → Resume Analysis → Recommendations

```typescript
const interview = useInterviewCoach();
const resume = useResumeCoach();
const recommendation = useRecommendation();

// After interview
const result = interview.end();

// If low score, analyze resume
if (result?.totalScore < 70) {
  const analysis = resume.analyze(currentResume);
  
  // Update recommendations
  recommendation.updateContext({
    resumeScore: analysis.atsScore,
    appliedJobs: userJobs.length,
  });
  recommendation.generate();
}
```

### Pattern: Game Achievement → Notification → Next Activity

```typescript
const game = useGameCompanion();
const notification = useNotification();

// Complete game
const session = game.completeGame(score);

// Show achievement
if (session?.achievements.length) {
  notification.achievement(
    session.achievements[0].name,
    'Badge unlocked!',
    session.achievements[0].description
  );
}
```

### Pattern: Emotion + Notification + Avatar

```typescript
const emotion = useEmotion();
const notification = useNotification();

// Good result
emotion.celebrateScore(95);  // Sets emotion to 'celebrating'

notification.achievement(
  'Perfect!',
  'Score: 95%',
  'I knew you could do it! 🚀'
);

// Avatar automatically shows celebrating face via emotion
```

---

## 🚀 Performance Tips

1. **Don't update context on every render**
   ```typescript
   // ❌ Bad
   render() { recommendation.updateContext(...) }
   
   // ✅ Good
   useEffect(() => {
     recommendation.updateContext(...);
   }, [resumeScore, skills]);
   ```

2. **Batch updates**
   ```typescript
   // ❌ Bad
   updateContext({ resumeScore: 80 });
   updateContext({ skills: [...] });
   
   // ✅ Good
   updateContext({ resumeScore: 80, skills: [...] });
   ```

3. **Check state exists**
   ```typescript
   // ❌ Bad
   const score = interview.session.totalScore;
   
   // ✅ Good
   const score = interview.session?.totalScore ?? 0;
   ```

4. **Use hooks, not direct store**
   ```typescript
   // ❌ Bad
   const state = recommendationStore.getState();
   
   // ✅ Good
   const { recommendations } = useRecommendation();
   ```

---

## 🧪 Quick Tests

```typescript
// Module 7: Recommendations
const rec = useRecommendation();
rec.updateContext({ resumeScore: 75 });
rec.generate();
console.log(rec.recommendations);  // Should have top 5

// Module 8: Notifications
const notif = useNotification();
notif.success('Test', 'Should appear bottom-right');

// Module 9: Interview
const int = useInterviewCoach();
int.start('technical', 'Google', 'SWE');
console.log(int.currentQuestion?.question);  // Should have question

// Module 10: Resume
const res = useResumeCoach();
const analysis = res.analyze('your resume text');
console.log(analysis.atsScore);  // Should be 0-100

// Module 11: Games
const gm = useGameCompanion();
gm.startGame('quiz');
const sess = gm.completeGame(85);
console.log(gm.stats.totalXP);  // Should have XP
```

---

**Last Updated:** Session Complete
**All 11 Modules:** ✅ Ready
**Production Ready:** ✅ Yes
