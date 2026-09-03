// CareerRoadmap.tsx
// Module 6 — visual timeline from Foundation to Placement. Connects to:
//   - Module 5 (applicationStore)   -> live stats on the "Internship
//     Applications" milestone, without duplicating the tracker UI.
//   - Module 3 (recommendationStore's domain) -> when a milestone completes,
//     SIDDHI names the skill the *next* milestone needs, via memoryStore --
//     the same mechanism Module 3 already uses, not a rebuild of it.
//   - Module 11 (roadmapStore) -> progress now lives in a shared store so
//     Achievements can read it without duplicating this UI.
//   - SIDDHI (emotionStore + memoryStore) -> the EXISTING stores, no new
//     assistant or emotion system.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Lock, Circle } from "lucide-react";
import type { StudentBrief } from "./types";
import type { StudentRoadmap } from "../lib/db";
import { createRoadmapFromTemplate, recordAnalyticsEvent, updateStudentRoadmap } from "../lib/db";
import type { RoadmapTemplate } from "../lib/supabase";
import { applicationStore, type ApplicationStats } from "../store/applicationStore";
import { roadmapStore, MILESTONES, statusFor, type MilestoneStatus } from "../store/roadmapStore";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";

const SKILL_GROUPS = {
  completed: ["HTML/CSS", "JavaScript", "Git"],
  current: ["React", "SQL"],
  upcoming: ["System Design", "Node.js"],
};

const STATUS_STYLE: Record<MilestoneStatus, { ring: string; bg: string; icon: React.ReactNode }> = {
  completed: { ring: "border-[#059669]", bg: "bg-[#059669] text-white", icon: <Check size={14} /> },
  "in-progress": { ring: "border-[#FF9933]", bg: "bg-[#FF9933] text-white", icon: <Clock size={14} /> },
  upcoming: { ring: "border-[#8B5CF6]/40", bg: "bg-white text-[#8B5CF6]", icon: <Circle size={12} /> },
  locked: { ring: "border-slate-200", bg: "bg-slate-100 text-slate-400", icon: <Lock size={12} /> },
};

