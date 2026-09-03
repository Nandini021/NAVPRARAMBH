// SiddhiPanel.tsx
// Right AI panel that houses SIDDHI, the mascot/assistant.
// Desktop: persistent collapsible rail (open/closed via prop from DashboardLayout).
// Mobile/tablet: becomes a floating action button that opens a bottom sheet,
// so it never competes with the sidebar/bottom-nav for space.
//
// Wired to the EXISTING SIDDHI architecture as of Modules 2-5:
//   - memoryStore  -> the message feed (addMessage/getMessages/subscribe)
//   - emotionStore -> current emotional state badge
// This is the "clean interface" the Module 1 placeholder said modules 2/3
// would wire up -- no second SIDDHI implementation was created.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { memoryStore, type ChatMessage } from "../store/memoryStore";
import { emotionStore, type Emotion } from "../store/emotionStore";
import { askSiddhi } from "../services/siddhi/siddhiService";
import type { SiddhiAction } from "../services/siddhi/types";

interface SiddhiPanelProps {
  open: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const EMOTION_LABEL: Record<Emotion, string> = {
  idle: "Idle",
  happy: "Happy",
  thinking: "Thinking",
  typing: "Typing",
  listening: "Listening",
  celebrating: "Celebrating",
  focused: "Focused",
  concerned: "Concerned",
  motivating: "Encouraging",
  sleep: "Resting",
};

function SiddhiAvatar({ emotion }: { emotion: Emotion }) {
  return (
    <div className="relative mx-auto h-20 w-20">
      <div className="absolute inset-0 rounded-full bg-[#FF9933]/20 blur-xl" aria-hidden="true" />
      <motion.div
        animate={{ scale: emotion === "celebrating" ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.6, repeat: emotion === "celebrating" ? 2 : 0 }}
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#FF9933]/30 bg-gradient-to-br from-[#FFF7E8] via-[#EAF7F0] to-[#E8F5FF] shadow-lg"
      >
        <img src="/siddhi-character.webp" alt="SIDDHI career companion" className="h-full w-full object-contain drop-shadow-md" />
      </motion.div>
    </div>
  );
}

function PanelBody() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(memoryStore.getMessages(20));
  const [emotion, setEmotionState] = useState<Emotion>(emotionStore.getSnapshot().current);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [actions, setActions] = useState<SiddhiAction[]>([]);
  const fallbackNoticeShown = useRef(false);

  useEffect(() => {
    const unsubMemory = memoryStore.subscribe(() => setMessages(memoryStore.getMessages(20)));
    const unsubEmotion = emotionStore.subscribe((state) => setEmotionState(state.current));
    return () => {
      unsubMemory();
      unsubEmotion();
    };
  }, []);

  const aiMessages = messages.filter((m) => m.role === "ai").slice(-6);
  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setSendError(null);
    emotionStore.getState().startThinking();
    memoryStore.addMessage("user", text, { source: "siddhi-dashboard" });
    try {
      const response = await askSiddhi(text, memoryStore.getMessages(12).map((message) => ({ role: message.role === "ai" ? "assistant" : "user", text: message.content })));
      setActions(response.actions);
      memoryStore.addMessage("ai", response.text, { source: "siddhi-gemini", provider: response.provider });
      emotionStore.getState().setEmotion(response.provider === "gemini" ? "happy" : "motivating", response.provider === "gemini" ? "Gemini response received" : "Local SIDDHI help provided");
      if (response.provider !== "gemini" && !fallbackNoticeShown.current) {
        fallbackNoticeShown.current = true;
        setSendError("Gemini is temporarily unavailable right now. SIDDHI is showing local career guidance.");
      }
    } catch {
      emotionStore.getState().showConcern("SIDDHI request failed");
      setSendError("SIDDHI could not connect right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4 text-center border-b border-black/5">
        <SiddhiAvatar emotion={emotion} />
        <p className="mt-3 text-[13px] font-semibold tracking-[0.08em] text-[#000080]">✨ SIDDHI AI</p>
        <p className="text-[11px] text-slate-500">Your NAVPRARAMBH Career Companion</p>
        <p className="mt-1 text-[10px] text-slate-400">Powered by Google Gemini</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-medium text-[#8B5CF6]">
          {EMOTION_LABEL[emotion]}
        </span>
      </div>
      <div className="flex-1 px-5 py-6 space-y-3 overflow-y-auto">
        {sendError && <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">{sendError}</p>}
        {aiMessages.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[12px] leading-relaxed text-slate-500">
              SIDDHI's greeting, recommendations, and daily nudges will appear here as you use the dashboard.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {aiMessages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-50 px-4 py-3"
              >
                <p className="text-[12px] leading-relaxed text-slate-600">{m.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      {actions.length > 0 && <div className="flex flex-wrap gap-2 border-t border-black/5 px-5 pt-3">
        {actions.map((action) => <button key={action.id} type="button" onClick={() => { const paths: Record<string, string> = { jobs: "/jobs", internships: "/internships", courses: "/courses", careers: "/careers", roadmap: "/dashboard#roadmap", resume: "/dashboard#resume-health", interview: "/placement-prep", quizzes: "/placement-prep", games: "/games", certifications: "/certifications" }; const path = paths[action.id]; if (path) navigate(path); }} className="rounded-full border border-[#FF9933]/30 px-2.5 py-1 text-[10px] text-[#000080]">{action.label}</button>)}
      </div>}
      <div className="border-t border-black/5 px-4 pt-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Try asking SIDDHI</p>
        <div className="flex flex-wrap gap-2">
          {["Suggest careers for me", "Improve my resume", "What skills should I learn?", "Prepare me for an interview"].map((prompt) => <button key={prompt} type="button" onClick={() => { setInput(prompt); }} className="rounded-full border border-[#8B5CF6]/20 px-2.5 py-1 text-[10px] text-[#000080] hover:bg-[#F4F1FF]">{prompt}</button>)}
        </div>
      </div>
      <div className="border-t border-black/5 p-4">
        <div className="flex gap-2">
          <textarea aria-label="Message SIDDHI" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask SIDDHI…" rows={2} className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#FF9933]" />
          <button type="button" onClick={() => void send()} disabled={sending || !input.trim()} className="self-end rounded-xl bg-[#000080] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{sending ? "…" : "Send"}</button>
        </div>
      </div>
    </div>
  );
}

export function SiddhiPanel({ open, onClose, isMobile }: SiddhiPanelProps) {
  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex h-[min(70vh,640px)] flex-col rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"
                aria-label="Close SIDDHI panel"
              >
                <X className="w-4 h-4" />
              </button>
              <PanelBody />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      animate={{ width: open ? 220 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="hidden lg:block sticky top-0 h-screen border-l border-black/5 bg-white/70 backdrop-blur-xl overflow-hidden shrink-0"
    >
      <div className="relative h-full w-[220px]">
        <button type="button" onClick={onClose} aria-label="Minimize SIDDHI panel" className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-slate-400 shadow-sm hover:text-[#000080]">
          <X className="h-4 w-4" />
        </button>
        <PanelBody />
      </div>
    </motion.aside>
  );
}