# SIDDHI AI - Complete 11-Module Integration Guide

## 🎯 Overview

SIDDHI is an intelligent AI mentor system with 11 integrated modules:

1. **Avatar System** - Visual representation with emotion-driven expressions
2. **Chat Engine** - Conversational interface with memory
3. **Voice Engine** - Speech synthesis and recognition
4. **Emotion Engine** - Emotional state management
5. **Memory Engine** - Never-forget conversation persistence
6. **Activity Tracker** - Context awareness and idle detection
7. **Recommendation Engine** - Intelligent contextual recommendations
8. **Notification Engine** - Smart toast notifications with personality
9. **Interview Coach** - AI interviewer with pause/resume capability
10. **Resume Coach** - Resume analysis and ATS scoring
11. **Game Companion** - Game coaching with XP and achievements

## 🏗️ Architecture

All modules use a **lightweight custom store pattern** with React hooks:

```typescript
// Each store exports:
export const moduleStore = {
  // State management methods
  method1: () => { ... },
  method2: () => { ... },
  
  // React integration
  subscribe: (listener) => {
    // Returns unsubscribe function
  }
}

// Each hook integrates store with React:
export function useModule() {
  const [state, setState] = useState(moduleStore.getState());
  
  useEffect(() => {
    return moduleStore.subscribe((newState) => {
      setState(newState);
    });
  }, []);
  
  return { state, actions... };
}
```

## 📦 Installation & Setup

### 1. Import NotificationContainer (Required)

Add to your main app or layout component:

```typescript
import { NotificationContainer } from '@/components/siddhi';

export function App() {
  return (
    <div>
      {/* Your app content */}
      <NotificationContainer />
    </div>
  );
}
```

### 2. Import All Hooks Where Needed

```typescript
import {
  useEmotion,
  useMemory,
  useActivity,
  useRecommendation,
  useNotification,
  useInterviewCoach,
  useResumeCoach,
  useGameCompanion,
} from '@/hooks';
```

## 📚 Module Reference

### Module 1-6: Core Modules (Pre-built)

See existing documentation for:
- Avatar System
- Chat Engine
- Voice Engine
- Emotion Engine
- Memory Engine
- Activity Tracker

### Module 7: Recommendation Engine

**Purpose:** Generate contextual recommendations based on user activity, resume score, skills, and learning history.

#### Quick Start

```typescript
import { useRecommendation } from '@/hooks';

export function RecommendationsPanel() {
  const { 
    recommendations, 
    updateContext, 
    generate, 
    markActioned 
  } = useRecommendation();

  useEffect(() => {
    // Update context when user profile changes
    updateContext({
      currentPage: 'dashboard',
      resumeScore: 85,
      skills: ['React', 'TypeScript', 'Node.js'],
      completedCourses: ['JavaScript Basics', 'React Fundamentals'],
      appliedJobs: 5,
      applicationSuccess: 2,
      targetRole: 'Senior Frontend Engineer',
      targetCompanies: ['Google', 'Meta'],
    });

    // Generate recommendations
    generate();
  }, []);

  return (
    <div className="space-y-4">
      {recommendations.map(rec => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onAction={() => markActioned(rec.id)}
        />
      ))}
    </div>
  );
}
```

#### Recommendation Types

- `next-course` - Continue learning path
- `next-skill` - Skills to develop
- `resume-improvement` - Resume optimization
- `interview-prep` - Interview preparation
- `job-match` - Job opportunities
- `internship-match` - Internship opportunities
- `career-path` - Career trajectory
- `skill-gap` - Missing skills for target role
- `certification` - Certification opportunities
- `project-idea` - Project ideas

#### Key Methods

```typescript
const { 
  recommendations,      // Array of top 5 recommendations
  updateContext,        // (context: Partial<RecommendationContext>) => void
  generate,            // (customRecs?: Recommendation[]) => Recommendation[]
  getByType,          // (type: RecommendationType) => Recommendation | undefined
  getTop,             // (count?: number) => Recommendation[]
  markActioned,       // (id: string) => void
} = useRecommendation();
```

### Module 8: Notification Engine

**Purpose:** Smart notifications with SIDDHI personality. Supports 6 notification types with auto-dismissal and actions.

