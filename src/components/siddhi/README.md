/**
 * SIDDHI AI - Complete Module Documentation
 * 
 * A 6-module AI mentor system for career guidance and placement prep.
 * Built with React + TypeScript + Framer Motion
 */

# SIDDHI AI Modules

## 📦 Module Overview

### Module 1: Avatar System
The visual representation of SIDDHI with emotion-driven expressions.

```tsx
import { Avatar, useEmotion } from '@/components/siddhi';

export function MyComponent() {
  const { emotion } = useEmotion();
  
  return (
    <Avatar 
      size="large" 
      interactive={true}
      onFirstLoad={() => console.log('Avatar loaded!')}
    />
  );
}
```

**Features:**
- Blinks every 4-8 seconds
- Follows mouse pointer
- Smiles while idle
- Waves on first load
- 10 emotion-based expressions
- Responsive sizing (small, medium, large)

---

### Module 2: Chat Engine
The main interface for user-SIDDHI interaction.

```tsx
import { ChatPanel } from '@/components/siddhi';

export function DashboardPage() {
  const handleMessage = async (message: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return response.json();
  };

  return (
    <ChatPanel
      isOpen={true}
      onSendMessage={handleMessage}
      onClose={() => console.log('Chat closed')}
    />
  );
}
```

**Features:**
- Message history with timestamps
- Avatar in header
- Typing indicator
- Emotion tracking
- Auto-scroll to latest message
- LocalStorage persistence via Memory Engine

---

### Module 3: Voice Engine
Speech synthesis and recognition for hands-free interaction.

```tsx
import { useSpeechSynthesis, useSpeechRecognition } from '@/hooks';

export function VoiceChat() {
  const { speak, stop, isSpeaking } = useSpeechSynthesis({
    rate: 1,
    pitch: 1.1,
    language: 'en-US'
  });

  const { startListening, transcript, isListening } = useSpeechRecognition({
    language: 'en-US',
    continuous: false,
    interimResults: true
  });

  return (
    <div>
      <button onClick={startListening} disabled={isSpeaking()}>
        Start Listening
      </button>
      <p>Heard: {transcript}</p>
      <button onClick={() => speak("Hello! How can I help?")} disabled={isListening}>
        Speak Response
      </button>
    </div>
  );
}
```

**Speech Synthesis:**
- Configurable: rate (0.1-10), pitch (0-2), volume (0-1), language
- Methods: `speak()`, `stop()`, `pause()`, `resume()`
- Checks: `isSpeaking()`, `isPaused()`, `isSupported`

**Speech Recognition:**
- WebKit compatible (Chrome, Safari, Edge)
- Returns: transcript, interimTranscript, error
- Methods: `startListening()`, `stopListening()`, `abortListening()`
- Auto-triggers emotions: `listening` → `thinking` → `idle`

---

### Module 4: Emotion Engine ⭐⭐⭐⭐
Manages SIDDHI's emotional state for authentic responses.

```tsx
import { useEmotion } from '@/hooks';

export function InterviewPrep() {
  const { emotion, celebrateScore, showConcern, motivate } = useEmotion();

  const handleQuizComplete = (score: number) => {
    celebrateScore(score); // Auto-returns to idle after 3s
  };

  const handleUserError = () => {
    showConcern('You seem stuck on this question. Try thinking step by step.');
  };

  return (
    <div>
      <p>Current emotion: {emotion}</p>
      <button onClick={() => handleQuizComplete(95)}>
        Complete with 95%
      </button>
    </div>
  );
}
```

**Emotion States:**
- `idle` - Default state, smiling
- `happy` - Celebrating success
- `thinking` - Processing input
- `typing` - Generating response
- `listening` - Waiting for voice input
- `celebrating` - High score achieved
- `focused` - Deep concentration
- `concerned` - Warning/error state
- `motivating` - Giving encouragement
- `sleep` - Idle timeout

**Methods:**
- `setEmotion(emotion, trigger?)` - Direct emotion change
- `celebrateScore(score)` - Auto-select emotion based on score
- `startThinking()` - Begin processing
- `startListening()` / `stopListening()` - Voice input
- `showConcern(reason)` - Error/warning state
- `motivate(message)` - Encouragement
- `sleep()` / `wake()` - Activity states

---

