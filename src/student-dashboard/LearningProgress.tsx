import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Course, Enrollment } from "../lib/supabase";
import type { StudentBrief } from "./types";
import { getEnrollments, getUserCertifications, updateEnrollmentProgress } from "../lib/db";

interface LearningProgressProps { student?: StudentBrief; catalogCourses?: Course[]; }

export function LearningProgress({ student, catalogCourses = [] }: LearningProgressProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certifications, setCertifications] = useState<Awaited<ReturnType<typeof getUserCertifications>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!student?.userId) { setLoading(false); return; }
    let mounted = true;
    Promise.all([getEnrollments(student.userId), getUserCertifications(student.userId)])
      .then(([nextEnrollments, nextCertifications]) => { if (mounted) { setEnrollments(nextEnrollments); setCertifications(nextCertifications); } })
      .catch(() => { if (mounted) setError("Learning data couldn't be loaded."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [student?.userId]);

  const averageProgress = useMemo(() => enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length) : 0, [enrollments]);
  const enrolledIds = new Set(enrollments.map((item) => item.course_id));
  const saveProgress = async (enrollmentId: string, progress: number) => {
    setSavingId(enrollmentId); setError(null);
    try { const saved = await updateEnrollmentProgress(enrollmentId, progress); setEnrollments((current) => current.map((item) => item.id === saved.id ? { ...item, ...saved } : item)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Learning progress could not be saved."); }
    finally { setSavingId(null); }
  };

  return <section id="learning" className="scroll-mt-24 rounded-3xl bg-[#F8FBFF]/90 p-5 sm:p-7">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">Learn · Grow</p><h2 className="mt-1 font-['Outfit'] text-2xl font-semibold text-[#000080] sm:text-3xl">Continue Learning</h2><p className="mt-2 text-sm text-slate-500">Real NAVPRARAMBH course options and your saved learning progress.</p></div><a href="/courses" className="text-sm font-semibold text-[#000080] underline underline-offset-4 hover:text-[#FF9933]">View all courses <ArrowUpRight className="inline" size={14} /></a></div>
    {error && <div role="alert" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
    <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm sm:p-6">
      {loading ? <p className="text-sm text-slate-500">Loading learning data…</p> : <>
        <div className="mb-6 grid grid-cols-3 gap-3"><div className="rounded-2xl bg-[#F4F1FF] p-3 text-center"><p className="text-lg font-semibold text-[#000080]">{enrollments.length}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">Enrolled</p></div><div className="rounded-2xl bg-[#EAF7F0] p-3 text-center"><p className="text-lg font-semibold text-[#059669]">{averageProgress}%</p><p className="text-[10px] uppercase tracking-wide text-slate-400">Progress</p></div><div className="rounded-2xl bg-[#FFF7E8] p-3 text-center"><p className="text-lg font-semibold text-[#000080]">{certifications.length}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">Certificates</p></div></div>
        {enrollments.length > 0 && <div className="mb-7"><p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><BookOpen size={14} /> Your enrolled courses</p><div className="grid gap-3 sm:grid-cols-2">{enrollments.slice(0, 4).map((item) => { const title = (item as Enrollment & { course?: { title?: string } }).course?.title ?? "Course"; return <div key={item.id} className="rounded-2xl border border-black/5 bg-slate-50/70 p-4"><div className="flex justify-between gap-3 text-sm"><span className="font-semibold text-[#000080]">{title}</span><span className="text-slate-500">{item.progress}%</span></div><input aria-label={`Update progress for ${title}`} type="range" min={0} max={100} step={5} value={item.progress} disabled={savingId === item.id} onChange={(event) => void saveProgress(item.id, Number(event.target.value))} className="mt-3 w-full accent-[#38BDF8]" /><div className="mt-2 h-1.5 rounded-full bg-white"><div className="h-full rounded-full bg-[#38BDF8]" style={{ width: `${item.progress}%` }} /></div></div>; })}</div></div>}
        <div><p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><BookOpen size={14} /> NAVPRARAMBH Demo Courses</p>{catalogCourses.length === 0 ? <p className="text-sm text-slate-500">No courses are available in the live catalog yet.</p> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{catalogCourses.slice(0, 3).map((course) => <article key={course.id} className="rounded-2xl border border-[#8B5CF6]/15 bg-gradient-to-br from-white to-[#F4F1FF] p-4"><span className="rounded-full bg-[#8B5CF6]/10 px-2 py-1 text-[10px] font-semibold uppercase text-[#8B5CF6]">NAVPRARAMBH Demo Course</span><h3 className="mt-3 line-clamp-2 font-['Outfit'] text-base font-semibold text-[#000080]">{course.title.replace(/^\[NAVPRARAMBH Demo\]\s*/, "")}</h3><p className="mt-2 text-xs text-slate-500">{course.level} · {course.duration_hours ?? "—"} hours</p><div className="mt-3 flex flex-wrap gap-1.5">{course.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-full bg-white px-2 py-1 text-[10px] text-slate-600">{skill}</span>)}</div><p className="mt-3 text-xs leading-relaxed text-slate-500">{enrolledIds.has(course.id) ? "Continue your enrolled course." : "Build a practical skill for your career path."}</p></article>)}</div>}</div>
      </>}
    </div>
  </section>;
}
