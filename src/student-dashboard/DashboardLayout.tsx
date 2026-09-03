// DashboardLayout.tsx
// Student dashboard shell: sidebar, top navigation, overview, and SIDDHI assistant.

import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Briefcase,
  FileText,
  Map,
  Sparkles,
} from "lucide-react";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MainContentArea } from "./MainContentArea";
import { SiddhiPanel } from "./SiddhiPanel";
import type { StudentBrief } from "./types";

const MOBILE_TABS = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "resume", label: "Resume", icon: FileText },
  { id: "roadmap", label: "Roadmap", icon: Map },
];

interface DashboardLayoutProps {
  student: StudentBrief;
  children?: ReactNode;
  activeId?: string;
}

export function DashboardLayout({
  student,
  children,
  activeId = "dashboard",
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSignOutError(null);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      setSignOutError("We couldn't sign you out. Please try again.");
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [siddhiOpen, setSiddhiOpen] =
    useState(false);

  const [mobileSiddhiOpen, setMobileSiddhiOpen] =
    useState(false);

  const [activeNav, setActiveNav] =
    useState(activeId);

  const handleNavigate = (id: string) => {
    setActiveNav(id);
    const routeById: Record<string, string> = {
      dashboard: "/dashboard",
      jobs: "/jobs",
      "pm-match": "/student/match",
      learning: "/student/learning",
      certifications: "/certifications",
      resume: "/student/resume",
      interview: "/placement-prep",
      roadmap: "/student/roadmap",
      games: "/games",
      achievements: "/student/achievements",
      profile: "/profile",
      settings: "/settings",
    };
    const route = routeById[id];
    if (route) navigate(route);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-slate-900">
      {signOutError && (
        <div role="alert" className="fixed right-4 top-4 z-50 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          {signOutError}
        </div>
      )}
      <div className="flex min-h-screen">

        {/* Desktop / Tablet Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          activeId={activeNav}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
        />

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">

          <TopNav
            studentName={student.name}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            onOpenSiddhi={() => setSiddhiOpen(true)}
          />

          {children ?? <MainContentArea student={student} />}

        </div>

        {/* SIDDHI opens as a floating assistant instead of reserving dashboard width. */}
        {!siddhiOpen && (
          <button
            type="button"
            onClick={() => setSiddhiOpen(true)}
            className="fixed bottom-6 right-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#8B5CF6] via-[#38BDF8] to-[#FF9933] shadow-lg transition-transform hover:scale-105 lg:flex"
            aria-label="Open SIDDHI assistant"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </button>
        )}
        <SiddhiPanel open={siddhiOpen} onClose={() => setSiddhiOpen(false)} />

      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Student dashboard navigation" className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-black/5 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeNav;

          return (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              aria-label={tab.label}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-0.5"
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive
                    ? "text-[#FF9933]"
                    : "text-slate-400"
                }`}
                strokeWidth={2}
              />

              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-[#FF9933]"
                    : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile SIDDHI button */}
      <button
        onClick={() => setMobileSiddhiOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#8B5CF6] via-[#38BDF8] to-[#FF9933] shadow-lg lg:hidden"
        aria-label="Open SIDDHI"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>

      {/* Mobile SIDDHI sheet */}
      <AnimatePresence>
        {mobileSiddhiOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SiddhiPanel
              open={mobileSiddhiOpen}
              onClose={() =>
                setMobileSiddhiOpen(false)
              }
              isMobile
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
