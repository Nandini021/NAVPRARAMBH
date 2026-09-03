// TopNav.tsx
// Sticky top bar. Sidebar toggle on the left, live student stats (XP/streak)
// and profile on the right.
//
// Module 9: the bell is wired to the real notificationStore (unread count +
// dropdown/bottom-sheet NotificationCenter) instead of the dead
// `notificationCount` prop that nothing used to pass. See
// NotificationCenter.tsx for why notifications live here instead of a
// MainContentArea grid slot.
//
// The mobile navigation is intentionally handled by DashboardLayout's bottom
// tab bar; the sidebar toggle remains available on desktop/tablet.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, getInternships, getJobs } from "../lib/db";
import { Menu, Search, Bell, Sparkles } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";

interface TopNavProps {
  studentName: string;
  onToggleSidebar: () => void;
  onOpenSiddhi: () => void;
}

export function TopNav({
  studentName,
  onToggleSidebar,
  onOpenSiddhi,
}: TopNavProps) {
  const navigate = useNavigate();
  const initials = studentName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([getJobs(), getInternships(), getCourses()]).then(([jobs, internships, courses]) => {
      if (!mounted) return;
      const values = [...jobs.flatMap((item) => [item.title, ...item.skills]), ...internships.flatMap((item) => [item.title, ...item.skills]), ...courses.flatMap((item) => [item.title, ...item.skills])].filter(Boolean);
      setSearchSuggestions([...new Set(values)].sort((left, right) => left.localeCompare(right)));
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const matchingSuggestions = search.trim() ? searchSuggestions.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6) : [];
  const submitSearch = (value = search) => {
    const query = value.trim();
    if (query) navigate(`/jobs?search=${encodeURIComponent(query)}`);
  };

  // The notification center is the single Supabase-backed source of truth.
  // The in-memory toast store is intentionally not used for this badge.
  const displayCount = unread;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 md:px-6 border-b border-black/5 bg-white/70 backdrop-blur-xl">
      {/* Desktop sidebar collapse toggle */}
      <button
        onClick={onToggleSidebar}
        className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-50 text-slate-500"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          aria-label="Search jobs, skills, and courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
          onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); if (event.key === 'Escape') setSearchFocused(false); }}
          placeholder="Search jobs, internships, skills, courses…"
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 border border-transparent text-[13px]
          placeholder:text-slate-400 focus:outline-none focus:border-[#8B5CF6]/40 focus:bg-white transition-colors"
        />
        {search && <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">×</button>}
        {searchFocused && search.trim() && <div role="listbox" className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">{matchingSuggestions.length ? matchingSuggestions.map((suggestion) => <button key={suggestion} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => submitSearch(suggestion)} className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-[#F4F1FF]">{suggestion}</button>) : <p className="px-3 py-3 text-xs text-slate-500">No matching live catalog results.</p>}</div>}
      </div>

      <div className="flex-1" />

      <button type="button" onClick={onOpenSiddhi} className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#000080] hover:bg-[#F4F1FF] sm:flex" aria-label="Open SIDDHI assistant"><Sparkles size={15} className="text-[#FF9933]" /> SIDDHI</button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-50 text-slate-500"
          aria-label="Notifications"
          aria-expanded={notifOpen}
        >
          <Bell className="w-4.5 h-4.5" />
          {displayCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#FF9933] px-0.5 text-[8.5px] font-bold leading-none text-white">
              {displayCount > 9 ? "9+" : displayCount}
            </span>
          )}
        </button>
        <NotificationCenter
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          onUnreadCountChange={setUnread}
        />
      </div>

      {/* Profile */}
      <button
        onClick={() => navigate("/profile")}
        aria-label={`${studentName}'s profile`}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-[#38BDF8] to-[#000080] text-white text-[12px] font-semibold shrink-0"
      >
        {initials}
      </button>
    </header>
  );
}

