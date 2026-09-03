// QuickActions.tsx
// Module 10.
//
// Routing note (flagged per the spec's "if no route exists, don't invent
// one without telling me" instruction): App.tsx has no /resume or /roadmap
// route -- those live as in-page sections of this same dashboard
// (ResumeHealth has id="resume-health", CareerRoadmap has id="roadmap").
// So "Resume" and "Career Roadmap" smooth-scroll to those sections instead
// of navigating; every other action uses a real existing route via
// react-router's useNavigate. See the delivery report for the full list.

import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  Mic,
  Briefcase,
  Send,
  Sparkles,
} from "lucide-react";
import type { getStudentDashboardData } from "../lib/db";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";

type ActionTarget = { kind: "route"; path: string } | { kind: "scroll"; id: string };

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  target: ActionTarget;
}

const ACTIONS: QuickAction[] = [
  { id: "jobs", title: "Jobs", description: "Explore opportunities", icon: Briefcase, color: "#38BDF8", target: { kind: "route", path: "/jobs" } },
  { id: "internships", title: "Internships", description: "Find your next experience", icon: Send, color: "#059669", target: { kind: "route", path: "/internships" } },
  { id: "courses", title: "Courses", description: "Learn in-demand skills", icon: BookOpen, color: "#8B5CF6", target: { kind: "route", path: "/student/learning" } },
  { id: "resume", title: "Resume", description: "Build and improve your resume", icon: FileText, color: "#FF9933", target: { kind: "route", path: "/student/resume" } },
  { id: "mock-interview", title: "Mock Interview", description: "Practice with AI coaching", icon: Mic, color: "#8B5CF6", target: { kind: "route", path: "/placement-prep" } },
];

interface QuickActionsProps {
  dashboardData?: Awaited<ReturnType<typeof getStudentDashboardData>>;
}

export function QuickActions({ dashboardData }: QuickActionsProps) {
  const navigate = useNavigate();

  // SIDDHI recommends one action from the authenticated dashboard payload.
  // Resume health takes priority; an in-progress interview is the next signal.
  const recommendedId = useMemo(() => {
    const resumeScore = dashboardData?.score?.ats_score;
    if (resumeScore !== undefined && resumeScore < 70) return "resume";
    const hasInterview = dashboardData?.applications.some((application) => application.status === "shortlisted");
    if (hasInterview) return "mock-interview";
    return undefined;
  }, [dashboardData]);

  useEffect(() => {
    const dayKey = new Date().toISOString().slice(0, 10);
    if (recommendedId === "resume") {
      emotionStore.getState().showConcern("Resume score can improve");
      memoryStore.addMessageOnce("ai", "Your resume score can improve. Let's work on your Resume.", { source: "quick-actions", eventKey: `quick-action:resume:${dayKey}` });
    } else if (recommendedId === "mock-interview") {
      emotionStore.getState().motivate("Interview coming up");
      memoryStore.addMessageOnce("ai", "You have an interview coming up. Want to practice?", { source: "quick-actions", eventKey: `quick-action:mock-interview:${dayKey}` });
    }
  }, [recommendedId]);

  const go = (target: ActionTarget) => {
    if (target.kind === "route") {
      navigate(target.path);
    } else {
      document.getElementById(target.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="quick-actions" className="scroll-mt-24 rounded-3xl bg-white/65 p-5 sm:p-7">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Find · Learn · Prepare</p>
        <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Quick Career Services</h2>
        <p className="mt-1 text-sm text-slate-500">Simple shortcuts to the tools that move your career forward.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {ACTIONS.filter((action) => ['jobs', 'internships', 'courses', 'resume', 'mock-interview', 'roadmap'].includes(action.id)).map((action, i) => {
          const Icon = action.icon;
          const isRecommended = action.id === recommendedId;
          return (
            <motion.button
              key={action.id}
              onClick={() => go(action.target)}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className={`group relative flex flex-col items-start gap-2 rounded-xl border bg-white/70 p-3.5 text-left shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md ${
                isRecommended ? "border-[#8B5CF6]/40 ring-1 ring-[#8B5CF6]/20" : "border-black/5"
              }`}
              aria-label={`${action.title}: ${action.description}`}
            >
              {isRecommended && (
                <span className="absolute -top-2 right-2 flex items-center gap-0.5 rounded-full bg-[#8B5CF6] px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                  <Sparkles size={9} /> SIDDHI pick
                </span>
              )}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ background: `${action.color}1A`, color: action.color }}
              >
                <Icon size={16} strokeWidth={2.25} />
              </div>
              <div>
                <p className="font-['Outfit'] text-[13px] font-semibold text-slate-700">{action.title}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
