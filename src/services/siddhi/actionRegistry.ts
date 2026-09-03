import type { SiddhiActionId } from './types';

export const SIDDHI_ACTIONS: Record<SiddhiActionId, { label: string; path: string }> = {
  jobs: { label: 'Open Jobs', path: '/jobs' },
  internships: { label: 'Open Internships', path: '/internships' },
  courses: { label: 'Open Courses', path: '/courses' },
  careers: { label: 'Open Career Explorer', path: '/careers' },
  roadmap: { label: 'Open Roadmap', path: '/dashboard#roadmap' },
  resume: { label: 'Open Resume', path: '/dashboard#resume-health' },
  interview: { label: 'Start Mock Interview', path: '/placement-prep' },
  quizzes: { label: 'Open Quizzes', path: '/placement-prep' },
  games: { label: 'Open Games', path: '/games' },
  certifications: { label: 'View Certifications', path: '/certifications' },
};

export function getAction(id: SiddhiActionId) {
  return { id, ...SIDDHI_ACTIONS[id] };
}
