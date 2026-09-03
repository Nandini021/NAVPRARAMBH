/**
 * MODULE 9: INTERVIEW COACH
 * 
 * AI interviewer with multiple modes:
 * - HR (behavioral questions)
 * - Technical (system design, algorithms)
 * - Coding (live coding challenges)
 * - Behavioral (situational questions)
 */

export type InterviewMode = 'hr' | 'technical' | 'coding' | 'behavioral';
export type InterviewStatus = 'not-started' | 'in-progress' | 'paused' | 'completed';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: InterviewMode;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswerPoints: string[];
  userAnswer?: string;
  feedback?: string;
  score?: number; // 0-100
  timeToAnswer?: number; // seconds
}

export interface InterviewSession {
  id: string;
  mode: InterviewMode;
  company: string;
  position: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: InterviewStatus;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  totalScore?: number;
  startTime: Date;
  pauseTime?: Date;
  endTime?: Date;
  notes?: string;
}

interface InterviewStore {
  sessions: InterviewSession[];
  currentSession?: InterviewSession;
}

const store: InterviewStore = {
  sessions: [],
  currentSession: undefined,
};

const listeners: Set<(session: InterviewSession | undefined) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener(store.currentSession));
}

/**
 * Generate questions based on mode and difficulty
 */
function generateQuestions(mode: InterviewMode, difficulty: 'easy' | 'medium' | 'hard'): InterviewQuestion[] {
  const questionBanks = {
    hr: {
      easy: [
        { question: 'Tell me about yourself.', points: ['background', 'experience', 'career goals'] },
        { question: 'Why do you want to join this company?', points: ['company knowledge', 'role fit', 'growth opportunity'] },
      ],
      medium: [
        { question: 'Describe a challenging project you completed.', points: ['problem', 'approach', 'result', 'learning'] },
        { question: 'Tell me about a time you had conflict with a teammate.', points: ['situation', 'resolution', 'outcome', 'communication'] },
      ],
      hard: [
        { question: 'How would you handle working in a highly ambiguous environment?', points: ['clarity seeking', 'initiative', 'communication', 'example'] },
      ],
    },
    technical: {
      easy: [
        { question: 'What is the time complexity of binary search?', points: ['O(log n)', 'explanation', 'reasoning'] },
      ],
      medium: [
        { question: 'Design a cache system with LRU eviction.', points: ['architecture', 'data structures', 'trade-offs', 'edge cases'] },
      ],
      hard: [
        { question: 'Design a distributed system for real-time notifications.', points: ['scalability', 'reliability', 'latency', 'monitoring'] },
      ],
    },
    coding: {
      easy: [
        { question: 'Reverse a string.', points: ['correct output', 'time complexity', 'space complexity', 'edge cases'] },
      ],
      medium: [
        { question: 'Longest substring without repeating characters.', points: ['algorithm', 'implementation', 'testing', 'optimization'] },
      ],
      hard: [
        { question: 'Median of two sorted arrays.', points: ['binary search', 'edge cases', 'optimal solution', 'explanation'] },
      ],
    },
    behavioral: {
      easy: [
        { question: 'How do you prioritize your tasks?', points: ['method', 'example', 'flexibility'] },
      ],
      medium: [
        { question: 'Tell me about your biggest failure and what you learned.', points: ['honesty', 'learning', 'growth', 'action'] },
      ],
      hard: [
        { question: 'Describe a time you had to make a decision with limited information.', points: ['approach', 'reasoning', 'outcome', 'reflection'] },
      ],
    },
  };

  const questions = questionBanks[mode][difficulty] || [];
  return questions.map((q, idx) => ({
    id: `q_${Date.now()}_${idx}`,
    question: q.question,
    category: mode,
    difficulty,
    expectedAnswerPoints: q.points,
  }));
}

export const interviewStore = {
  /**
   * Start new interview session
   */
  startInterview: (mode: InterviewMode, company: string, position: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): InterviewSession => {
    const questions = generateQuestions(mode, difficulty);

    const session: InterviewSession = {
      id: `interview_${Date.now()}`,
      mode,
      company,
      position,
      difficulty,
      status: 'in-progress',
      questions,
      currentQuestionIndex: 0,
      startTime: new Date(),
    };

    store.currentSession = session;
    store.sessions.push(session);
    notifyListeners();

    return session;
  },

  /**
   * Get current question
   */
  getCurrentQuestion: (): InterviewQuestion | undefined => {
    if (!store.currentSession) return undefined;
    return store.currentSession.questions[store.currentSession.currentQuestionIndex];
  },

  /**
   * Submit answer to current question
   */
  submitAnswer: (answer: string, feedback?: string, score?: number): void => {
    if (!store.currentSession) return;

    const currentQ = store.currentSession.questions[store.currentSession.currentQuestionIndex];
    if (currentQ) {
      currentQ.userAnswer = answer;
      currentQ.feedback = feedback || 'Good answer. Keep practicing.';
      currentQ.score = score ?? 75;
      currentQ.timeToAnswer = Math.floor((Date.now() - store.currentSession.startTime.getTime()) / 1000);
    }

    notifyListeners();
  },

  /**
   * Move to next question
   */
  nextQuestion: (): boolean => {
    if (!store.currentSession) return false;

    if (store.currentSession.currentQuestionIndex < store.currentSession.questions.length - 1) {
      store.currentSession.currentQuestionIndex++;
      notifyListeners();
      return true;
    }

    return false;
  },

  /**
   * Pause interview
   */
  pauseInterview: (): void => {
    if (store.currentSession) {
      store.currentSession.status = 'paused';
      store.currentSession.pauseTime = new Date();
      notifyListeners();
    }
  },

  /**
   * Resume interview
   */
  resumeInterview: (): void => {
    if (store.currentSession && store.currentSession.status === 'paused') {
      store.currentSession.status = 'in-progress';
      notifyListeners();
    }
  },

  /**
   * End interview and calculate score
   */
  endInterview: (): InterviewSession | undefined => {
    if (!store.currentSession) return undefined;

    store.currentSession.status = 'completed';
    store.currentSession.endTime = new Date();

    // Calculate total score
    const scores = store.currentSession.questions
      .filter(q => q.score !== undefined)
      .map(q => q.score!);

    if (scores.length > 0) {
      store.currentSession.totalScore = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
    }

    notifyListeners();
    return store.currentSession;
  },

  /**
   * Get session history
   */
  getHistory: (limit: number = 10): InterviewSession[] => {
    return store.sessions.slice(-limit);
  },

  /**
   * Get session by ID
   */
  getSession: (id: string): InterviewSession | undefined => {
    return store.sessions.find(s => s.id === id);
  },

  /**
   * Get average score across all sessions
   */
  getAverageScore: (): number => {
    const completedSessions = store.sessions.filter(
      s => s.totalScore !== undefined
    );
    if (completedSessions.length === 0) return 0;

    const sum = completedSessions.reduce((acc, s) => acc + (s.totalScore || 0), 0);
    return Math.round(sum / completedSessions.length);
  },

  /**
   * Subscribe to changes
   */
  subscribe: (listener: (session: InterviewSession | undefined) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};