function SkillChipGroup({ label, skills, color }: { label: string; skills: string[]; color: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span key={s} className="rounded-full border border-black/5 px-2.5 py-1 text-[11px]" style={{ color, background: `${color}14` }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function ApplicationsProgress({ stats }: { stats: ApplicationStats }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
        <p className="font-['Outfit'] text-sm font-semibold text-[#000080]">{stats.total}</p>
        <p className="text-[10px] text-slate-400">Applied</p>
      </div>
      <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
        <p className="font-['Outfit'] text-sm font-semibold text-[#000080]">{stats.interviews}</p>
        <p className="text-[10px] text-slate-400">Interviews</p>
      </div>
      <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
        <p className="font-['Outfit'] text-sm font-semibold text-[#000080]">{stats.offers}</p>
        <p className="text-[10px] text-slate-400">Offers</p>
      </div>
    </div>
  );
}

interface CareerRoadmapProps {
  student: StudentBrief;
  roadmaps?: StudentRoadmap[];
  templates?: RoadmapTemplate[];
}

function RealRoadmap({ student, roadmaps, templates = [] }: { student: StudentBrief; roadmaps: StudentRoadmap[]; templates?: RoadmapTemplate[] }) {
  const [items, setItems] = useState(roadmaps);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roadmap = items[0];

  const createFromTemplate = async (template: RoadmapTemplate) => {
    setSaving(true); setError(null);
    try {
      const created = await createRoadmapFromTemplate(template);
      setItems([created]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create roadmap.');
    } finally { setSaving(false); }
  };

  const toggleStep = async (index: number) => {
    if (!roadmap || !student.userId) return;
    const steps = roadmap.steps.map((step, stepIndex) => stepIndex === index ? { ...step, completed: !step.completed } : step);
    const progress = steps.length ? Math.round((steps.filter((step) => step.completed).length / steps.length) * 100) : roadmap.progress;
    setSaving(true); setError(null);
    try {
      const saved = await updateStudentRoadmap(roadmap.id, student.userId, steps, progress);
      setItems([saved, ...items.slice(1)]);
      await recordAnalyticsEvent({
        eventType: 'roadmap_progress',
        entityId: roadmap.id,
        value: progress,
        metadata: { completedStepIndex: index, completed: steps[index]?.completed ?? false },
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save roadmap progress.');
    } finally { setSaving(false); }
  };

  if (!roadmap) return <section id="roadmap" className="scroll-mt-24"><div className="mb-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Your journey</p><h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Career roadmap</h2></div><div className="rounded-2xl border border-black/5 bg-white/70 p-6"><p className="text-sm text-slate-500">Choose a roadmap template to create your private progress plan. Development templates are labelled and do not count as personal history until you select one.</p>{error && <div role="alert" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div>}<div className="mt-4 grid gap-3 sm:grid-cols-2">{templates.length === 0 ? <p className="text-sm text-slate-500">No roadmap templates are available yet.</p> : templates.map((template) => <button key={template.id} type="button" disabled={saving} onClick={() => void createFromTemplate(template)} className="rounded-xl border border-black/5 bg-slate-50 p-4 text-left hover:border-[#FF9933]/40"><p className="font-['Outfit'] text-sm font-semibold text-[#000080]">{template.title}</p><p className="mt-1 text-xs text-slate-500">{template.description}</p>{template.is_development_seed && <span className="mt-2 inline-block rounded-full bg-[#FF9933]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF9933]">Development template</span>}</button>)}</div></div></section>;

  return <section id="roadmap" className="scroll-mt-24"><div className="mb-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Your journey</p><h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">{roadmap.title}</h2><p className="mt-1 text-sm text-slate-500">{roadmap.progress}% complete · {student.semester}</p></div><div className="rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl"><div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-linear-to-r from-[#059669] to-[#FF9933]" style={{ width: `${roadmap.progress}%` }} /></div>{error && <div role="alert" className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div>}<ol className="space-y-4">{roadmap.steps.map((step, index) => <li key={index} className="flex items-start gap-3"><button type="button" disabled={saving} onClick={() => toggleStep(index)} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${step.completed ? 'border-[#059669] bg-[#059669] text-white' : 'border-[#FF9933] text-[#FF9933]'}`} aria-label={`Mark step ${index + 1} ${step.completed ? 'incomplete' : 'complete'}`}>{step.completed ? <Check size={14} /> : <Circle size={12} />}</button><div><p className={`font-['Outfit'] text-sm font-semibold ${step.completed ? 'text-slate-400 line-through' : 'text-[#000080]'}`}>{step.title ?? step.step ?? `Step ${index + 1}`}</p>{step.description && <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>}</div></li>)}</ol></div></section>;
}

function LocalCareerRoadmap({ student }: CareerRoadmapProps) {
  const [currentIndex, setCurrentIndex] = useState(roadmapStore.getState().currentIndex);
  const [appStats, setAppStats] = useState<ApplicationStats>(applicationStore.getStats());
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  useEffect(() => {
    const unsubApp = applicationStore.subscribe(() => setAppStats(applicationStore.getStats()));
    const unsubRoadmap = roadmapStore.subscribe((state) => setCurrentIndex(state.currentIndex));
    return () => {
      unsubApp();
      unsubRoadmap();
    };
  }, []);

  const progressPct = roadmapStore.getProgress().pct;

  const completeMilestone = (index: number) => {
    const result = roadmapStore.completeMilestone(index);
    if (!result) return;
    setJustCompleted(MILESTONES[index].id);

    emotionStore.getState().celebrateScore(100);
    memoryStore.addMessageOnce("ai", "Amazing! You completed this milestone. Let's move to the next step.", { source: "roadmap", milestone: result.completedTitle, eventKey: `roadmap:completed:${result.completedTitle}` });

    // Connect with Module 3's domain (skill/interview recommendations) via
    // the same SIDDHI message channel, without rebuilding recommendationStore.
    const next = result.next;
    if (next) {
      const skillNote = next.skills[0];
      if (skillNote) {
        window.setTimeout(() => {
          memoryStore.addMessageOnce("ai", `Your next milestone needs ${skillNote}. I recommend focusing on ${skillNote} practice next.`, { source: "roadmap", milestone: next.title, eventKey: `roadmap:next:${next.title}` });
        }, 600);
      } else if (next.isApplicationsMilestone) {
        window.setTimeout(() => {
          memoryStore.addMessageOnce("ai", "Practice mock interviews today -- your next milestone is internship applications.", { source: "roadmap", milestone: next.title, eventKey: `roadmap:next:${next.title}` });
        }, 600);
      }
    }

    window.setTimeout(() => setJustCompleted(null), 1200);
  };

  return (
    <section id="roadmap" className="scroll-mt-24">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Your journey</p>
        <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Career roadmap</h2>
        <p className="mt-1 text-sm text-slate-500">
          {student.semester} &middot; {currentIndex} of {MILESTONES.length} milestones complete &middot; {progressPct}% of the way to placement-ready.
        </p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-[#059669] to-[#FF9933]"
            initial={{ width: 0 }}
            whileInView={{ width: `${progressPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Skill Progress -- three groups */}
        <div className="mb-8 grid grid-cols-1 gap-4 border-b border-black/5 pb-6 sm:grid-cols-3">
          <SkillChipGroup label="Completed Skills" skills={SKILL_GROUPS.completed} color="#059669" />
          <SkillChipGroup label="Current Skills" skills={SKILL_GROUPS.current} color="#FF9933" />
          <SkillChipGroup label="Upcoming Skills" skills={SKILL_GROUPS.upcoming} color="#8B5CF6" />
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-3.75 top-2 bottom-2 w-px bg-slate-200 sm:left-4.75" />
          <ol className="space-y-7">
            {MILESTONES.map((m, i) => {
              const status = statusFor(i, currentIndex);
              const style = STATUS_STYLE[status];
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="relative flex gap-4 sm:gap-5"
                >
                  <motion.div
                    animate={justCompleted === m.id ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10 ${style.ring} ${style.bg}`}
                  >
                    {style.icon}
                  </motion.div>

                  <div className="flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {status === "in-progress" ? "In progress" : status === "locked" ? "Locked" : status === "upcoming" ? "Up next" : "Completed"}
                      </span>
                    </div>
                    <h3 className="mt-0.5 font-['Outfit'] text-[15px] font-semibold text-[#000080]">{m.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>

                    {m.isApplicationsMilestone ? (
                      <ApplicationsProgress stats={appStats} />
                    ) : (
                      m.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.skills.map((s) => (
                            <span key={s} className="rounded-full border border-black/5 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">{s}</span>
                          ))}
                        </div>
                      )
                    )}

                    {status === "in-progress" && (
                      <button
                        onClick={() => completeMilestone(i)}
                        className="mt-3 rounded-full border border-black/5 px-3 py-1.5 text-xs font-medium text-[#000080] hover:border-[#059669]/40 hover:text-[#059669]"
                      >
                        Mark as complete
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function CareerRoadmap({ student, roadmaps, templates }: CareerRoadmapProps) {
  return roadmaps ? <RealRoadmap student={student} roadmaps={roadmaps} templates={templates} /> : <LocalCareerRoadmap student={student} />;
}

