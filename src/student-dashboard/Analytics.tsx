// Analytics.tsx
// Module 8 -- charts via Recharts. User metrics and history come from the
// authenticated dashboard payload: career_scores, applications, bookmarks,
// analytics_events, and mock_interview_sessions. SIDDHI's insight continues
// to reuse the existing emotionStore/memoryStore only for presentation feedback.

import { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { StudentBrief } from "./types";
import type { getStudentDashboardData } from "../lib/db";
import { memoryStore } from "../store/memoryStore";
import { emotionStore } from "../store/emotionStore";

const COLORS = {
  navy: "#000080",
  saffron: "#FF9933",
  emerald: "#059669",
  purple: "#8B5CF6",
  sky: "#38BDF8",
  gold: "#D97706",
};

const axisTick = { fontSize: 10, fill: "#94a3b8" };
const tooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  labelStyle: { color: "#000080", fontWeight: 600, fontSize: 11 },
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-xl sm:p-5">
      <p className="font-['Outfit'] text-[13.5px] font-semibold text-[#000080]">{title}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
      <div className="mt-3 h-56">{children}</div>
    </div>
  );
}

interface AnalyticsProps {
  student: StudentBrief;
  dashboardData?: Awaited<ReturnType<typeof getStudentDashboardData>>;
}

