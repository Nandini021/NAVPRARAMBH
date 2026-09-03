/**
 * SIDDHI AI - QUICK START INTEGRATION GUIDE
 * 
 * Step-by-step instructions for integrating SIDDHI into your application.
 */

# SIDDHI AI - Quick Start Guide

## 1️⃣ Installation

All modules are already built. No npm packages needed beyond existing dependencies:
- ✅ React 19+
- ✅ React Router DOM
- ✅ Framer Motion
- ✅ Tailwind CSS
- ✅ TypeScript

## 2️⃣ Basic Integration

### Add SIDDHI to Your Page

```tsx
import { Avatar, ChatPanel, useEmotion, useMemory } from '@/components/siddhi';

export function HomePage() {
  const { emotion } = useEmotion();
  const { messages } = useMemory();

  const handleChat = async (message: string) => {
    // TODO: Replace with your API endpoint
    return "I'm SIDDHI, your AI mentor!";
  };

  return (
    <div className="flex gap-8 p-8">
      {/* Left: Avatar */}
      <div className="w-64 flex flex-col items-center">
        <Avatar size="large" interactive={true} />
        <p className="mt-4 text-center">Emotion: <strong>{emotion}</strong></p>
      </div>

      {/* Right: Chat */}
      <div className="flex-1">
        <ChatPanel onSendMessage={handleChat} />
      </div>
    </div>
  );
}
```

## 3️⃣ Common Use Cases

### Case 1: Quiz with Emotions

```tsx
import { useEmotion, useMemory } from '@/hooks';

export function QuizPage() {
  const { celebrateScore, showConcern } = useEmotion();
  const { addQuizResult } = useMemory();

  const handleSubmit = (score: number) => {
    if (score >= 80) {
      celebrateScore(score);
    } else {
      showConcern('Let\'s review this topic together!');
    }
    
    addQuizResult(
      'quiz_' + Date.now(),
      'Topic Name',
      score,
      100,
      userAnswers
    );
  };

  return <button onClick={() => handleSubmit(85)}>Submit Quiz</button>;
}
```

### Case 2: Interview Simulator

```tsx
import { useActivity, useMemory, useEmotion } from '@/hooks';

export function InterviewPage() {
  const { setActivity } = useActivity();
  const { startInterview, addInterviewQuestion, endInterview } = useMemory();
  const { startThinking } = useEmotion();

  const startInterview = () => {
    setActivity('interview', 'interview', { jobTitle: 'SDE' });
    const session = startInterview('Senior Software Engineer', 'medium');
    console.log('Interview started:', session.id);
  };

  const submitAnswer = (answer: string) => {
    startThinking();
    // Get feedback from API...
    addInterviewQuestion(
      'Design Question',
      answer,
      'Good thinking...',
      75
    );
  };

  return (
    <>
      <button onClick={startInterview}>Start Interview</button>
      <button onClick={() => submitAnswer('My answer')}>Submit</button>
    </>
  );
}
```

### Case 3: Voice Chat

```tsx
import { useSpeechRecognition, useSpeechSynthesis, useEmotion } from '@/hooks';

export function VoicePage() {
  const { startListening, transcript, isListening } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis({ pitch: 1.1 });
  const { emotion } = useEmotion();

  const respondToUser = () => {
    const response = `I heard: "${transcript}". How can I help?`;
    speak(response);
  };

  return (
    <>
      <button onClick={startListening} disabled={isListening}>
        {isListening ? '🎤 Listening...' : '🎤 Start Voice'}
      </button>
      <p>You said: {transcript}</p>
      <button onClick={respondToUser}>Speak Response</button>
    </>
  );
}
```

### Case 4: User Profile with Memory

```tsx
import { useMemory } from '@/hooks';

export function ProfilePage() {
  const {
    userName,
    messages,
    interviewHistory,
    quizProgress,
    setUserProfile,
    addActivity
  } = useMemory();

  useEffect(() => {
    // On page load
    addActivity('visited_profile', { timestamp: new Date() });
  }, []);

  useEffect(() => {
    // On login
    if (loggedInUser) {
      setUserProfile(
        loggedInUser.id,
        loggedInUser.name,
        loggedInUser.email
      );
    }
  }, [loggedInUser]);

  return (
    <div>
      <h1>Welcome, {userName || 'User'}!</h1>
      <p>Chat history: {messages.length} messages</p>
      <p>Interviews completed: {interviewHistory.length}</p>
      <p>Quizzes taken: {quizProgress.length}</p>
      <p>
        Average quiz score: {
          Math.round(
            quizProgress.reduce((sum, q) => sum + q.score, 0) 
            / quizProgress.length
          )
        }%
      </p>
    </div>
  );
}
```