### Module 5: Memory Engine ⭐⭐⭐⭐⭐
Never forgets - maintains persistent conversation and user context.

```tsx
import { useMemory } from '@/hooks';

export function ProfilePage() {
  const {
    userName,
    messages,
    interviewHistory,
    quizProgress,
    resume,
    addMessage,
    setUserProfile,
    startInterview,
    addQuizResult,
    updateResume
  } = useMemory();

  const onLogin = (userId: string, name: string, email: string) => {
    setUserProfile(userId, name, email);
  };

  const onInterviewStart = (jobTitle: string) => {
    startInterview(jobTitle, 'medium');
  };

  const onQuizComplete = (score: number) => {
    addQuizResult('quiz_001', 'DSA', score, 100, answers);
  };

  return (
    <div>
      {userName && <h1>Welcome back, {userName}!</h1>}
      <p>You've completed {interviewHistory.length} interviews</p>
      <p>Quiz average: {Math.round(quizProgress.reduce((sum, q) => sum + q.score, 0) / quizProgress.length)}%</p>
    </div>
  );
}
```

**Stored Data:**
- User profile: userId, userName, userEmail
- Messages: Full chat history with timestamps
- Interview sessions: Questions, answers, feedback, scores
- Quiz progress: Topic, score, answers
- Resume: Content, score, feedback
- Activity log: User actions with metadata

**Methods:**
- `addMessage(role, content, metadata?)` - Add to chat
- `getMessages(limit?)` - Retrieve conversation
- `setUserProfile()` - Register user
- `startInterview()` / `endInterview()` - Interview tracking
- `addInterviewQuestion()` - Question feedback
- `addQuizResult()` - Quiz completion
- `updateResume()` - Resume analysis
- `addActivity()` / `getActivity()` - User behavior tracking
- `clearMemory()` - Logout (clears localStorage)

**Persistence:**
- Auto-saves to localStorage on every change
- Auto-loads on component mount
- Never resets (even after refresh)
- Survives browser close

---

### Module 6: Activity Tracker
Provides context about what the user is currently doing.

```tsx
import { useActivity } from '@/hooks';
import { useEffect } from 'react';

export function CoursesPage() {
  const { setActivity, isIdle } = useActivity();

  useEffect(() => {
    setActivity('courses', 'course-learning', { 
      courseId: 'course_123',
      topic: 'DSA' 
    });
  }, [setActivity]);

  return (
    <div>
      <p>Your activity: {isIdle() ? 'Idle' : 'Active'}</p>
    </div>
  );
}
```

**Activity Types:**
`dashboard` | `career-explorer` | `jobs` | `internships` | `courses` | `certifications` | `placement-prep` | `games` | `interview` | `resume` | `profile` | `idle`

**Task Types:**
`browsing` | `reading` | `quiz` | `game` | `interview` | `resume-review` | `course-learning` | `job-searching` | `career-planning` | `idle`

**Methods:**
- `setActivity(type, task, metadata?)` - Update current activity
- `updateActivity(metadata)` - Update only metadata
- `getDuration()` - Seconds in current activity
- `isIdle()` - Check if idle (5+ min no change)

---

## 🔗 Integration Examples

### Complete Chat Dashboard

```tsx
import React, { useState } from 'react';
import { Avatar, ChatPanel, useEmotion, useMemory, useActivity } from '@/components/siddhi';

export function ChatDashboard() {
  const { emotion } = useEmotion();
  const { userName, messages } = useMemory();
  const { setActivity } = useActivity();

  const handleSendMessage = async (message: string) => {
    // TODO: Replace with actual API call
    return `I understand you said: "${message}"`;
  };

  return (
    <div className="flex gap-8 h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center">
        <h2>SIDDHI AI</h2>
        <Avatar size="large" interactive={true} />
        <p className="mt-4">Current: {emotion}</p>
      </div>

      {/* Chat Section */}
      <div className="flex-1">
        <ChatPanel
          isOpen={true}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Stats */}
      <div className="w-64 bg-white rounded-lg shadow-lg p-6">
        <h3>Your Profile</h3>
        {userName && <p>Hello, {userName}!</p>}
        <p>Messages: {messages.length}</p>
      </div>
    </div>
  );
}
```

### Interview Simulator

