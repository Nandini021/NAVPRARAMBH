// mockData.ts
// Legacy development fixtures retained for reference only. These values are
// not imported by the production dashboard and must not be presented as user
// progress or catalog data. Production components use Supabase-backed data.

export interface SubjectProgress {
  id: string;
  name: string;
  score: number; // 0-100
  weeklyChange: number; // +/- percentage points vs last week
}

export const LEARNING_SUBJECTS: SubjectProgress[] = [
  { id: "coding", name: "Coding", score: 78, weeklyChange: 4 },
  { id: "aptitude", name: "Aptitude", score: 61, weeklyChange: -2 },
  { id: "english", name: "English", score: 84, weeklyChange: 1 },
  { id: "logical-reasoning", name: "Logical Reasoning", score: 69, weeklyChange: 6 },
];

export interface CourseInProgress {
  id: string;
  title: string;
  provider: string;
  progress: number; // 0-100
}

export const COURSES_IN_PROGRESS: CourseInProgress[] = [
  { id: "c1", title: "Data Structures & Algorithms", provider: "NavPrarambh Learn", progress: 72 },
  { id: "c2", title: "SQL for Interviews", provider: "NavPrarambh Learn", progress: 45 },
  { id: "c3", title: "Business Communication", provider: "NavPrarambh Learn", progress: 90 },
];

export interface EarnedCertificate {
  id: string;
  title: string;
  issuer: string;
  issuedOn: string; // ISO date
}

export const EARNED_CERTIFICATES: EarnedCertificate[] = [
  { id: "cert1", title: "Git & Version Control", issuer: "NavPrarambh", issuedOn: "2026-06-02" },
  { id: "cert2", title: "Responsive Web Design", issuer: "NavPrarambh", issuedOn: "2026-07-10" },
];

export const STUDY_TIME = {
  todayMinutes: 105, // 1h 45m
  weeklyMinutes: [40, 65, 30, 90, 55, 20, 105], // Mon..Sun, minutes/day
  monthlyChangePct: 18, // vs previous month
};

// --- Module 8 additions below ---

export interface MonthlyPoint {
  month: string;
  value: number;
}

// Last point intentionally matches StudentBrief.xp (3420, see
// StudentDashboardPage.tsx) so the chart's "today" value stays consistent
// with the rest of the dashboard rather than contradicting it.
export const XP_GROWTH: MonthlyPoint[] = [
  { month: "Mar", value: 1200 },
  { month: "Apr", value: 1780 },
  { month: "May", value: 2340 },
  { month: "Jun", value: 2860 },
  { month: "Jul", value: 3180 },
  { month: "Aug", value: 3420 },
];

export const OVERALL_PROGRESS: MonthlyPoint[] = [
  { month: "Mar", value: 48 },
  { month: "Apr", value: 55 },
  { month: "May", value: 60 },
  { month: "Jun", value: 66 },
  { month: "Jul", value: 71 },
  { month: "Aug", value: 76 },
];

// Illustrative only, until the Mock Interview module writes real sessions
// into memoryStore.interviewHistory -- Analytics prefers real history and
// falls back to this so the chart isn't empty before that module exists.
export const MOCK_INTERVIEW_SCORES: { session: string; score: number }[] = [
  { session: "Session 1", score: 52 },
  { session: "Session 2", score: 61 },
  { session: "Session 3", score: 68 },
  { session: "Session 4", score: 74 },
];
