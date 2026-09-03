import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StudentBrief } from "./types";
import { getStudentDashboardData } from "../lib/db";
import { WelcomeSection } from "./WelcomeSection";
import { QuickActions } from "./QuickActions";
import { AIInternshipRecommendations } from "./AIInternshipRecommendations";

interface MainContentAreaProps {
  student: StudentBrief;
}

type DashboardData = Awaited<ReturnType<typeof getStudentDashboardData>>;

function CareerSnapshot({ student, data }: { student: StudentBrief; data?: DashboardData }) {
  const navigate = useNavigate();
  const metrics = [
    { label: "Profile", value: `${student.profileCompletion ?? 0}% complete`, action: () => navigate("/profile"), color: "#38BDF8" },
    { label: "Applications", value: data ? String(data.applications.length) : "Loading…", action: () => navigate("/jobs"), color: "#059669" },
    { label: "Learning", value: data ? String(data.enrollments.length) : "Loading…", action: () => navigate("/student/learning"), color: "#8B5CF6" },
    { label: "Resume", value: data?.resumeVersions.length ? "Ready" : "Not started", action: () => navigate("/student/resume"), color: "#FF9933" },
  ];

  return (
    <section aria-labelledby="snapshot-heading" className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">Your career snapshot</p>
          <h2 id="snapshot-heading" className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Keep your journey moving</h2>
        </div>
        <span className="text-xs text-slate-400">Saved account data</span>
      </div>
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-black/5 bg-white/85 shadow-sm sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <button key={metric.label} type="button" onClick={metric.action} className={`relative p-4 text-left transition hover:bg-slate-50 sm:p-5 ${index > 0 ? "border-t border-black/5 sm:border-l sm:border-t-0" : ""}`}>
            <span className="absolute left-0 top-0 h-1 w-full" style={{ background: metric.color }} />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{metric.label}</p>
            <p className="mt-2 font-['Outfit'] text-lg font-semibold text-[#000080]">{metric.value}</p>
            <span className="mt-2 block text-xs font-semibold text-[#000080]">View details →</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function LearningPreview({ data }: { data?: DashboardData }) {
  const navigate = useNavigate();
  const courses = data?.catalogCourses ?? [];

  return (
    <section aria-labelledby="learning-preview-heading" className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">Learn · Grow</p>
          <h2 id="learning-preview-heading" className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#000080]">Continue Learning</h2>
          <p className="mt-2 text-sm text-slate-500">Practical courses from the live NAVPRARAMBH catalog.</p>
        </div>
        <button type="button" onClick={() => navigate("/student/learning")} className="text-sm font-semibold text-[#000080] underline underline-offset-4">Continue learning →</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.slice(0, 2).map((course) => (
          <button key={course.id} type="button" onClick={() => navigate("/student/learning")} className="rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="rounded-full bg-[#8B5CF6]/10 px-2 py-1 text-[10px] font-semibold uppercase text-[#8B5CF6]">NAVPRARAMBH Demo Course</span>
            <h3 className="mt-3 font-['Outfit'] text-base font-semibold text-[#000080]">{course.title.replace(/^\[NAVPRARAMBH Demo\]\s*/, "")}</h3>
            <p className="mt-2 text-xs text-slate-500">{course.level} · {course.duration_hours ?? "—"} hours · {course.skills.slice(0, 3).join(" · ")}</p>
          </button>
        ))}
        {courses.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-sm text-slate-500">No courses are available in the live catalog yet.</div>}
      </div>
    </section>
  );
}

export function MainContentArea({ student }: MainContentAreaProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student.userId) return;
    let mounted = true;
    getStudentDashboardData(student.userId)
      .then((nextData) => { if (mounted) setData(nextData); })
      .catch(() => { if (mounted) setError("Some student data couldn't be loaded."); });
    return () => { mounted = false; };
  }, [student.userId]);

  return (
    <main className="min-w-0 flex-1 bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F0] to-[#F8FBFF] px-4 py-8 pb-24 md:px-8 md:py-12 md:pb-10">
      <div className="mx-auto w-full max-w-[1180px]">
        {error && <div role="alert" className="mb-8 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
        {!data && !error && <div role="status" className="mb-8 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-500">Loading your student data…</div>}
        <div className="space-y-16 md:space-y-20 [&>section]:border-b [&>section]:border-slate-200/80 [&>section]:pb-16 [&>section]:md:pb-20 [&>section:last-child]:border-0">
          <WelcomeSection student={student} />
          <CareerSnapshot student={student} data={data ?? undefined} />
          <QuickActions dashboardData={data ?? undefined} />
          <AIInternshipRecommendations compact />
          <LearningPreview data={data ?? undefined} />
        </div>
      </div>
    </main>
  );
}