```tsx
import { useEmotion, useMemory, useActivity } from '@/hooks';

export function InterviewSimulator() {
  const { startThinking, celebrateScore } = useEmotion();
  const { startInterview, addInterviewQuestion, endInterview } = useMemory();
  const { setActivity } = useActivity();

  const startNewInterview = () => {
    setActivity('interview', 'interview', { difficulty: 'medium' });
    startInterview('Senior Software Engineer', 'medium');
  };

  const submitAnswer = async (answer: string) => {
    startThinking();
    
    // Get feedback from API
    const feedback = await fetch('/api/interview/feedback', {
      method: 'POST',
      body: JSON.stringify({ answer })
    }).then(r => r.json());

    addInterviewQuestion(
      'Design a cache system',
      answer,
      feedback.message,
      feedback.score
    );

    celebrateScore(feedback.score);
  };

  const finishInterview = (totalScore: number) => {
    endInterview(totalScore);
  };

  return (
    // Interview UI
    <div>
      <button onClick={startNewInterview}>Start Interview</button>
      <button onClick={() => finishInterview(85)}>Finish</button>
    </div>
  );
}
```

### Quiz with Progress Tracking

```tsx
import { useEmotion, useMemory } from '@/hooks';

export function QuizPage() {
  const { motivate } = useEmotion();
  const { addQuizResult } = useMemory();

  const completeQuiz = (answers: Record<string, string>) => {
    const score = calculateScore(answers);
    
    addQuizResult(
      'quiz_' + Date.now(),
      'Data Structures',
      score,
      100,
      answers
    );

    if (score < 70) {
      motivate('Good try! Review the fundamentals and try again.');
    } else if (score < 90) {
      motivate('Great effort! You\'re getting there!');
    } else {
      motivate('Outstanding! Keep this up!');
    }
  };

  return <div>Quiz Component</div>;
}
```

---

## 🎨 Styling & Customization

### Colors
Uses Tailwind CSS gradients:
- **Avatar:** Blue → Purple gradient
- **Glow:** Yellow → Orange → Pink
- **Chat User:** Blue
- **Chat AI:** Gray
- **Voice Listening:** Blue → Cyan
- **Voice Speaking:** Green → Emerald

### Animations
All animations use Framer Motion with smooth easing:
- `cubic-bezier(0.34, 1.56, 0.64, 1)` - Premium feel
- Duration: 0.3-0.6s for micro-interactions
- Staggered delays for sequential animations

### Responsive
- Mobile-first Tailwind CSS
- Avatar sizes: `small` (96px) → `medium` (160px) → `large` (256px)
- Chat: Full-width responsive
- Breakpoint: 768px (md)

---

## ⚙️ Configuration

### Speech Synthesis Options
```ts
const { speak } = useSpeechSynthesis({
  rate: 1,      // 0.1 to 10
  pitch: 1,     // 0 to 2
  volume: 1,    // 0 to 1
  language: 'en-US'  // BCP 47 language tags
});
```

### Speech Recognition Options
```ts
const { startListening } = useSpeechRecognition({
  language: 'en-US',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1
});
```

### Avatar Props
```tsx
<Avatar
  size="large"           // 'small' | 'medium' | 'large'
  interactive={true}     // Enable mouse tracking
  onFirstLoad={() => {}} // Callback when loaded
/>
```

---

## 📱 Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Avatar | ✅ | ✅ | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ | ✅ |
| Speech Synthesis | ✅ | ✅ | ❌ | ✅ |
| Speech Recognition | ✅ | ✅ | ❌ | ✅ |
| Emotion Engine | ✅ | ✅ | ✅ | ✅ |
| Memory Engine | ✅ | ✅ | ✅ | ✅ |
| Activity Tracker | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Next Steps

1. **Integrate with Backend API**
   - Connect chat to LLM (GPT-4, Claude, etc.)
   - Build interview question generator
   - Create quiz engine

2. **Database Integration**
   - Move localStorage to Supabase
   - Sync across devices
   - Real-time updates

3. **Voice Enhancement**
   - Add voice command shortcuts
   - Create custom voice for SIDDHI
   - Implement voice-only mode

4. **Advanced Features**
   - Video interview simulation
   - Resume scoring algorithm
   - Career path recommendations
   - Peer comparison

---

## 📄 License

Part of NAVPRARAMBH AI Career Platform
