import { useEffect, useState } from "react";
import { DashboardLayout } from "../student-dashboard/DashboardLayout";
import type { StudentBrief } from "../student-dashboard/types";
import { useAuth } from "../auth/AuthProvider";
import { getCareerScore } from "../lib/db";
import { memoryStore } from "../store/memoryStore";
import type { CareerScore } from "../lib/supabase";

export default function StudentDashboardPage() {
  const { user, profile, profileLoading, profileError } = useAuth();
  const [score, setScore] = useState<CareerScore | null>(null);

  useEffect(() => {
    if (!user) return;
    memoryStore.setUserProfile(user.id, profile?.full_name ?? user.email?.split("@")[0] ?? "Student", user.email ?? "");
    getCareerScore(user.id).then(setScore).catch(() => setScore(null));
  }, [profile?.full_name, user]);

  if (profileLoading) return <div style={{ padding: 32 }}>Loading your dashboard…</div>;

  const xp = score?.xp ?? 0;
  const profileFields = [profile?.full_name, profile?.college, profile?.degree, profile?.graduation_year, profile?.phone, profile?.location, profile?.bio, profile?.linkedin_url, profile?.github_url];
  const profileLabels = ["Name", "College", "Degree", "Graduation year", "Phone", "Location", "Bio", "LinkedIn", "GitHub"];
  const missingProfileFields = profileLabels.filter((_, index) => !profileFields[index]);
  const profileCompletion = Math.round(((profileFields.length - missingProfileFields.length) / profileFields.length) * 100);
  const student: StudentBrief = {
    userId: user?.id,
    name: profile?.full_name?.trim() || user?.email?.split("@")[0] || "Student",
    semester: profile?.degree || "Student Dashboard",
    avatarUrl: profile?.avatar_url ?? undefined,
    // No streak column is present in the inspected schema; show a truthful zero state.
    streakDays: 0,
    xp,
    xpToNextLevel: Math.max(xp + 1000, 1000),
    level: Math.floor(xp / 1000) + 1,
    profileCompletion,
    missingProfileFields,
  };

  return (
    <>
      {profileError && <div role="alert" style={{ padding: "8px 16px", color: "#8a4b08" }}>{profileError}</div>}
      <DashboardLayout student={student} />
    </>
  );
}