#### Quick Start

```typescript
import { useNotification } from '@/hooks';

export function JobAlert() {
  const notification = useNotification();

  const handleNewJobFound = (job) => {
    // Simple success notification
    notification.success(
      'Job Found!',
      `${job.company} is hiring for ${job.role}`
    );

    // Or with SIDDHI personality
    notification.internshipAlert(
      job.company,
      job.role
    );
  };

  return (
    <button onClick={() => handleNewJobFound({ company: 'Google', role: 'SWE' })}>
      Show Notification
    </button>
  );
}
```

#### Notification Types & Methods

```typescript
// Success (3s auto-dismiss)
notification.success(
  title: string,
  message: string,
  siddhiMessage?: string
)

// Warning (5s auto-dismiss)
notification.warning(
  title: string,
  message: string,
  siddhiMessage?: string
)

// Achievement (5s auto-dismiss)
notification.achievement(
  title: string,
  message: string,
  siddhiMessage?: string
)

// Internship Alert (6s auto-dismiss)
notification.internshipAlert(
  company: string,
  role: string
)

// Interview Alert (6s auto-dismiss)
notification.interviewAlert(
  company: string
)

// Custom Notification
notification.notify(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    siddhiMessage?: string;
    actionUrl?: string;
    actionLabel?: string;
    duration?: number;
  }
)
```

#### Features

- Animated toast with slide-in/out
- Auto-dismiss or persistent (duration: 0)
- SIDDHI personality messages
- Action buttons with URLs
- Progress bar showing time to dismiss
- Type-specific icons and colors

### Module 9: Interview Coach

**Purpose:** AI interviewer with HR, Technical, Behavioral, and Coding modes. Supports pause/resume, scoring, and report generation.

#### Quick Start

```typescript
import { useInterviewCoach } from '@/hooks';
import { useNotification } from '@/hooks';

export function InterviewSession() {
  const interview = useInterviewCoach();
  const notification = useNotification();

  const handleStartInterview = () => {
    interview.start(
      'technical',           // mode: 'hr' | 'technical' | 'behavioral' | 'coding'
      'Google',             // company
      'Senior SWE',         // position
      'hard'                // difficulty: 'easy' | 'medium' | 'hard'
    );

    notification.success(
      'Interview Started',
      'Let\'s prepare you for success!'
    );
  };

  const handleAnswerSubmit = (answer: string) => {
    const score = evaluateAnswer(answer);
    interview.submitAnswer(
      answer,
      'Great explanation of the algorithm!',
      score
    );
  };

  const handleNext = () => {
    const hasNext = interview.nextQuestion();
    if (!hasNext) {
      // All questions done
      const result = interview.end();
      notification.achievement(
        'Interview Completed!',
        `Final Score: ${result?.totalScore}%`
      );
    }
  };

  return (
    <div className="space-y-4">
      {interview.session && (
        <>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3>{interview.session.company} - {interview.session.position}</h3>
            <p>Question {interview.session.currentQuestionIndex + 1} of {interview.session.questions.length}</p>
          </div>

          {interview.currentQuestion && (
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-lg">{interview.currentQuestion.question}</p>
              <textarea
                placeholder="Your answer..."
                className="w-full mt-4 p-2 border rounded"
              />
              <div className="flex gap-2 mt-4">
                <button onClick={handleAnswerSubmit}>Submit Answer</button>
                <button onClick={() => interview.pause()}>Pause</button>
                <button onClick={handleNext}>Next Question</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

#### Interview Modes

```typescript
// HR Interview - Behavioral questions
interview.start('hr', 'Google', 'Product Manager', 'medium');

// Technical Interview - System design, algorithms
interview.start('technical', 'Meta', 'SWE', 'hard');

// Behavioral Interview - Situational questions
interview.start('behavioral', 'Amazon', 'TPM', 'easy');

