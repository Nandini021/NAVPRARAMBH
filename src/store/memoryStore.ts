/**
 * MODULE 5: MEMORY ENGINE ⭐⭐⭐⭐⭐
 * 
 * Maintains SIDDHI's complete conversation history and context.
 * Never forgets.
 * 
 * Stores:
 * - User name and profile
 * - Complete conversation history
 * - Interview progress
 * - Resume analysis
 * - Quiz progress
 * - Career roadmap
 * - Recent activity
 * - Job applications
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: string;
  metadata?: Record<string, unknown>;
}

export interface InterviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  jobTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score?: number;
  questions: Array<{
    id: string;
    question: string;
    userAnswer: string;
    feedback: string;
    score: number;
  }>;
}

export interface QuizProgress {
  quizId: string;
  topic: string;
  score: number;
  maxScore: number;
  completedAt: Date;
  answers: Record<string, string>;
}

export interface Resume {
  id: string;
  content: string;
  score: number;
  feedback: string;
  lastUpdated: Date;
}

export interface ConversationMemory {
  // User profile
  userId?: string;
  userName?: string;
  userEmail?: string;
  
  // Conversation history
  messages: ChatMessage[];
  
  // Sessions
  currentInterviewSession?: InterviewSession;
  interviewHistory: InterviewSession[];
  
  // Learning
  quizProgress: QuizProgress[];
  
  // Career
  resume?: Resume;
  roadmap?: unknown;
  
  // Activity
  recentActivity: Array<{
    timestamp: Date;
    action: string;
    metadata?: Record<string, unknown>;
  }>;
  
  // Metadata
  createdAt: Date;
  lastUpdated: Date;
}

const defaultMemory: ConversationMemory = {
  messages: [],
  interviewHistory: [],
  quizProgress: [],
  recentActivity: [],
  createdAt: new Date(),
  lastUpdated: new Date(),
};

// In-memory store (in production, use localStorage or database)
let memory: ConversationMemory = { ...defaultMemory };
const listeners: Set<(memory: ConversationMemory) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener({ ...memory }));
}

function saveToLocalStorage() {
  try {
    const key = memory.userId ? `siddhi_memory_${memory.userId}` : 'siddhi_memory';
    localStorage.setItem(key, JSON.stringify(memory, (_key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    }));
  } catch (e) {
    console.error('Failed to save memory to localStorage', e);
  }
}

function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem('siddhi_memory');
    if (stored) {
      const parsed = JSON.parse(stored, (_key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          return new Date(value);
        }
        return value;
      });
      memory = { ...defaultMemory, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load memory from localStorage', e);
  }
}

// Load on startup
loadFromLocalStorage();

export const memoryStore = {
  // Get current memory state
  getState: (): ConversationMemory => ({ ...memory }),

  // Add message to conversation
  addMessage: (role: 'user' | 'ai', content: string, metadata?: Record<string, unknown>) => {
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      metadata,
    };
    memory.messages.push(message);
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
    return message;
  },

  // Event-driven messages are keyed so remounts and Strict Mode do not
  // append the same SIDDHI notification repeatedly.
  addMessageOnce: (role: 'user' | 'ai', content: string, metadata: Record<string, unknown> & { eventKey: string }) => {
    const existing = memory.messages.find((message) => message.metadata?.eventKey === metadata.eventKey);
    return existing ?? memoryStore.addMessage(role, content, metadata);
  },

  // Get conversation history
  getMessages: (limit?: number): ChatMessage[] => {
    if (limit) {
      return memory.messages.slice(-limit);
    }
    return memory.messages;
  },

  // Set user profile and switch to a user-scoped local conversation.
  // The server remains the source of truth; this only prevents one browser's
  // SIDDHI history from leaking across authenticated accounts.
  setUserProfile: (userId: string, userName: string, userEmail: string) => {
    if (memory.userId !== userId) {
      try {
        const stored = localStorage.getItem(`siddhi_memory_${userId}`);
        if (stored) {
          memory = JSON.parse(stored, (_key, value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : value);
        } else {
          memory = { ...defaultMemory, messages: [], userId, userName, userEmail, createdAt: new Date(), lastUpdated: new Date() };
        }
      } catch {
        memory = { ...defaultMemory, messages: [], userId, userName, userEmail, createdAt: new Date(), lastUpdated: new Date() };
      }
    }
    memory.userId = userId;
    memory.userName = userName;
    memory.userEmail = userEmail;
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
  },

  // Get user name
  getUserName: (): string | undefined => memory.userName,

  // Start interview session
  startInterview: (jobTitle: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    const session: InterviewSession = {
      id: `interview_${Date.now()}`,
      startTime: new Date(),
      jobTitle,
      difficulty,
      questions: [],
    };
    memory.currentInterviewSession = session;
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
    return session;
  },

  // Add interview question
  addInterviewQuestion: (question: string, userAnswer: string, feedback: string, score: number) => {
    if (!memory.currentInterviewSession) {
      console.warn('No active interview session');
      return;
    }
    memory.currentInterviewSession.questions.push({
      id: `q_${Date.now()}`,
      question,
      userAnswer,
      feedback,
      score,
    });
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
  },

  // End interview session
  endInterview: (score: number) => {
    if (!memory.currentInterviewSession) {
      console.warn('No active interview session');
      return;
    }
    memory.currentInterviewSession.endTime = new Date();
    memory.currentInterviewSession.score = score;
    memory.interviewHistory.push(memory.currentInterviewSession);
    memory.currentInterviewSession = undefined;
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
  },

  // Add quiz result
  addQuizResult: (quizId: string, topic: string, score: number, maxScore: number, answers: Record<string, string>) => {
    memory.quizProgress.push({
      quizId,
      topic,
      score,
      maxScore,
      completedAt: new Date(),
      answers,
    });
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
  },

  // Update resume
  updateResume: (content: string, score: number, feedback: string) => {
    memory.resume = {
      id: `resume_${Date.now()}`,
      content,
      score,
      feedback,
      lastUpdated: new Date(),
    };
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
  },

  // Add activity
  addActivity: (action: string, metadata?: Record<string, unknown>) => {
    memory.recentActivity.push({
      timestamp: new Date(),
      action,
      metadata,
    });
    // Keep only last 100 activities
    if (memory.recentActivity.length > 100) {
      memory.recentActivity = memory.recentActivity.slice(-100);
    }
    memory.lastUpdated = new Date();
    saveToLocalStorage();
    notifyListeners();
  },

  // Get activity history
  getActivity: (limit: number = 20) => {
    return memory.recentActivity.slice(-limit);
  },

  // Subscribe to changes
  subscribe: (listener: (memory: ConversationMemory) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Clear all memory (for logout)
  clearMemory: () => {
    memory = { ...defaultMemory };
    try {
      localStorage.removeItem('siddhi_memory');
    } catch (e) {
      console.error('Failed to clear memory', e);
    }
    notifyListeners();
  },
};