/**
 * STUDENT DASHBOARD: APPLICATION STORE
 *
 * Backs Module 5 (Internship & Job Tracker) and is read by Module 6 (Career
 * Roadmap) so the roadmap's "Internship Applications" milestone reflects
 * real tracker data instead of a duplicated copy of it. Same vanilla
 * subscribe/notify pattern as emotionStore.ts / recommendationStore.ts --
 * no new state-management library introduced.
 */

export type ApplicationStatus = "applied" | "interview" | "rejected" | "offer" | "bookmarked";

export interface Application {
  id: string;
  role: string;
  company: string;
  type: "Internship" | "Job";
  location: string;
  remote: boolean;
  appliedOn: string;
  deadline?: string;
  status: ApplicationStatus;
  skills: string[];
  priority: "high" | "medium" | "low";
}

export interface ApplicationStats {
  total: number;
  interviews: number;
  offers: number;
  pending: number;
  deadlinesThisWeek: number;
}

// Illustrative mock opportunities, not real live postings. Structure mirrors
// what /jobs and /internships would eventually feed in.
const INITIAL_APPLICATIONS: Application[] = [
  { id: "app-1", role: "SDE Intern", company: "Zynara Labs", type: "Internship", location: "Bengaluru", remote: false, appliedOn: "2026-07-14", deadline: "2026-08-16", status: "interview", skills: ["React", "SQL"], priority: "high" },
  { id: "app-2", role: "Data Analyst Intern", company: "Northfield Analytics", type: "Internship", location: "Remote", remote: true, appliedOn: "2026-07-20", deadline: "2026-08-14", status: "applied", skills: ["SQL", "Excel"], priority: "medium" },
  { id: "app-3", role: "Frontend Intern", company: "Pixel & Co", type: "Internship", location: "Hyderabad", remote: false, appliedOn: "2026-06-30", status: "offer", skills: ["React", "JavaScript"], priority: "high" },
  { id: "app-4", role: "ML Intern", company: "Vertex AI Systems", type: "Internship", location: "Remote", remote: true, appliedOn: "2026-06-18", status: "rejected", skills: ["Python"], priority: "low" },
  { id: "app-5", role: "Product Intern", company: "Loopwork", type: "Internship", location: "Pune", remote: false, appliedOn: "2026-08-01", deadline: "2026-08-13", status: "bookmarked", skills: ["Communication"], priority: "medium" },
  { id: "app-6", role: "Backend Developer", company: "Ridgeline Cloud", type: "Job", location: "Remote", remote: true, appliedOn: "2026-07-28", deadline: "2026-08-20", status: "applied", skills: ["Node.js", "SQL"], priority: "medium" },
];

interface ApplicationStoreState {
  applications: Application[];
}

let store: ApplicationStoreState = {
  applications: INITIAL_APPLICATIONS,
};

const listeners: Set<(state: ApplicationStoreState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(store));
}

export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export const applicationStore = {
  getState: (): ApplicationStoreState => store,

  getStats: (): ApplicationStats => {
    const applications = store.applications;
    return {
      total: applications.length,
      interviews: applications.filter((a) => a.status === "interview").length,
      offers: applications.filter((a) => a.status === "offer").length,
      pending: applications.filter((a) => a.status === "applied").length,
      deadlinesThisWeek: applications.filter((a) => {
        const d = daysUntil(a.deadline);
        return d !== null && d >= 0 && d <= 7;
      }).length,
    };
  },

  updateStatus: (id: string, status: ApplicationStatus): Application | undefined => {
    let changed: Application | undefined;
    store = {
      applications: store.applications.map((a) => {
        if (a.id !== id) return a;
        changed = { ...a, status, appliedOn: status === "applied" ? new Date().toISOString().slice(0, 10) : a.appliedOn };
        return changed;
      }),
    };
    notifyListeners();
    return changed;
  },

  subscribe: (listener: (state: ApplicationStoreState) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
