// Achievements.tsx
// Module 11 — unlock conditions read from existing stores or authenticated data.
// Existing stores and authenticated dashboard data drive this component. The
// legacy mockData fixture is intentionally not used in the production path.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Compass, Map, Briefcase, MessageSquare, Flame, Crown, Lock } from "lucide-react";
import type { StudentBrief } from "./types";
import type { Badge, Goal, Enrollment } from "../lib/supabase";
import type { StudentApplication, StudentRoadmap } from "../lib/db";
import { resumeCoachStore } from "../store/resumeCoachStore";
import { useRecommendation } from "../hooks/useRecommendation";
import { roadmapStore } from "../store/roadmapStore";
import { applicationStore } from "../store/applicationStore";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";

type AchievementStatus = "locked" | "in-progress" | "unlocked";

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: AchievementStatus;
  progressPct: number; // 0-100, meaningful even when locked/unlocked
}

const STATUS_STYLE: Record<AchievementStatus, { badge: string; icon: string; ring: string }> = {
  unlocked: { badge: "bg-[#059669]/10 text-[#059669]", icon: "bg-[#059669]/10 text-[#059669]", ring: "border-[#059669]/30" },
  "in-progress": { badge: "bg-[#FF9933]/10 text-[#FF9933]", icon: "bg-[#FF9933]/10 text-[#FF9933]", ring: "border-[#FF9933]/30" },
  locked: { badge: "bg-slate-100 text-slate-400", icon: "bg-slate-100 text-slate-400", ring: "border-slate-200" },
};

const STATUS_LABEL: Record<AchievementStatus, string> = {
  unlocked: "Unlocked",
  "in-progress": "In Progress",
  locked: "Locked",
};

function bucket(current: number, target: number): { status: AchievementStatus; pct: number } {
  const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  if (pct >= 100) return { status: "unlocked", pct: 100 };
  if (pct > 0) return { status: "in-progress", pct };
  return { status: "locked", pct: 0 };
}

