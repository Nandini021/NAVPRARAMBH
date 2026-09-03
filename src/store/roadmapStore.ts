/**
 * STUDENT DASHBOARD: ROADMAP STORE
 *
 * Backs Module 6 (Career Roadmap). Extracted from CareerRoadmap.tsx's local
 * state for the same reason applicationStore.ts was extracted from
 * InternshipTracker.tsx in Module 6: Module 11 (Achievements) needs to read
 * roadmap progress ("Roadmap Starter", overall progress %) without
 * duplicating or rebuilding the roadmap UI. Same vanilla subscribe/notify
 * pattern as every other store here.
 */

export type MilestoneStatus = "completed" | "in-progress" | "upcoming" | "locked";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  isApplicationsMilestone?: boolean;
}

export interface RoadmapProgress {
  completed: number;
  total: number;
  pct: number;
}

export const MILESTONES: Milestone[] = [
  { id: "foundation", title: "Foundation", description: "Core programming fundamentals and version control.", skills: ["DSA", "Git", "C++"] },
  { id: "current-semester", title: "Current Semester", description: "Coursework and fundamentals for this semester.", skills: ["HTML/CSS", "JavaScript"] },
  { id: "skill-development", title: "Skill Development", description: "Deepening the skills your target roles ask for.", skills: ["React", "SQL"] },
  { id: "projects", title: "Projects", description: "Build 2-3 portfolio projects that demonstrate real ability.", skills: ["System Design", "Node.js"] },
  { id: "resume-prep", title: "Resume Preparation", description: "Turn your projects and experience into a strong resume.", skills: ["ATS Optimization"] },
  { id: "internship-apps", title: "Internship Applications", description: "Apply consistently and track every response.", skills: [], isApplicationsMilestone: true },
  { id: "interview-prep", title: "Interview Preparation", description: "Mock interviews until answers feel natural.", skills: ["Behavioral Qs", "System Design"] },
  { id: "placement", title: "Placement / Career Goal", description: "Convert interviews into offers.", skills: ["Negotiation"] },
];

interface RoadmapStoreState {
  currentIndex: number; // "Skill Development" is in-progress by default
}

let store: RoadmapStoreState = { currentIndex: 2 };

const listeners: Set<(state: RoadmapStoreState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(store));
}

export function statusFor(index: number, currentIndex: number): MilestoneStatus {
  if (index < currentIndex) return "completed";
  if (index === currentIndex) return "in-progress";
  if (index === currentIndex + 1) return "upcoming";
  return "locked";
}

export const roadmapStore = {
  getState: (): RoadmapStoreState => store,

  getProgress: (): RoadmapProgress => {
    const completed = store.currentIndex;
    const total = MILESTONES.length;
    return { completed, total, pct: Math.round((completed / total) * 100) };
  },

  completeMilestone: (index: number): { completedTitle: string; next?: Milestone } | undefined => {
    if (index !== store.currentIndex) return undefined;
    const completedTitle = MILESTONES[index].title;
    store = { currentIndex: Math.min(store.currentIndex + 1, MILESTONES.length) };
    notifyListeners();
    return { completedTitle, next: MILESTONES[index + 1] };
  },

  subscribe: (listener: (state: RoadmapStoreState) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
