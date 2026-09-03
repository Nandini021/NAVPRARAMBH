// ResumeHealth.tsx
// Module 4 — reads from the EXISTING resume coach engine (src/store/
// resumeCoachStore.ts + src/hooks/useResumeCoach.ts). SIDDHI's reaction uses
// emotionStore's *existing* celebrateScore/motivate/showConcern methods --
// no new emotion system, no second SIDDHI.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { getResumeAnalyses, getResumeVersions, saveInformationalResumeAnalysis } from "../lib/db";
import { useResumeCoach } from "../hooks/useResumeCoach";
import type { ResumeSuggestion } from "../store/resumeCoachStore";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";


function sectionScore(suggestions: ResumeSuggestion[], section: ResumeSuggestion["section"]): number {
  const impactSum = suggestions.filter((s) => s.section === section).reduce((sum, s) => sum + s.impact, 0);
  return Math.max(20, Math.min(100, 100 - impactSum * 6));
}

function scoreColor(score: number) {
  if (score >= 75) return "#059669"; // emerald
  if (score >= 55) return "#D97706"; // gold
  return "#DC2626";
}

function CircularProgress({ value, size = 88, stroke = 8, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute font-['Outfit'] text-base font-semibold text-[#000080]">{Math.round(value)}</span>
    </div>
  );
}

export function ResumeHealth({ userId }: { userId?: string }) {
  const { analysis, atsScore, suggestions, analyze } = useResumeCoach();
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let mounted = true;
    Promise.all([getResumeVersions(userId), getResumeAnalyses(userId)])
      .then(async ([versions, persistedAnalyses]) => {
        const version = versions.find((item) => item.is_current && item.content?.trim()) ?? versions.find((item) => item.content?.trim());
        if (!version?.content?.trim()) return;
        if (mounted) setHasResume(true);
        const localAnalysis = analyze(version.content);
        if (!persistedAnalyses.some((item) => item.resume_version_id === version.id)) {
          await saveInformationalResumeAnalysis({
            resumeVersionId: version.id,
            atsScore: localAnalysis.atsScore,
            recommendations: localAnalysis.suggestions,
          });
        }
      })
      .catch((error) => { if (mounted) setLoadError(error instanceof Error ? error.message : 'Unable to load resume data.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [userId, analyze]);

  useEffect(() => {
    if (!analysis) return;
    // SIDDHI's reaction, using the emotion store's own existing methods.
    if (atsScore >= 80) {
      emotionStore.getState().celebrateScore(atsScore);
      memoryStore.addMessageOnce("ai", "Your resume is looking strong! Let's make it even better.", { source: "resume-health", eventKey: `resume-health:${analysis.id}:strong` });
    } else if (atsScore >= 55) {
      emotionStore.getState().motivate("Resume needs a few improvements");
      memoryStore.addMessageOnce("ai", "You're getting there! I found a few areas we can improve.", { source: "resume-health", eventKey: `resume-health:${analysis.id}:polish` });
    } else {
      emotionStore.getState().showConcern("Resume ATS score is low");
      memoryStore.addMessageOnce("ai", "Don't worry. We'll improve your resume step by step.", { source: "resume-health", eventKey: `resume-health:${analysis.id}:encouragement` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis?.id]);

  if (loading || (!analysis && !loadError)) {
    return <section id="resume-health" className="scroll-mt-24"><div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-400">Loading your saved resume…</div></section>;
  }

  if (loadError || !hasResume || !analysis) {
    return <section id="resume-health" className="scroll-mt-24"><div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">{loadError ?? 'No saved resume is available yet. Add a resume version from your profile to see an ATS analysis.'}</div></section>;
  }

  const grammarScore = analysis.readabilityScore;
  const keywordScore = Math.min(100, Object.keys(analysis.keywordMatches).length * 15);
  const projectsScore = sectionScore(suggestions, "projects");
  const skillsScore = sectionScore(suggestions, "skills");
  const experienceScore = sectionScore(suggestions, "experience");

  const metrics = [
    { label: "ATS Score", value: atsScore, note: "How well parsers can read your resume." },
    { label: "Grammar", value: grammarScore, note: "Readability across sections." },
    { label: "Keywords", value: keywordScore, note: `${Object.keys(analysis.keywordMatches).length} matched technical keywords.` },
    { label: "Projects", value: projectsScore, note: "Strength of your projects section." },
    { label: "Skills", value: skillsScore, note: "Clarity of your skills section." },
    { label: "Experience", value: experienceScore, note: "Impact and specificity of experience bullets." },
  ];

  return (
    <section id="resume-health" className="scroll-mt-24">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Resume</p>
        <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Resume health</h2>
        <p className="mt-1 text-sm text-slate-500">How your resume scores against ATS filters and recruiter expectations.</p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-4 border-b border-black/5 pb-6">
          <CircularProgress value={atsScore} size={104} stroke={9} color={scoreColor(atsScore)} />
          <div>
            <p className="font-['Outfit'] text-base font-semibold text-[#000080]">
              {atsScore >= 80 ? "Strong resume" : atsScore >= 55 ? "Good, needs polish" : "Needs attention"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Based on ATS parsing, readability, keyword coverage, and section strength.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2 text-center">
              <CircularProgress value={m.value} size={68} stroke={6} color={scoreColor(m.value)} />
              <span className="text-xs text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="mb-3 flex items-center gap-2 font-['Outfit'] text-sm font-semibold text-[#000080]">
            <Lightbulb size={16} className="text-[#FF9933]" /> Improvement suggestions
          </h3>
          {suggestions.length === 0 ? (
            <p className="text-sm text-slate-400">No major issues found -- nice work.</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <div key={s.id} className="rounded-xl border border-black/5 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#000080]">{s.issue}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: scoreColor(100 - s.impact * 10), background: `${scoreColor(100 - s.impact * 10)}1A` }}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{s.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}