/**
 * MODULE 10: RESUME COACH
 * 
 * AI Resume analysis and optimization.
 * Provides ATS scoring and improvement suggestions.
 */

export interface ResumeSuggestion {
  id: string;
  section: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  impact: number; // 0-10, how much it impacts ATS score
}

export interface ResumeAnalysis {
  id: string;
  content: string;
  atsScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: ResumeSuggestion[];
  keywordMatches: Record<string, number>; // keyword -> count
  readabilityScore: number; // 0-100
  formatting: {
    hasGaps: boolean;
    hasClearSections: boolean;
    isWellFormatted: boolean;
    hasNumbers: boolean;
  };
  timestamp: Date;
  lastUpdated: Date;
}

interface ResumeCoachStore {
  analyses: ResumeAnalysis[];
  currentAnalysis?: ResumeAnalysis;
}

const store: ResumeCoachStore = {
  analyses: [],
  currentAnalysis: undefined,
};

const listeners: Set<(analysis: ResumeAnalysis) => void> = new Set();

function notifyListeners() {
  if (store.currentAnalysis) {
    listeners.forEach(listener => listener(store.currentAnalysis!));
  }
}

/**
 * Calculate ATS score based on resume content
 */
function calculateATSScore(content: string, suggestions: ResumeSuggestion[]): number {
  let score = 50; // Base score

  // Check for key elements
  if (content.includes('email')) score += 5;
  if (content.includes('phone')) score += 5;
  if (content.includes('linkedin') || content.includes('github')) score += 5;

  // Check for sections
  const sections = ['experience', 'skills', 'education', 'projects'];
  sections.forEach(section => {
    if (content.toLowerCase().includes(section)) score += 5;
  });

  // Check for metrics (numbers)
  const numberMatches = content.match(/\d+/g);
  if (numberMatches && numberMatches.length > 3) score += 10;

  // Deduct for issues
  suggestions.forEach(s => {
    if (s.priority === 'high') score -= 5;
    else if (s.priority === 'medium') score -= 3;
    else score -= 1;
  });

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate suggestions for resume
 */
function generateSuggestions(content: string): ResumeSuggestion[] {
  const suggestions: ResumeSuggestion[] = [];

  // Check for missing contact info
  if (!content.includes('email')) {
    suggestions.push({
      id: 'sugg_email',
      section: 'summary',
      issue: 'Missing email address',
      suggestion: 'Add your email at the top of your resume',
      priority: 'high',
      impact: 8,
    });
  }

  if (!content.includes('phone')) {
    suggestions.push({
      id: 'sugg_phone',
      section: 'summary',
      issue: 'Missing phone number',
      suggestion: 'Include your phone number for easy contact',
      priority: 'high',
      impact: 7,
    });
  }

  // Check for quantified results
  const numberMatches = content.match(/\d+/g);
  if (!numberMatches || numberMatches.length < 3) {
    suggestions.push({
      id: 'sugg_numbers',
      section: 'experience',
      issue: 'Lack of quantified achievements',
      suggestion: 'Add numbers and metrics to your achievements (e.g., "Increased conversion by 25%")',
      priority: 'high',
      impact: 9,
    });
  }

  // Check for action verbs
  const actionVerbs = [
    'led', 'managed', 'developed', 'designed', 'implemented',
    'improved', 'achieved', 'created', 'launched', 'optimized'
  ];
  const contentLower = content.toLowerCase();
  const verbCount = actionVerbs.filter(v => contentLower.includes(v)).length;

  if (verbCount < 5) {
    suggestions.push({
      id: 'sugg_verbs',
      section: 'experience',
      issue: 'Weak action verbs',
      suggestion: 'Use stronger action verbs like: led, managed, achieved, optimized, implemented',
      priority: 'medium',
      impact: 6,
    });
  }

  // Check for projects section
  if (!contentLower.includes('project')) {
    suggestions.push({
      id: 'sugg_projects',
      section: 'projects',
      issue: 'Missing projects section',
      suggestion: 'Add a projects section showcasing your work (GitHub, portfolio links)',
      priority: 'medium',
      impact: 7,
    });
  }

  // Check for skills section
  if (!contentLower.includes('skill')) {
    suggestions.push({
      id: 'sugg_skills',
      section: 'skills',
      issue: 'Missing dedicated skills section',
      suggestion: 'Add a clear skills section with relevant technical and soft skills',
      priority: 'medium',
      impact: 6,
    });
  }

  // Check for length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 200) {
    suggestions.push({
      id: 'sugg_length',
      section: 'summary',
      issue: 'Resume too short',
      suggestion: 'Expand your resume to include more details (aim for 200-300 words per section)',
      priority: 'low',
      impact: 4,
    });
  }

  return suggestions;
}

export const resumeCoachStore = {
  /**
   * Analyze resume
   */
  analyzeResume: (content: string): ResumeAnalysis => {
    const suggestions = generateSuggestions(content);
    const atsScore = calculateATSScore(content, suggestions);

    // Extract keywords
    const keywordMatches: Record<string, number> = {};
    const keywords = ['python', 'javascript', 'react', 'nodejs', 'sql', 'aws', 'docker', 'kubernetes'];
    keywords.forEach(keyword => {
      const count = (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
      if (count > 0) keywordMatches[keyword] = count;
    });

    const analysis: ResumeAnalysis = {
      id: `analysis_${Date.now()}`,
      content,
      atsScore,
      strengths: [
        suggestions.length < 3 ? 'Well-structured resume' : undefined,
        Object.keys(keywordMatches).length > 3 ? 'Good technical keywords' : undefined,
      ].filter(Boolean) as string[],
      weaknesses: suggestions
        .filter(s => s.priority === 'high')
        .map(s => s.issue),
      suggestions,
      keywordMatches,
      readabilityScore: Math.max(0, 100 - suggestions.length * 5),
      formatting: {
        hasGaps: !content.match(/\d{4}\s*-\s*(?:present|\d{4})/i),
        hasClearSections: ['experience', 'skills', 'education'].filter(s =>
          content.toLowerCase().includes(s)
        ).length >= 2,
        isWellFormatted: !content.includes('\t') || content.includes('\n'),
        hasNumbers: (content.match(/\d+/g) || []).length > 2,
      },
      timestamp: new Date(),
      lastUpdated: new Date(),
    };

    store.currentAnalysis = analysis;
    store.analyses.push(analysis);

    notifyListeners();
    return analysis;
  },

  /**
   * Get specific suggestion
   */
  getSuggestion: (suggestionId: string): ResumeSuggestion | undefined => {
    if (!store.currentAnalysis) return undefined;
    return store.currentAnalysis.suggestions.find(s => s.id === suggestionId);
  },

  /**
   * Get high-priority suggestions
   */
  getHighPrioritySuggestions: (): ResumeSuggestion[] => {
    if (!store.currentAnalysis) return [];
    return store.currentAnalysis.suggestions.filter(s => s.priority === 'high');
  },

  /**
   * Get analysis history
   */
  getHistory: (limit: number = 5): ResumeAnalysis[] => {
    return store.analyses.slice(-limit);
  },

  /**
   * Get score improvement over time
   */
  getScoreTrend: (): number[] => {
    return store.analyses.map(a => a.atsScore);
  },

  /**
   * Subscribe to changes
   */
  subscribe: (listener: (analysis: ResumeAnalysis) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