// Coding Interview - Live coding challenges
interview.start('coding', 'Microsoft', 'SWE', 'medium');
```

#### Key Methods

```typescript
const {
  // State
  session,              // Current interview session
  currentQuestion,      // Current question object
  isInProgress,        // Boolean
  isPaused,            // Boolean
  isCompleted,         // Boolean
  
  // Actions
  start,               // (mode, company, position, difficulty?) => Session
  submitAnswer,        // (answer, feedback?, score?) => void
  nextQuestion,        // () => boolean (returns false if no more questions)
  pause,              // () => void
  resume,             // () => void
  end,                // () => Session | undefined
  getHistory,         // (limit?) => Session[]
  getAverageScore,    // () => number (0-100)
} = useInterviewCoach();
```

### Module 10: Resume Coach

**Purpose:** Resume analysis with ATS scoring, weakness detection, and improvement suggestions.

#### Quick Start

```typescript
import { useResumeCoach } from '@/hooks';
import { useNotification } from '@/hooks';

export function ResumeAnalyzer() {
  const resume = useResumeCoach();
  const notification = useNotification();
  const [content, setContent] = useState('');

  const handleAnalyze = () => {
    const analysis = resume.analyze(content);
    
    if (analysis.atsScore >= 80) {
      notification.achievement(
        'Great Resume!',
        `Your ATS score is ${analysis.atsScore}%`,
        'Keep it up!'
      );
    } else {
      notification.warning(
        'Resume Improvement Needed',
        `Your ATS score is ${analysis.atsScore}%`,
        'Let me help you improve it.'
      );
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your resume here..."
        className="w-full h-64 p-4 border rounded"
      />
      
      <button onClick={handleAnalyze} className="px-4 py-2 bg-blue-500 text-white rounded">
        Analyze Resume
      </button>

      {resume.analysis && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
            <div className="text-4xl font-bold">{resume.atsScore}</div>
            <div className="text-sm opacity-90">ATS Score</div>
          </div>

          {resume.weaknesses.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-700">Weaknesses</h3>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {resume.weaknesses.map(w => <li key={w}>{w}</li>)}
              </ul>
            </div>
          )}

          {resume.suggestions.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-700">Top Suggestions</h3>
              <ul className="mt-2 space-y-2">
                {resume.suggestions.slice(0, 3).map(s => (
                  <li key={s.id} className="text-sm">
                    <strong>{s.section}:</strong> {s.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### Key Methods

```typescript
const {
  // State
  analysis,                    // Current analysis object
  atsScore,                   // 0-100 score
  suggestions,                // ResumeSuggestion[]
  strengths,                  // string[]
  weaknesses,                 // string[]
  
  // Actions
  analyze,                    // (content: string) => ResumeAnalysis
  getHighPriority,           // () => ResumeSuggestion[] (high priority only)
  getHistory,                // (limit?) => ResumeAnalysis[]
  getScoreTrend,             // () => number[] (ATS scores over time)
} = useResumeCoach();
```

#### Suggestion Priority

```typescript
// High Priority (Impact 8-10)
// - Missing email
// - Missing phone
// - No quantified achievements
// - No dedicated skills section

// Medium Priority (Impact 6-7)
// - Weak action verbs
// - Missing projects section
// - Poor formatting

// Low Priority (Impact 4-5)
// - Resume too short
// - No LinkedIn link
```

### Module 11: Game Companion

**Purpose:** Game coaching with XP tracking, achievements, and streaks. Celebrates wins and encourages on losses.

#### Quick Start

```typescript
import { useGameCompanion } from '@/hooks';
import { useNotification } from '@/hooks';
import { useEmotion } from '@/hooks';

export function GameQuiz() {
  const game = useGameCompanion();
  const notification = useNotification();
  const emotion = useEmotion();
  const [score, setScore] = useState(0);

  const handleGameStart = () => {
    game.startGame('quiz');
    emotion.startThinking();
  };

  const handleGameEnd = (finalScore: number) => {
    const session = game.completeGame(finalScore);

    if (finalScore >= 90) {
      emotion.celebrateScore(finalScore);
      notification.achievement(
        'Excellent!',
        `Score: ${finalScore}%`,
        'Perfect execution!'
      );
    } else if (finalScore >= 70) {
      emotion.setEmotion('happy');
      notification.success(
        'Great Job!',
        `Score: ${finalScore}%`
      );
    } else {
      emotion.showConcern('low score');
      notification.warning(
        'Keep Practicing',
        `Score: ${finalScore}%`,
        'You\'ll do better next time!'
      );
    }

    // Show achievements
    if (session?.achievements.length) {
      notification.achievement(
        'New Achievement Unlocked!',
        session.achievements[0].name
      );
    }
  };

  return (
    <div>
      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm opacity-75">Level {game.stats.level}</div>
            <div className="text-2xl font-bold">{game.stats.totalXP} XP</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Streak</div>
            <div className="text-2xl font-bold">🔥 {game.stats.streak}</div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${game.xpProgress.percentage}%` }}
            className="h-full bg-white"
          />
        </div>
        <div className="text-xs mt-1 opacity-75">
          {game.xpProgress.current}/{game.xpProgress.needed} XP
        </div>
      </div>

      <button
        onClick={handleGameStart}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
      >
        {game.isPlaying ? 'Game In Progress...' : 'Start Game'}
      </button>

      {/* Achievements */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {game.stats.achievements.map(ach => (
          <div key={ach.id} className="text-center">
            <div className="text-3xl">{ach.icon}</div>
            <div className="text-xs font-semibold">{ach.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Game Types

```typescript
game.startGame('quiz');       // Knowledge quizzes
game.startGame('coding');     // Coding challenges
game.startGame('puzzle');     // Logic puzzles
game.startGame('case-study'); // Business case studies
```

#### XP & Leveling

```typescript
// XP Calculation:
// Base: (score / maxScore) * 100
// Coding games: 1.5x multiplier
// Case study: 1.3x multiplier
// Perfect score: 1.5x multiplier

// Leveling:
// 1000 XP = 1 Level
// Level = floor(totalXP / 1000) + 1

// Streaks:
// Maintained by scoring ≥80%
// Resets if score <80%
```

#### Key Methods

```typescript
const {
  // State
  session,             // Current game session
  stats,              // { totalXP, level, streak, bestStreak, ... }
  xpProgress,         // { current, needed, percentage }
  isPlaying,         // Boolean
  
  // Actions
  startGame,         // (gameType: GameType) => Session
  completeGame,      // (score: number, hintsUsed?) => Session
  useHint,          // () => boolean
  getAchievements,  // () => Achievement[]
  getHistory,       // (gameType?, limit?) => Session[]
} = useGameCompanion();
```

#### Achievement Types

```typescript
// Common (25% of users)
// - First game completed
// - 50 XP earned

// Uncommon (10% of users)
// - Self Reliant (no hints used)
// - 5-win streak

// Rare (2% of users)
// - Perfect Score (100%)
// - Code Master (90%+ coding)

// Legendary (<1% of users)
// - 10+ win streak
// - 100 total achievements
```

## 🔗 Integration Patterns

### Pattern 1: Context-Aware Recommendations

```typescript
export function Dashboard() {
  const recommendation = useRecommendation();
  const activity = useActivity();
  const memory = useMemory();
  const resumeCoach = useResumeCoach();

  useEffect(() => {
    // Update recommendation context based on all data
    recommendation.updateContext({
      currentPage: 'dashboard',
      resumeScore: resumeCoach.atsScore,
      skills: memory.userProfile.skills,
      completedCourses: memory.completedCourses,
      appliedJobs: memory.jobApplications?.length ?? 0,
      applicationSuccess: memory.interviews?.length ?? 0,
    });

    recommendation.generate();
  }, [activity, memory, resumeCoach]);

  return (
    <div>
      {recommendation.recommendations.map(rec => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}
```

### Pattern 2: Emotion-Triggered Notifications

```typescript
export function InterviewResults() {
  const interview = useInterviewCoach();
  const notification = useNotification();
  const emotion = useEmotion();

  const handleInterviewEnd = () => {
    const result = interview.end();
    
    if (!result) return;

    // Trigger emotion based on score
    if (result.totalScore >= 90) {
      emotion.celebrateScore(result.totalScore);
    } else if (result.totalScore >= 70) {
      emotion.setEmotion('happy');
    } else {
      emotion.showConcern('low interview score');
    }

    // Show personality-driven notification
    const siddhiMessages = {
      90: 'Outstanding! You\'re ready for the real thing!',
      70: 'Good effort! A few more practice rounds and you\'ll crush it!',
      50: 'Let\'s work on this. Want to try again?',
    };

    const key = Object.keys(siddhiMessages)
      .map(Number)
      .reverse()
      .find(k => result.totalScore >= k) ?? 50;

    notification.notify(
      'reminder',
      'Interview Complete',
      `Score: ${result.totalScore}%`,
      { siddhiMessage: siddhiMessages[key] }
    );
  };

  return <button onClick={handleInterviewEnd}>End Interview</button>;
}
```

### Pattern 3: Progressive Gamification

```typescript
export function LearningPath() {
  const game = useGameCompanion();
  const memory = useMemory();
  const notification = useNotification();

  const handleLessonComplete = async (lessonId: string) => {
    // Mark lesson complete in memory
    memory.addActivity('course-complete', { lessonId });

    // Start game to test knowledge
    game.startGame('quiz');

    // SIDDHI personality
    emotion.motivate('Great! Let\'s test what you learned.');
  };

  const handleGameScore = (score: number) => {
    const session = game.completeGame(score);

    // Chain achievements to next activities
    if (score >= 90) {
      notification.achievement(
        'Mastery Achieved!',
        `You've earned ${session?.xpEarned} XP`,
        'Ready for the next level?'
      );
    }
  };

  return (
    <div>
      {/* Show progress visually */}
      <div className="mt-4 space-y-2">
        <div>XP: {game.stats.totalXP}</div>
        <div>Level: {game.stats.level}</div>
        <div>Streak: 🔥 {game.stats.streak}</div>
      </div>
    </div>
  );
}
```

## 🛠️ Best Practices

### 1. Always Check State Before Using

```typescript
// ❌ Don't do this
const score = interview.session.totalScore;

// ✅ Do this
const score = interview.session?.totalScore ?? 0;
```

### 2. Clean Up Subscriptions

```typescript
// Hooks handle this automatically, but if using stores directly:
useEffect(() => {
  const unsubscribe = recommendationStore.subscribe((state) => {
    // handle update
  });
  
  return unsubscribe; // Clean up!
}, []);
```

### 3. Batch Context Updates

```typescript
// ❌ Don't do this (multiple updates)
recommendation.updateContext({ resumeScore: 80 });
recommendation.updateContext({ skills: ['React'] });
recommendation.updateContext({ completedCourses: ['JS'] });

// ✅ Do this (single update)
recommendation.updateContext({
  resumeScore: 80,
  skills: ['React'],
  completedCourses: ['JS'],
});
```

### 4. Leverage SIDDHI Personality

```typescript
// ✅ Use siddhiMessage for personality
notification.notify('success', 'Job Applied', 'Google SWE Role', {
  siddhiMessage: 'Google! They\'re going to love you. I believe in you! 🚀'
});
```

### 5. Combine Modules for Rich UX

```typescript
// Interview → Resume Analysis → Recommendations → Games
export function CareerJourney() {
  const interview = useInterviewCoach();
  const resume = useResumeCoach();
  const recommendation = useRecommendation();
  const game = useGameCompanion();

  // Interview performance → Resume improvement suggestions
  // Resume score → Job/internship recommendations
  // Applied jobs → Interview prep practice games
  // Game performance → Achievement unlocks
}
```

## 📊 Data Persistence

All modules auto-persist to localStorage:

```typescript
// Module 5: Memory Engine persists
// - Chat history
// - Interview sessions
// - Quiz progress
// - Resume data

// Survives:
// - Page refresh
// - Browser close
// - Tab switch
// - Crash/reload

// Clears only on:
// - Explicit logout
// - Manual clearMemory() call
// - Browser clear cache
```

## 🔮 Future Integrations

Ready for:
- Backend sync with Supabase
- AI API integration (ChatGPT, Claude)
- Real interview platform integration
- Job board APIs
- Career coaching APIs

All stores support easy migration to async backend calls.

## 📖 Additional Resources

- [SIDDHI_QUICKSTART.md](./SIDDHI_QUICKSTART.md) - Copy-paste examples
- [SIDDHI_FILE_INDEX.md](./SIDDHI_FILE_INDEX.md) - File reference
- [README.md](./README.md) - API documentation
