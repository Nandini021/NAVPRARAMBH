/**
 * MODULE 7: RECOMMENDATION ENGINE
 * 
 * Intelligent recommendations based on:
 * - Current activity
 * - Resume score
 * - Skills
 * - Roadmap
 * - Applications
 * - Learning history
 */

export type RecommendationType = 
  | 'next-course'
  | 'next-skill'
  | 'resume-improvement'
  | 'interview-prep'
  | 'job-match'
  | 'internship-match'
  | 'career-path'
  | 'skill-gap'
  | 'certification'
  | 'project-idea'
  | 'weak-subject'
  | 'daily-challenge';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  score: number; // 0-100, relevance score
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface RecommendationContext {
  currentPage?: string;
  resumeScore?: number;
  skills: string[];
  completedCourses: string[];
  appliedJobs: number;
  applicationSuccess: number;
  targetRole?: string;
  targetCompanies: string[];
  // Added for Student Dashboard Module 3 (Weak Subject + Daily Challenge).
  // Optional so every existing caller of RecommendationContext still compiles.
  weakestSubject?: { name: string; score: number };
  dailyChallengeCompleted?: boolean;
  streakDays?: number;
}

interface RecommendationStore {
  recommendations: Recommendation[];
  context: RecommendationContext;
  lastUpdated: Date;
}

const defaultContext: RecommendationContext = {
  skills: [],
  completedCourses: [],
  appliedJobs: 0,
  applicationSuccess: 0,
  targetCompanies: [],
};

const store: RecommendationStore = {
  recommendations: [],
  context: defaultContext,
  lastUpdated: new Date(),
};

const listeners: Set<(store: RecommendationStore) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener({ ...store }));
}

/**
 * Recommendation scoring algorithm
 * Returns 0-100 score based on relevance
 */
function calculateRecommendationScore(
  type: RecommendationType,
  context: RecommendationContext
): number {
  let score = 50; // Base score

  switch (type) {
    case 'next-course': {
      // Higher score if recently completed something
      if (context.completedCourses.length > 0) score += 25;
      // Boost if high resume score
      if (context.resumeScore && context.resumeScore >= 75) score += 10;
      break;
    }

    case 'resume-improvement': {
      // Priority if low resume score
      if (context.resumeScore && context.resumeScore < 70) score += 35;
      else if (context.resumeScore && context.resumeScore < 80) score += 20;
      break;
    }

    case 'job-match': {
      // Higher if actively applying
      if (context.appliedJobs > 5) score += 20;
      // If success rate is low, boost to show more options
      if (context.applicationSuccess < context.appliedJobs * 0.2) score += 15;
      break;
    }

    case 'interview-prep': {
      // If applied to jobs and likely to get calls
      if (context.appliedJobs > 3) score += 20;
      // If recently applied
      if (context.appliedJobs > context.applicationSuccess) score += 10;
      break;
    }

    case 'skill-gap': {
      // Identify missing skills for target role
      if (context.targetRole) score += 25;
      break;
    }

    case 'certification': {
      // Recommend if skills are strong
      if (context.skills.length >= 5) score += 20;
      break;
    }

    case 'weak-subject': {
      // Priority scales with how far below target the subject score is
      if (context.weakestSubject && context.weakestSubject.score < 55) score += 30;
      else if (context.weakestSubject && context.weakestSubject.score < 65) score += 15;
      break;
    }

    case 'daily-challenge': {
      if (!context.dailyChallengeCompleted) score += 10;
      if (context.streakDays && context.streakDays > 0) score += 10;
      break;
    }

    default:
      break;
  }

  return Math.min(100, Math.max(0, score));
}

