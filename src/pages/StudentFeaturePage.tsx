import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { DashboardLayout } from "../student-dashboard/DashboardLayout";
import type { StudentBrief } from "../student-dashboard/types";
import { useAuth } from "../auth/AuthProvider";
import { getCareerScore, getStudentDashboardData } from "../lib/db";
import { AIInternshipRecommendations } from "../student-dashboard/AIInternshipRecommendations";
import { LearningProgress } from "../student-dashboard/LearningProgress";
import { ResumeHealth } from "../student-dashboard/ResumeHealth";
import { CareerRoadmap } from "../student-dashboard/CareerRoadmap";
import { Achievements } from "../student-dashboard/Achievements";

export type StudentFeature = "match" | "learning" | "resume" | "roadmap" | "achievements";

const TITLES: Record<StudentFeature, string> = {
  match: "Profile-based Match",
  learning: "Learning",
  resume: "Resume & ATS",
  roadmap: "Roadmap",
  achievements: "Achievements",
};

export default function StudentFeaturePage({ feature }: { feature: StudentFeature }) {
  const { user, profile, loading: authLoading, profileLoading } = useAuth();
  const [score, setScore] = useState<Awaited<ReturnType<typeof getCareerScore>>>(null);
  const [dashboardData, setDashboardData] = useState<Awaited<ReturnType<typeof getStudentDashboardData>> | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([getCareerScore(user.id), getStudentDashboardData(user.id)])
      .then(([nextScore, nextData]) => { if (mounted) { setScore(nextScore); setDashboardData(nextData); } })
      .catch(() => { if (mounted) setDataError("Some student data couldn't be loaded."); });
    return () => { mounted = false; };
  }, [user]);

  if (authLoading || profileLoading) return <div className="p-8 text-[#000080]">Loading {TITLES[feature]}…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (dataError && !dashboardData) return <div className="p-8 text-amber-800">{dataError}</div>;

  const profileFields = [profile?.full_name, profile?.degree, profile?.college, profile?.location];
  const student: StudentBrief = {
    userId: user.id,
    name: profile?.full_name?.trim() || user.email?.split("@")[0] || "Student",
    semester: profile?.degree || "Student Dashboard",
    avatarUrl: profile?.avatar_url ?? undefined,
    streakDays: 0,
    xp: score?.xp ?? 0,
    xpToNextLevel: Math.max((score?.xp ?? 0) + 1000, 1000),
    level: Math.floor((score?.xp ?? 0) / 1000) + 1,
    profileCompletion: Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100),
  };

  let content: ReactNode;
  if (feature === "match") content = <AIInternshipRecommendations />;
  else if (feature === "learning") content = <LearningProgress student={student} />;
  else if (feature === "resume") content = <ResumeHealth userId={user.id} />;
  else if (feature === "roadmap") content = <CareerRoadmap student={student} roadmaps={dashboardData?.roadmaps ?? []} templates={dashboardData?.roadmapTemplates} />;
  else content = <Achievements student={student} achievementData={dashboardData?.achievementData} signals={dashboardData ? { applications: dashboardData.applications, enrollments: dashboardData.enrollments, roadmaps: dashboardData.roadmaps } : undefined} />;

  return <DashboardLayout student={student} activeId={feature === "match" ? "pm-match" : feature}>{content}</DashboardLayout>;
}