function AchievementCard({ def, index }: { def: AchievementDef; index: number }) {
  const style = STATUS_STYLE[def.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur-xl ${def.status === "locked" ? "opacity-70" : ""} ${style.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${style.icon}`}>
          {def.status === "locked" ? <Lock size={16} /> : def.icon}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.badge}`}>
          {STATUS_LABEL[def.status]}
        </span>
      </div>
      <h3 className="mt-3 font-['Outfit'] text-sm font-semibold text-[#000080]">{def.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{def.description}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          style={{ background: def.status === "unlocked" ? "#059669" : "#FF9933" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${def.progressPct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

interface AchievementSignals {
  applications: StudentApplication[];
  enrollments: Enrollment[];
  roadmaps: StudentRoadmap[];
}

interface AchievementsProps {
  student: StudentBrief;
  achievementData?: {
    badges: Badge[];
    earnedBadges: { badge_id: string; earned_at: string }[];
    goals: Goal[];
  };
  signals?: AchievementSignals;
}

function RealAchievements({ data, student, signals }: { data: NonNullable<AchievementsProps['achievementData']>; student: StudentBrief; signals?: AchievementSignals }) {
  const earned = new Set(data.earnedBadges.map((item) => item.badge_id));
  const completedGoals = data.goals.filter((goal) => goal.completed).length;
  const activitySummary = signals ? `${signals.applications.length} applications · ${signals.enrollments.filter((item) => item.progress > 0).length} courses started · ${signals.roadmaps.filter((item) => item.progress > 0).length} active roadmaps` : null;
  return <section id="achievements" className="scroll-mt-24"><div className="mb-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Celebrate progress</p><h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Achievements</h2><p className="mt-1 text-sm text-slate-500">Earned badges are controlled by the backend.</p>{activitySummary && <p className="mt-1 text-xs text-slate-400">Verified activity: {activitySummary}</p>}</div><div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center"><p className="text-lg font-semibold text-[#000080]">{data.earnedBadges.length}/{data.badges.length}</p><p className="text-[10px] uppercase text-slate-400">Badges</p></div><div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center"><p className="text-lg font-semibold text-[#000080]">{completedGoals}/{data.goals.length}</p><p className="text-[10px] uppercase text-slate-400">Goals</p></div><div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center"><p className="text-lg font-semibold text-[#000080]">{student.xp ?? 0}</p><p className="text-[10px] uppercase text-slate-400">XP</p></div><div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center"><p className="text-lg font-semibold text-[#000080]">{data.goals.length ? Math.round((completedGoals / data.goals.length) * 100) : 0}%</p><p className="text-[10px] uppercase text-slate-400">Goal progress</p></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{data.badges.length === 0 ? <div className="rounded-2xl border border-black/5 bg-white/70 p-4 text-sm text-slate-500">No badge definitions are available yet.</div> : data.badges.map((badge) => { const isEarned = earned.has(badge.id); const progress = Math.min(100, Math.round(((student.xp ?? 0) / Math.max(1, badge.xp_required)) * 100)); return <div key={badge.id} className={`rounded-2xl border bg-white/70 p-4 shadow-sm ${isEarned ? 'border-[#059669]/30' : 'border-slate-200 opacity-75'}`}><div className="flex items-start justify-between"><span className="text-2xl">{badge.emoji ?? '🏅'}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${isEarned ? 'bg-[#059669]/10 text-[#059669]' : 'bg-slate-100 text-slate-400'}`}>{isEarned ? 'Unlocked' : 'Locked'}</span></div><h3 className="mt-3 font-['Outfit'] text-sm font-semibold text-[#000080]">{badge.name}</h3><p className="mt-1 text-xs text-slate-500">{badge.description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#FF9933]" style={{ width: `${isEarned ? 100 : progress}%` }} /></div><p className="mt-1 text-[10px] text-slate-400">{badge.xp_required} XP required</p></div>; })}</div></section>;
}

function LocalAchievements({ student }: AchievementsProps) {
  const { recommendations } = useRecommendation();
  const [roadmapProgress, setRoadmapProgress] = useState(roadmapStore.getProgress());
  const [appStats, setAppStats] = useState(applicationStore.getStats());
  const [resumeAnalyses, setResumeAnalyses] = useState(resumeCoachStore.getHistory(1));

  useEffect(() => {
    const unsubRoadmap = roadmapStore.subscribe(() => setRoadmapProgress(roadmapStore.getProgress()));
    const unsubApp = applicationStore.subscribe(() => setAppStats(applicationStore.getStats()));
    const unsubResume = resumeCoachStore.subscribe(() => setResumeAnalyses(resumeCoachStore.getHistory(1)));
    return () => {
      unsubRoadmap();
      unsubApp();
      unsubResume();
    };
  }, []);

  const streakDays = student.streakDays ?? 0;
  const xp = student.xp ?? 0;
  const atsScore = resumeAnalyses[0]?.atsScore ?? 0;
  // The local fallback has no verified learning payload. Keep this achievement
  // locked rather than presenting fabricated progress.
  const hasAnyLearningProgress = false; // No verified learning signal in local fallback.

  const achievements: AchievementDef[] = useMemo(() => {
    const list: AchievementDef[] = [];

    // 1. First Step -- remains locked until verified learning data is available
    {
      const { status, pct } = bucket(hasAnyLearningProgress ? 1 : 0, 1);
      list.push({ id: "first-step", title: "First Step", description: "Complete your first learning activity.", icon: <Compass size={18} />, status, progressPct: pct });
    }
    // 2. Resume Ready -- resumeCoachStore
    {
      const { status, pct } = bucket(atsScore, 75);
      list.push({ id: "resume-ready", title: "Resume Ready", description: "Reach a 75+ ATS score on your resume.", icon: <FileText size={18} />, status, progressPct: pct });
    }
    // 3. Career Explorer -- recommendationStore (via useRecommendation)
    {
      const { status, pct } = bucket(recommendations.length > 0 ? 1 : 0, 1);
      list.push({ id: "career-explorer", title: "Career Explorer", description: "Explore your AI career recommendations.", icon: <Compass size={18} />, status, progressPct: pct });
    }
    // 4. Roadmap Starter -- roadmapStore
    {
      const { status, pct } = bucket(roadmapProgress.completed, 1);
      list.push({ id: "roadmap-starter", title: "Roadmap Starter", description: "Complete your first career roadmap milestone.", icon: <Map size={18} />, status, progressPct: pct });
    }
    // 5. Internship Hunter -- applicationStore
    {
      const { status, pct } = bucket(appStats.total, 4);
      list.push({ id: "internship-hunter", title: "Internship Hunter", description: "Apply to at least 4 internships or jobs.", icon: <Briefcase size={18} />, status, progressPct: pct });
    }
    // 6. Interview Ready -- applicationStore
    {
      const { status, pct } = bucket(appStats.interviews, 1);
      list.push({ id: "interview-ready", title: "Interview Ready", description: "Reach interview stage on an application.", icon: <MessageSquare size={18} />, status, progressPct: pct });
    }
    // 7. Learning Streak -- StudentBrief.streakDays
    {
      const { status, pct } = bucket(streakDays, 7);
      list.push({ id: "learning-streak", title: "Learning Streak", description: "Maintain a 7-day learning streak.", icon: <Flame size={18} />, status, progressPct: pct });
    }
    // 8. Career Champion -- roadmapStore (major milestone: 6 of 8 complete)
    {
      const { status, pct } = bucket(roadmapProgress.completed, 6);
      list.push({ id: "career-champion", title: "Career Champion", description: "Complete 6 of 8 roadmap milestones.", icon: <Crown size={18} />, status, progressPct: pct });
    }

    return list;
  }, [hasAnyLearningProgress, atsScore, recommendations.length, roadmapProgress.completed, appStats.total, appStats.interviews, streakDays]);

  const unlockedCount = achievements.filter((a) => a.status === "unlocked").length;

  // SIDDHI reacts once per newly-unlocked achievement (existing emotionStore
  // + memoryStore only -- no new emotion logic, no second SIDDHI).
  const [announced, setAnnounced] = useState<Set<string>>(new Set());
  useEffect(() => {
    const newlyUnlocked = achievements.filter((a) => a.status === "unlocked" && !announced.has(a.id));
    if (newlyUnlocked.length === 0) return;
    emotionStore.getState().celebrateScore(100);
    newlyUnlocked.forEach((a) => {
      memoryStore.addMessageOnce("ai", `Wonderful! You unlocked "${a.title}". Keep going -- you're building real career momentum.`, { source: "achievements", achievementId: a.id, eventKey: `achievement:${a.id}` });
    });
    setAnnounced((prev) => new Set([...prev, ...newlyUnlocked.map((a) => a.id)]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements]);

  return (
    <section id="achievements" className="scroll-mt-24">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Celebrate progress</p>
        <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Achievements</h2>
        <p className="mt-1 text-sm text-slate-500">Every milestone brings you closer to your career goal.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center shadow-sm backdrop-blur-xl">
          <p className="font-['Outfit'] text-lg font-semibold text-[#000080]">{unlockedCount}/{achievements.length}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">Unlocked</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center shadow-sm backdrop-blur-xl">
          <p className="font-['Outfit'] text-lg font-semibold text-[#000080]">{streakDays}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">Day streak</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center shadow-sm backdrop-blur-xl">
          <p className="font-['Outfit'] text-lg font-semibold text-[#000080]">{xp}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">XP</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center shadow-sm backdrop-blur-xl">
          <p className="font-['Outfit'] text-lg font-semibold text-[#000080]">{roadmapProgress.pct}%</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">Overall progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {achievements.map((a, i) => (
          <AchievementCard key={a.id} def={a} index={i} />
        ))}
      </div>
    </section>
  );
}

export function Achievements({ student, achievementData, signals }: AchievementsProps) {
  return achievementData ? <RealAchievements data={achievementData} student={student} signals={signals} /> : <LocalAchievements student={student} />;
}
