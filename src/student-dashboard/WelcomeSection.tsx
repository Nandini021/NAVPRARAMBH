// WelcomeSection.tsx
// Module 2 — greets the student, shows streak/XP/level, and gives SIDDHI a
// dynamic voice. Wired into the *existing* SIDDHI architecture:
//   - emotionStore   -> SIDDHI's current emotional state
//   - memoryStore    -> SIDDHI's spoken lines, rendered by SiddhiPanel
// No new SIDDHI system is created here.

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import type { StudentBrief } from "./types";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";


// Exactly the four states requested, driven by local device time.
function timeGreeting(date: Date = new Date()): "Good morning" | "Good afternoon" | "Good evening" | "Good night" {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}


interface WelcomeSectionProps {
  student: StudentBrief;
}

export function WelcomeSection({ student }: WelcomeSectionProps) {
  const greeting = timeGreeting();
  const firstName = student.name.split(" ")[0];
  const streakDays = student.streakDays;
  const xp = student.xp ?? 0;
  const xpToNextLevel = student.xpToNextLevel ?? Math.max(xp, 1000);
  const level = student.level ?? 1;
  const xpPct = Math.min(100, Math.max(0, (xp / xpToNextLevel) * 100));

  const siddhiMessage = `${greeting}, ${firstName}! I've prepared today's career activities based on your progress -- ${streakDays === undefined ? "let's build your first streak together" : `keep that ${streakDays}-day streak alive`}.`;

  useEffect(() => {
    // Dynamic SIDDHI greeting -- writes into the *existing* emotion + memory
    // stores so SiddhiPanel (and the floating SIDDHI widget, if mounted)
    // reflect the same state. No parallel assistant is created here.
    emotionStore.getState().setEmotion("happy", "Welcome Section greeting");
    const t = window.setTimeout(() => {
      memoryStore.addMessageOnce("ai", siddhiMessage, { source: "welcome-section", eventKey: `welcome:${student.userId ?? "anonymous"}:${new Date().toISOString().slice(0, 10)}` });
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="welcome" className="scroll-mt-24">
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-0 flex-1"
          >
            <h1 className="font-['Outfit'] text-2xl font-semibold text-[#000080] sm:text-3xl">
              {greeting}, {firstName}.
            </h1>

            <div className="mt-5 hidden flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border border-black/5 bg-[#FF9933]/10 px-3.5 py-2">
                <Flame size={16} className="text-[#FF9933]" />
                <span className="text-sm font-semibold text-[#000080]">{streakDays ?? 0}</span>
                <span className="text-[11px] text-slate-500">day streak</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-black/5 bg-[#8B5CF6]/10 px-3.5 py-2">
                <Zap size={16} className="text-[#8B5CF6]" />
                <span className="text-sm font-semibold text-[#000080]">Level {level}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-black/5 bg-slate-50 px-3.5 py-2">
                <span className="text-sm font-semibold text-[#000080]">{xp} XP</span>
              </div>
            </div>

            <div className="mt-4 hidden max-w-md">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Progress to Level {level + 1}</span>
                <span>{xp} / {xpToNextLevel} XP</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-[#FF9933] to-[#8B5CF6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#000080]">Profile {student.profileCompletion ?? 0}% complete</span>
                {(student.missingProfileFields?.length ?? 0) > 0 && <span>· Next: {student.missingProfileFields?.slice(0, 2).join(" and ")}</span>}
              </div>
            </div>
          </motion.div>

        </div>

        {/* SIDDHI's greeting -- a branded insight banner, not a chat bubble */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden"
        >
          <span className="absolute left-0 top-0 h-full w-0.75 bg-linear-to-b from-[#8B5CF6] to-[#FF9933]" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#8B5CF6] shadow-sm">
            <Zap size={15} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B5CF6]">SIDDHI</p>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{siddhiMessage}</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}