export const recommendationStore = {
  getState: (): RecommendationStore => ({ ...store }),

  /**
   * Update context for recommendations
   */
  updateContext: (context: Partial<RecommendationContext>) => {
    store.context = { ...store.context, ...context };
    store.lastUpdated = new Date();
    notifyListeners();
  },

  /**
   * Generate recommendations based on current context
   */
  generateRecommendations: (customRecommendations?: Recommendation[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const context = store.context;

    // Until a real catalog-backed recommendation is supplied, do not invent
    // course, job, certification, count, or score data in the dashboard.
    if (!customRecommendations) {
      store.recommendations = [];
      store.lastUpdated = new Date();
      notifyListeners();
      return store.recommendations;
    }

    // 1. Next Course Recommendation
    if (context.completedCourses.length > 0) {
      recommendations.push({
        id: `rec_course_${Date.now()}`,
        type: 'next-course',
        title: 'Continue Your Learning',
        description: 'Machine Learning Fundamentals',
        reason: `Based on your ${context.completedCourses[context.completedCourses.length - 1]} completion`,
        priority: 'high',
        score: calculateRecommendationScore('next-course', context),
        actionUrl: '/courses/machine-learning',
        timestamp: new Date(),
      });
    }

    // 2. Resume Improvement
    if (context.resumeScore && context.resumeScore < 85) {
      recommendations.push({
        id: `rec_resume_${Date.now()}`,
        type: 'resume-improvement',
        title: 'Improve Your Resume',
        description: `Your ATS score is ${context.resumeScore}. Let's improve your projects section.`,
        reason: 'Resume score is below ideal threshold',
        priority: context.resumeScore < 70 ? 'high' : 'medium',
        score: calculateRecommendationScore('resume-improvement', context),
        metadata: { suggestions: ['Add metrics', 'Improve projects', 'Better keywords'] },
        actionUrl: '/resume',
        timestamp: new Date(),
      });
    }

    // 3. Job Matches
    if (context.targetRole || context.targetCompanies.length > 0) {
      recommendations.push({
        id: `rec_jobs_${Date.now()}`,
        type: 'job-match',
        title: '3 New Job Openings',
        description: `${context.targetCompanies[0] || 'Your target companies'} are hiring.`,
        reason: 'Matching your profile and target companies',
        priority: 'high',
        score: calculateRecommendationScore('job-match', context),
        actionUrl: '/jobs',
        timestamp: new Date(),
      });
    }

    // 4. Interview Prep
    if (context.appliedJobs > 2) {
      recommendations.push({
        id: `rec_interview_${Date.now()}`,
        type: 'interview-prep',
        title: 'Interview Preparation',
        description: 'Get ready for your upcoming interviews',
        reason: `You've applied to ${context.appliedJobs} positions`,
        priority: 'high',
        score: calculateRecommendationScore('interview-prep', context),
        actionUrl: '/placement-prep',
        timestamp: new Date(),
      });
    }

    // 5. Skill Gap Analysis
    if (context.targetRole) {
      recommendations.push({
        id: `rec_skills_${Date.now()}`,
        type: 'skill-gap',
        title: 'Skill Gap Analysis',
        description: `Missing 3 key skills for ${context.targetRole}`,
        reason: `Target role requires ${context.targetRole}`,
        priority: 'medium',
        score: calculateRecommendationScore('skill-gap', context),
        actionUrl: '/career-explorer',
        timestamp: new Date(),
      });
    }

    // 6. Certification Opportunity
    if (context.skills.length >= 3) {
      recommendations.push({
        id: `rec_cert_${Date.now()}`,
        type: 'certification',
        title: 'Get Certified',
        description: 'AWS Solutions Architect Certification',
        reason: `Your ${context.skills[0]} skills qualify you`,
        priority: 'low',
        score: calculateRecommendationScore('certification', context),
        actionUrl: '/certifications',
        timestamp: new Date(),
      });
    }

    // 7. Weak Subject (Student Dashboard Module 3)
    if (context.weakestSubject && context.weakestSubject.score < 65) {
      recommendations.push({
        id: `rec_weak_subject_${Date.now()}`,
        type: 'weak-subject',
        title: `Strengthen ${context.weakestSubject.name}`,
        description: `Your last score in ${context.weakestSubject.name} was ${context.weakestSubject.score}%. A focused review now will pay off before your next assessment.`,
        reason: `${context.weakestSubject.name} score is below your target`,
        priority: context.weakestSubject.score < 55 ? 'high' : 'medium',
        score: calculateRecommendationScore('weak-subject', context),
        actionUrl: '/placement-prep',
        timestamp: new Date(),
      });
    }

    // 8. Daily Challenge (Student Dashboard Module 3)
    if (!context.dailyChallengeCompleted) {
      recommendations.push({
        id: `rec_challenge_${Date.now()}`,
        type: 'daily-challenge',
        title: "Today's Challenge",
        description: context.streakDays
          ? `A 15-minute challenge keeps your ${context.streakDays}-day streak alive.`
          : 'A quick daily challenge to build momentum.',
        reason: 'Daily challenge not completed yet',
        priority: 'low',
        score: calculateRecommendationScore('daily-challenge', context),
        actionUrl: '/games',
        timestamp: new Date(),
      });
    }

    // Add custom recommendations
    if (customRecommendations) {
      recommendations.push(...customRecommendations);
    }

    // Sort by priority and score
    const priorityScore = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => {
      const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.score - a.score;
    });

    // Store and return top 8 (raised from 5 so Student Dashboard's 6 categories
    // can all surface alongside anything the floating SIDDHI widget adds)
    store.recommendations = recommendations.slice(0, 8);
    store.lastUpdated = new Date();
    notifyListeners();

    return store.recommendations;
  },

  /**
   * Get specific recommendation type
   */
  getByType: (type: RecommendationType): Recommendation | undefined => {
    return store.recommendations.find(r => r.type === type);
  },

  /**
   * Get top N recommendations
   */
  getTop: (count: number = 3): Recommendation[] => {
    return store.recommendations.slice(0, count);
  },

  /**
   * Mark recommendation as actioned
   */
  actioned: (recommendationId: string) => {
    store.recommendations = store.recommendations.filter(r => r.id !== recommendationId);
    notifyListeners();
  },

  /**
   * Subscribe to changes
   */
  subscribe: (listener: (store: RecommendationStore) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