export function Analytics({ student, dashboardData }: AnalyticsProps) {
  // Radar values come from the authenticated user's career_scores record.
  // Missing scores remain zero rather than being replaced with illustrative data.
  const radarData = useMemo(() => {
    const score = dashboardData?.score;
    return [
      { axis: "Career", value: score?.career_score ?? 0 },
      { axis: "Placement", value: score?.placement_readiness ?? 0 },
      { axis: "Resume", value: score?.resume_score ?? 0 },
      { axis: "Interview", value: score?.interview_readiness ?? 0 },
    ];
  }, [dashboardData?.score]);

  const applications = useMemo(() => dashboardData?.applications ?? [], [dashboardData?.applications]);
  const applicationFunnel = useMemo(() => {
    const counts: Record<string, number> = { applied: 0, interview: 0, offer: 0, rejected: 0, bookmarked: dashboardData?.bookmarks.length ?? 0 };
    applications.forEach((a) => {
      const status = a.status === 'pending' ? 'applied' : a.status === 'shortlisted' ? 'interview' : a.status === 'offered' ? 'offer' : a.status;
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return [
      { stage: "Bookmarked", count: counts.bookmarked, fill: COLORS.purple },
      { stage: "Applied", count: counts.applied, fill: COLORS.sky },
      { stage: "Interview", count: counts.interview, fill: COLORS.saffron },
      { stage: "Offer", count: counts.offer, fill: COLORS.emerald },
      { stage: "Rejected", count: counts.rejected, fill: "#CBD5E1" },
    ];
  }, [applications, dashboardData?.bookmarks.length]);

  const learningHours = useMemo(() => {
    const events = (dashboardData?.analyticsEvents ?? []).filter((event) => event.event_type === 'learning_session');
    if (events.length === 0) return [];
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({
      day,
      hours: Math.round((events.filter((event) => new Date(event.occurred_at).getDay() === (index + 1) % 7).reduce((sum, event) => sum + (event.value ?? 0), 0) / 60) * 10) / 10,
    }));
  }, [dashboardData?.analyticsEvents]);

  const interviewScoreSeries = useMemo(() =>
    (dashboardData?.mockInterviews ?? []).filter((session) => session.score !== null).map((session, index) => ({ session: `Session ${index + 1}`, score: session.score ?? 0 })),
  [dashboardData?.mockInterviews]);

  const progressSeries = useMemo(() => (dashboardData?.analyticsEvents ?? [])
    .filter((event) => event.event_type === 'roadmap_progress' && event.value !== null)
    .slice().reverse().map((event, index) => ({ month: `Point ${index + 1}`, value: event.value ?? 0 })), [dashboardData?.analyticsEvents]);

  const xpSeries = useMemo(() => (dashboardData?.analyticsEvents ?? [])
    .filter((event) => event.event_type === 'xp_earned' && event.value !== null)
    .slice().reverse().reduce<{ month: string; value: number }[]>((series, event, index) => {
      const previous = series[index - 1]?.value ?? 0;
      series.push({ month: `Point ${index + 1}`, value: previous + (event.value ?? 0) });
      return series;
    }, []), [dashboardData?.analyticsEvents]);

  useEffect(() => {
    // SIDDHI's read on the analytics as a whole -- reuses existing
    // emotion/memory stores, same pattern as Modules 4/6/7.
    const interviewCount = applications.filter((application) => application.status === 'shortlisted').length;
    if (interviewCount > 0) {
      emotionStore.getState().motivate("Interviews on the calendar");
      memoryStore.addMessageOnce("ai", `You have ${interviewCount} interview${interviewCount > 1 ? "s" : ""} in progress -- want to run a mock interview to sharpen your answers?`, { source: "analytics", eventKey: `analytics:interviews:${interviewCount}` });
    } else {
      const weakestAxis = [...radarData].sort((a, b) => a.value - b.value)[0];
      emotionStore.getState().motivate("Reviewing analytics");
      memoryStore.addMessageOnce("ai", `Looking at your analytics, ${weakestAxis.axis} is your biggest opportunity right now.`, { source: "analytics", eventKey: `analytics:weakest:${weakestAxis.axis}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="analytics" className="scroll-mt-24">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#38BDF8]">Your numbers</p>
        <h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">
          {student.semester} &middot; Level {student.level ?? "—"} &middot; {student.xp ?? 0} XP
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Skill Radar" subtitle="Across subjects, resume & interview readiness">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#64748b" }} />
              <Radar dataKey="value" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.25} strokeWidth={2} />
              <Tooltip {...tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Internship / Job Applications" subtitle="Live from your tracker">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={applicationFunnel} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="stage" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Overall Progress" subtitle={progressSeries.length ? "Recorded roadmap progress" : "No roadmap history recorded yet"}>
            {progressSeries.length === 0 ? <p className="flex h-full items-center justify-center text-sm text-slate-400">No recorded roadmap progress yet.</p> : <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke={COLORS.navy} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.navy }} />
              </LineChart>
            </ResponsiveContainer>}
          </ChartCard>
        </div>

        <ChartCard title="Learning Hours" subtitle={learningHours.length ? "Recorded learning activity this week" : "No learning activity recorded yet"}>
          {learningHours.length === 0 ? <p className="flex h-full items-center justify-center text-sm text-slate-400">No recorded learning sessions yet.</p> : <ResponsiveContainer width="100%" height="100%">
            <BarChart data={learningHours} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} unit="h" />
              <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="hours" fill={COLORS.sky} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>}
        </ChartCard>

        <ChartCard title="Interview Scores" subtitle={interviewScoreSeries.length ? "Recorded mock interview sessions" : "No mock interview history recorded yet"}>
          {interviewScoreSeries.length === 0 ? <p className="flex h-full items-center justify-center text-sm text-slate-400">No scored mock interview sessions yet.</p> : <ResponsiveContainer width="100%" height="100%">
            <LineChart data={interviewScoreSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="session" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke={COLORS.gold} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.gold }} />
            </LineChart>
          </ResponsiveContainer>}
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="XP Growth" subtitle={xpSeries.length ? "Total XP earned over time" : "No XP history recorded yet"}>
            {xpSeries.length === 0 ? <p className="flex h-full items-center justify-center text-sm text-slate-400">No recorded XP events yet.</p> : <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpSeries} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.saffron} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.saffron} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke={COLORS.saffron} strokeWidth={2.5} fill="url(#xpFill)" />
              </AreaChart>
            </ResponsiveContainer>}
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
