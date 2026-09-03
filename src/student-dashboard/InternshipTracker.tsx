// InternshipTracker.tsx
// Module 5 — application records are mapped from the authenticated dashboard
// payload. The component keeps a typed local view for filtering and display;
// it does not create production applications or catalog records. SIDDHI
// reactions route through the EXISTING emotionStore / memoryStore /
// notificationStore -- no new assistant or emotion system.
//
// Flow this sets up for later: application data -> AI Recommendation Engine
// (Module 3's recommendationStore already reads appliedJobs/applicationSuccess)
// -> SIDDHI guidance -> student. The tracker itself doesn't pretend to be AI;
// it's the data source the AI layer already consumes.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Bookmark, MapPin } from "lucide-react";
import { emotionStore } from "../store/emotionStore";
import { memoryStore } from "../store/memoryStore";
import { notificationStore } from "../store/notificationStore";

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

const STATUS_META: Record<ApplicationStatus, { label: string; text: string; bg: string }> = {
  applied: { label: "Applied", text: "#0EA5A4", bg: "#0EA5A4" },
  interview: { label: "Interview Scheduled", text: "#FF9933", bg: "#FF9933" },
  rejected: { label: "Rejected", text: "#DC2626", bg: "#DC2626" },
  offer: { label: "Offer Received", text: "#059669", bg: "#059669" },
  bookmarked: { label: "Bookmarked", text: "#8B5CF6", bg: "#8B5CF6" },
};

const FILTERS: { id: ApplicationStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
  { id: "bookmarked", label: "Bookmarked" },
];

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

// SIDDHI's reaction to a status event -- reuses the existing emotion +
// memory + notification stores exactly as they're already built.
function reactToStatus(app: Application, kind: "status" | "deadline") {
  if (kind === "deadline") {
    emotionStore.getState().showConcern(`${app.role} deadline approaching`);
    memoryStore.addMessageOnce("ai", "Your application deadline is coming up. Let's make sure you don't miss it.", { source: "tracker", appId: app.id, eventKey: `tracker:deadline:${app.id}` });
    notificationStore.notify("internship-alert", "Deadline approaching", `${app.role} at ${app.company} closes soon.`, {
      siddhiMessage: "Your application deadline is coming up. Let's make sure you don't miss it.",
      actionLabel: "View application",
    });
    return;
  }
  switch (app.status) {
    case "applied":
      emotionStore.getState().setEmotion("happy", "Application submitted");
      memoryStore.addMessageOnce("ai", "Great! Your application is submitted. I'll keep an eye on the next step.", { source: "tracker", appId: app.id, eventKey: `tracker:applied:${app.id}` });
      break;
    case "interview":
      emotionStore.getState().setEmotion("motivating", "Interview scheduled");
      memoryStore.addMessageOnce("ai", "Your interview is scheduled! Let's get you prepared.", { source: "tracker", appId: app.id, eventKey: `tracker:interview:${app.id}` });
      notificationStore.notify("interview-alert", "Interview scheduled", `${app.role} at ${app.company}.`, {
        siddhiMessage: "Your interview is scheduled! Let's get you prepared.",
        actionLabel: "Prepare now",
      });
      break;
    case "rejected":
      emotionStore.getState().showConcern("Application rejected");
      memoryStore.addMessageOnce("ai", "This one didn't work out, but don't let it stop you. Let's find the next opportunity.", { source: "tracker", appId: app.id, eventKey: `tracker:rejected:${app.id}` });
      break;
    case "offer":
      emotionStore.getState().celebrateScore(100);
      memoryStore.addMessageOnce("ai", "Congratulations! You received an offer!", { source: "tracker", appId: app.id, eventKey: `tracker:offer:${app.id}` });
      notificationStore.notify("success", "Offer received", `${app.company} extended an offer for ${app.role}.`, {
        siddhiMessage: "Congratulations! You received an offer!",
        duration: 6000,
      });
      break;
    default:
      break;
  }
}

function ApplicationCard({ app, index }: { app: Application; index: number }) {
  const meta = STATUS_META[app.status];
  const dLeft = daysUntil(app.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="flex h-full flex-col justify-between rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-[#000080]">
              {app.company.charAt(0)}
            </div>
            <div>
              <p className="font-['Outfit'] text-sm font-semibold text-[#000080]">{app.role}</p>
              <p className="text-xs text-slate-500">{app.company} &middot; {app.type}</p>
            </div>
          </div>
          {app.status === "bookmarked" && <Bookmark size={16} className="text-[#8B5CF6]" />}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={12} /> {app.remote ? "Remote" : app.location}</span>
          {app.deadline && (
            <span className={`flex items-center gap-1 ${dLeft !== null && dLeft <= 3 ? "font-medium text-[#DC2626]" : ""}`}>
              <Calendar size={12} /> {app.deadline}{dLeft !== null && dLeft >= 0 ? ` (${dLeft}d left)` : ""}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {app.skills.map((s) => (
            <span key={s} className="rounded-full border border-black/5 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">{s}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: meta.text, background: `${meta.bg}1A` }}
        >
          {meta.label}
        </span>
        {app.status === "bookmarked" && (
          <span className="text-[11px] text-slate-400">Saved item</span>
        )}
      </div>
    </motion.div>
  );
}

export function InternshipTracker({ initialApplications }: { initialApplications?: Application[] }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications ?? []);
  useEffect(() => {
    if (initialApplications) setApplications(initialApplications);
  }, [initialApplications]);

  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? applications : applications.filter((a) => a.status === filter)),
    [applications, filter]
  );

  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((a) => a.status === "interview").length;
    const offers = applications.filter((a) => a.status === "offer").length;
    const pending = applications.filter((a) => a.status === "applied").length;
    const deadlines = applications.filter((a) => {
      const d = daysUntil(a.deadline);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    return { total, interviews, offers, pending, deadlines };
  }, [applications]);

  // On mount, surface SIDDHI's single most salient reaction rather than
  // firing one message per application (offer > urgent deadline > interview).
  useEffect(() => {
    const offerApp = applications.find((a) => a.status === "offer");
    const urgentDeadline = applications.find((a) => {
      const d = daysUntil(a.deadline);
      return d !== null && d >= 0 && d <= 3;
    });
    const interviewApp = applications.find((a) => a.status === "interview");
    if (offerApp) reactToStatus(offerApp, "status");
    else if (urgentDeadline) reactToStatus(urgentDeadline, "deadline");
    else if (interviewApp) reactToStatus(interviewApp, "status");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="tracker" className="scroll-mt-24">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF9933]">Applications</p>
        <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Internship & job tracker</h2>
        <p className="mt-1 text-sm text-slate-500">Every application in one pipeline, from bookmark to offer.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total Applications", value: stats.total },
          { label: "Interviews", value: stats.interviews },
          { label: "Offers", value: stats.offers },
          { label: "Pending", value: stats.pending },
          { label: "Deadlines (7d)", value: stats.deadlines },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-black/5 bg-white/70 p-3 text-center shadow-sm backdrop-blur-xl">
            <p className="font-['Outfit'] text-lg font-semibold text-[#000080]">{s.value}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? "border-[#FF9933]/40 bg-[#FF9933]/10 text-[#FF9933]"
                : "border-black/5 text-slate-500 hover:text-[#000080]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">No applications match this filter. Applications submitted from Jobs or Internships appear here after they are saved.</p>
        ) : filtered.map((app, i) => (
          <ApplicationCard key={app.id} app={app} index={i} />
        ))}
      </div>
    </section>
  );
}