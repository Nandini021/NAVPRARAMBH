// Sidebar.tsx
// Left navigation. Desktop: full width with labels. Tablet: collapses to an
// icon rail. Mobile: hidden entirely (MainContentArea gets a bottom tab bar
// instead — see DashboardLayout's mobile nav).

import { motion } from "framer-motion";
import {
  Home,
  Briefcase,
  FileText,
  BookOpen,
  Map,
  Trophy,
  Mic,
  User,
  Settings,
  Sunrise,
  LogOut,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import type { NavItem } from "./types";

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "jobs", label: "Jobs & Internships", icon: Briefcase, href: "/jobs" },
  { id: "pm-match", label: "Profile-based Match", icon: Sparkles, href: "/student/match" },
  { id: "learning", label: "Learning", icon: BookOpen, href: "/student/learning" },
  { id: "certifications", label: "Certifications", icon: Trophy, href: "/certifications" },
  { id: "resume", label: "Resume & ATS", icon: FileText, href: "/student/resume" },
  { id: "interview", label: "Mock Interview", icon: Mic, href: "/placement-prep" },
  { id: "roadmap", label: "Roadmap", icon: Map, href: "/student/roadmap" },
  { id: "games", label: "Knowledge Games", icon: Gamepad2, href: "/games" },
  { id: "achievements", label: "Achievements", icon: Trophy, href: "/student/achievements" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

interface SidebarProps {
  collapsed: boolean;
  activeId: string;
  onNavigate: (id: string) => void;
  onSignOut: () => void;
}

export function Sidebar({ collapsed, activeId, onNavigate, onSignOut }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-black/5
      bg-white/70 backdrop-blur-xl transition-[width] duration-300 ease-out
      ${collapsed ? "w-21" : "w-62"}`}
    >
      {/* Brand mark — rising sun motif ties to "Rise Like Sun" tagline */}
      <div className="relative flex items-center gap-3 px-5 h-20 overflow-hidden">
        <div
          aria-hidden
          className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-20 blur-md"
          style={{
            background:
              "radial-gradient(circle, #FF9933 0%, #FFCF7A 55%, transparent 75%)",
          }}
        />
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-[#FF9933] to-[#8B5CF6] shadow-sm shrink-0">
          <Sunrise className="w-5 h-5 text-white" strokeWidth={2.25} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-wide text-[#000080] leading-tight truncate">
              नवप्रारंभ
            </p>
            <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase truncate">
              NavPrarambh
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5
                text-[13px] font-medium transition-colors
                ${isActive
                  ? "text-[#000080]"
                  : "text-slate-500 hover:text-[#000080] hover:bg-slate-50"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-linear-to-r from-[#FF9933]/10 via-[#8B5CF6]/10 to-transparent"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="relative w-4.5 h-4.5 shrink-0" strokeWidth={2} />
              {!collapsed && <span className="relative truncate">{item.label}</span>}
              {isActive && (
                <span className="relative ml-auto w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings pinned to bottom */}
      <div className="px-3 py-4 border-t border-black/5">
        <button
          onClick={() => onNavigate("settings")}
          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:text-[#000080] hover:bg-slate-50 transition-colors"
        >
          <Settings className="w-4.5 h-4.5 shrink-0" strokeWidth={2} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={onSignOut}
          className="mt-1 flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:text-[#000080] hover:bg-slate-50 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" strokeWidth={2} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