## 4️⃣ Available Exports

### From `@/components/siddhi`
```ts
// Components
export { Avatar };
export { ChatPanel, ChatMessage, ChatInput, TypingIndicator };
export { VoiceVisualizer };

// Helpers
export { getExpression }; // emotion → visual state
```

### From `@/hooks`
```ts
export { useEmotion };      // Emotion management
export { useMemory };       // Chat & profile history
export { useActivity };     // Context tracking
export { useSpeechSynthesis };  // Text-to-speech
export { useSpeechRecognition }; // Speech-to-text
```

### From `@/store`
```ts
export { emotionStore };    // Direct store access
export { memoryStore };     // Direct memory access
export { activityTracker }; // Direct activity access
```

## 5️⃣ API Integration

All modules are backend-agnostic. Connect your own API:

### Chat API
```tsx
const handleMessage = async (message: string) => {
  const response = await fetch('/api/siddhi/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context: { emotion } })
  });
  
  const data = await response.json();
  return data.response;
};

<ChatPanel onSendMessage={handleMessage} />
```

### Interview Feedback API
```tsx
const submitInterviewAnswer = async (answer: string) => {
  const response = await fetch('/api/interviews/feedback', {
    method: 'POST',
    body: JSON.stringify({ answer, sessionId })
  });
  
  const { score, feedback } = await response.json();
  addInterviewQuestion(question, answer, feedback, score);
  celebrateScore(score);
};
```

## 6️⃣ Database Integration

### Move from localStorage to Supabase

```tsx
// In memoryStore.ts, replace localStorage with Supabase:

async function saveToSupabase() {
  const { data, error } = await supabase
    .from('user_memories')
    .upsert({ user_id: userId, memory: JSON.stringify(memory) });
}

async function loadFromSupabase(userId: string) {
  const { data } = await supabase
    .from('user_memories')
    .select('memory')
    .eq('user_id', userId)
    .single();
  
  if (data) memory = JSON.parse(data.memory);
}
```

## 7️⃣ Customization

### Change Avatar Colors
Edit `src/components/siddhi/Avatar.tsx`:
```tsx
// Line ~165
className={`... bg-gradient-to-br from-blue-100 to-purple-100 ...`}
// Change to your colors
```

### Change Emotion Animations
Edit `src/components/siddhi/AvatarExpressions.ts`:
```ts
happy: {
  glowIntensity: 0.9,  // 0-1
  scale: 1.05,         // Animation size
  animation: 'bounce'  // breath, pulse, bounce, jump, nod, shake, sleep
}
```

### Add New Emotions
1. Add to `Emotion` type in `emotionStore.ts`
2. Add expression mapping in `AvatarExpressions.ts`
3. Add animation in `Avatar.css`
4. Use `useEmotion().setEmotion(newEmotionName)`

## 8️⃣ Performance Tips

✅ **Do:**
- Use `useMemory()` for user data that needs to persist
- Use `useEmotion()` for visual feedback to users
- Use `useActivity()` to provide context-aware suggestions

❌ **Don't:**
- Call `emotionStore` directly in components (use hook instead)
- Store large objects in `activity.metadata` (use database)
- Disable `interactive` on Avatar in performance-critical areas

## 9️⃣ Troubleshooting

### Avatar not blinking?
- Check browser console for errors
- Ensure component is mounted and visible
- Verify Framer Motion is installed

### Chat not showing messages?
- Check `useMemory()` hook is properly connected
- Verify `onSendMessage` is async and returns string
- Check localStorage isn't full (clear and retry)

### Voice not working?
- Verify browser supports Web Speech API (Chrome, Safari, Edge)
- Check microphone permissions
- Try `useSpeechRecognition({ language: 'en-US' })`

### Emotions not changing?
- Verify calling `useEmotion()` hook correctly
- Check emotion state is being passed to Avatar
- Look for errors in browser console

## 🔟 Next Features (Roadmap)

- [ ] Video interview simulation
- [ ] 3D avatar with realistic expressions
- [ ] Custom voice voice (using AI voice synthesis)
- [ ] Real-time collaboration (multiple users)
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Gamification system

---

## 📚 Full Documentation

See [SIDDHI README](./README.md) for complete API reference.

## 💡 Questions?

All modules are self-contained and well-documented. Check:
1. Module JSDoc comments in source files
2. TypeScript type definitions (provides IDE autocomplete)
3. Unit tests (if available)
4. README.md files in each directory

Happy coding! 🚀
