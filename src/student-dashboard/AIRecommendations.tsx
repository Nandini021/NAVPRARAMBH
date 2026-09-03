// AIRecommendations.tsx
// Module 3 — reads from the existing recommendation engine and feeds it the
// authenticated dashboard payload. No parallel recommendation system exists.

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  Mic,
  Briefcase,
  BookOpen,
  Swords,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useRecommendation } from "../hooks/useRecommendation";
import type { Recommendation, RecommendationType } from "../store/recommendationStore";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";
import type { StudentBrief } from "./types";
import type { getStudentDashboardData } from "../lib/db";

// Only these six types are shown on the Student Dashboard card grid (the
// floating SIDDHI widget elsewhere in the app may use other types from the
// same store -- we simply don't render those here).
const VISIBLE_TYPES: RecommendationType[] = [
  "next-course",
  "resume-improvement",
  "interview-prep",
  "job-match",
  "weak-subject",
  "daily-challenge",
];

const CATEGORY_LABEL: Partial<Record<RecommendationType, string>> = {
  "next-course": "Next Skill to Learn",
  "resume-improvement": "Resume Improvement",
  "interview-prep": "Mock Interview",
  "job-match": "Internship / Job Opportunity",
  "weak-subject": "Weak Subject",
  "daily-challenge": "Daily Challenge",
};

const CATEGORY_ICON: Partial<Record<RecommendationType, React.ReactNode>> = {
  "next-course": <GraduationCap size={16} />,
  "resume-improvement": <FileText size={16} />,
  "interview-prep": <Mic size={16} />,
  "job-match": <Briefcase size={16} />,
  "weak-subject": <BookOpen size={16} />,
  "daily-challenge": <Swords size={16} />,
};

const ACTION_LABEL: Partial<Record<RecommendationType, string>> = {
  "next-course": "Learn Skill",
  "resume-improvement": "Improve Resume",
  "interview-prep": "Start Interview",
  "job-match": "View Jobs",
  "weak-subject": "Practice Now",
  "daily-challenge": "Start Challenge",
};

const PRIORITY_STYLE: Record<Recommendation["priority"], string> = {
  high: "text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/20",
  medium: "text-[#D97706] bg-[#D97706]/10 border-[#D97706]/20",
  low: "text-[#059669] bg-[#059669]/10 border-[#059669]/20",
};

// Real navigation only -- every target below already exists in App.tsx,
// except "resume-improvement" which scrolls in-page to Module 4 (Resume
// Health), which lands on this same page in this batch of work.
function resolveAction(rec: Recommendation, navigate: ReturnType<typeof useNavigate>) {
  switch (rec.type) {
    case "resume-improvement":
      document.getElementById("resume-health")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    case "interview-prep":
      navigate("/placement-prep");
      return;
    case "job-match":
      navigate("/jobs");
      return;
    case "weak-subject":
      navigate("/placement-prep");
      return;
    case "daily-challenge":
      navigate("/games");
      return;
    case "next-course":
    default:
      navigate("/courses");
      return;
  }
}

function buildContext(
  student: StudentBrief,
  dashboardData: Awaited<ReturnType<typeof getStudentDashboardData>>,
) {
  const skills = dashboardData.skills.map((skill) => skill.name);
  const completedCourses = dashboardData.enrollments
    .filter((enrollment) => enrollment.completed || enrollment.progress > 0)
    .map((enrollment) => (enrollment as typeof enrollment & { course?: { title?: string } }).course?.title ?? enrollment.course_id);
  const applications = dashboardData.applications;
  const targetCompanies = applications
    .map((application) => application.job?.company?.name ?? application.internship?.company?.name)
    .filter((name): name is string => Boolean(name));
  const applicationSuccess = applications.filter((application) =>
    application.status === "shortlisted" || application.status === "offered",
  ).length;

  return {
    resumeScore: dashboardData.score?.ats_score ?? 0,
    skills,
    completedCourses,
    appliedJobs: applications.length,
    applicationSuccess,
    targetCompanies: [...new Set(targetCompanies)],
    dailyChallengeCompleted: false,
    streakDays: student.streakDays ?? 0,
  };
}

function RecommendationCard({
  rec,
  index,
  onAction,
  onAskWhy,
}: {
  rec: Recommendation;
  index: number;
  onAction: () => void;
  onAskWhy: () => void;
}) {
  const label = CATEGORY_LABEL[rec.type] ?? rec.type;
  const icon = CATEGORY_ICON[rec.type];
  const actionLabel = ACTION_LABEL[rec.type] ?? "View";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flex h-full flex-col justify-between rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-transform hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF9933]/10 text-[#FF9933]">
            {icon}
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLE[rec.priority]}`}>
            {rec.priority}
          </span>
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <h3 className="mt-0.5 font-['Outfit'] text-[15px] font-semibold text-[#000080]">{rec.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{rec.description}</p>

        {/* Optional progress indicator: relevance score from the engine */}
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-linear-to-r from-[#8B5CF6] to-[#FF9933]" style={{ width: `${rec.score}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={onAction}
          aria-label={`${actionLabel}: ${rec.title}`}
          className="flex items-center gap-1.5 rounded-full border border-black/5 px-3 py-1.5 text-xs font-medium text-[#000080] hover:border-[#FF9933]/40 hover:text-[#FF9933] focus-visible:outline focus-visible:outline-[#8B5CF6]"
        >
          {actionLabel}
          <ArrowUpRight size={13} />
        </button>
        <button
          onClick={onAskWhy}
          aria-label={`Ask SIDDHI why: ${rec.title}`}
          className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 focus-visible:outline focus-visible:outline-[#8B5CF6]"
        >
          <Sparkles size={12} /> Why?
        </button>
      </div>
    </motion.div>
  );
}

interface AIRecommendationsProps {
  student: StudentBrief;
  dashboardData?: Awaited<ReturnType<typeof getStudentDashboardData>>;
}

export function AIRecommendations({ student, dashboardData }: AIRecommendationsProps) {
  const navigate = useNavigate();
  const { recommendations, updateContext, generate } = useRecommendation();

  useEffect(() => {
    if (!dashboardData) return;
    updateContext(buildContext(student, dashboardData));
    generate();
  }, [dashboardData, student, updateContext, generate]);

  const visible = recommendations.filter((r) => VISIBLE_TYPES.includes(r.type));

  const askWhy = (rec: Recommendation) => {
    emotionStore.getState().setEmotion(rec.priority === "high" ? "concerned" : "motivating", rec.title);
    memoryStore.addMessage(
      "ai",
      `SIDDHI noticed that ${rec.reason.toLowerCase()}. I recommend: ${rec.description}`,
      { source: "ai-recommendations", recommendationId: rec.id }
    );
  };

  return (
    <section id="ai-recs" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Powered by SIDDHI</p>
          <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Recommended for you</h2>
          <p className="mt-1 text-sm text-slate-500">Live recommendations appear when real catalog data and supported activity are available.</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-400">
          No recommendation cards are available from the live catalog yet. Opportunity matching appears here when real catalog records and the recommendation service are available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              index={i}
              onAction={() => resolveAction(rec, navigate)}
              onAskWhy={() => askWhy(rec)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
