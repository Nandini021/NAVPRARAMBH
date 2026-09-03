// types.ts
// Shared types for the Student Dashboard shell.
// Extend NavItem / ModuleSlot as later modules (2-11) plug into MainContentArea.

import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number; // e.g. unread count, used later by Notifications (Module 9)
}

export interface ModuleSlot {
  id: string;
  title: string;
  moduleNumber: number; // which upcoming module fills this slot
  colSpan?: "full" | "half" | "third";
}

export interface StudentBrief {
  userId?: string;
  name: string;
  semester: string;
  avatarUrl?: string;
  // Optional gamification fields, used by Module 2 (Welcome Section) and
  // Module 11 (Achievements). Optional so existing StudentBrief literals
  // (e.g. StudentDashboardPage.tsx before this change) keep compiling.
  streakDays?: number;
  xp?: number;
  xpToNextLevel?: number;
  level?: number;
  profileCompletion?: number;
  missingProfileFields?: string[];
}
