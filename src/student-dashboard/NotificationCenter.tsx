// NotificationCenter.tsx
// Module 9. IMPORTANT DEVIATION, flagged per the module's own "inspect
// first" instruction: MainContentArea.tsx has no Module 9 grid placeholder
// -- Modules 2-11's placeholder slots skip straight from "quick-actions" to
// "achievements" (Module 11). types.ts's `NavItem.badge` comment ("used
// later by Notifications") confirms this was always meant to live on the
// TopNav bell, not as a dashboard section. So this renders as a dropdown
// (desktop) / bottom sheet (mobile) anchored to TopNav's existing bell
// button, and TopNav.tsx is modified instead of MainContentArea.tsx. See
// the delivery report for the full explanation.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Send, Trophy, Mic, BookOpen, MessageSquare, Bell, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../lib/db";
import type { Notification as DatabaseNotification } from "../lib/supabase";

type CategoryId = "job-alert" | "internship-alert" | "achievement" | "interview-alert" | "learning-reminder" | "message";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "job-alert", label: "Job Alerts" },
  { id: "internship-alert", label: "Internship Alerts" },
  { id: "achievement", label: "Achievements" },
  { id: "interview-alert", label: "Interview Reminders" },
  { id: "learning-reminder", label: "Learning Reminders" },
  { id: "message", label: "Messages" },
];

// Types that already existed before Module 9 (success/warning/reminder)
// don't map 1:1 onto the 6 spec categories -- fold them into the closest
// fit rather than adding a 7th "General" filter the spec didn't ask for.
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

function categoryOf(type: string): CategoryId {
  switch (type) {
    case "job-alert": return "job-alert";
    case "internship-alert": return "internship-alert";
    case "achievement": return "achievement";
    case "interview-alert": return "interview-alert";
    case "learning-reminder": return "learning-reminder";
    case "message": return "message";
    case "success": return "achievement";
    default: return "message"; // warning / reminder
  }
}

const CATEGORY_ICON: Record<CategoryId, React.ElementType> = {
  "job-alert": Briefcase,
  "internship-alert": Send,
  achievement: Trophy,
  "interview-alert": Mic,
  "learning-reminder": BookOpen,
  message: MessageSquare,
};

const CATEGORY_COLOR: Record<CategoryId, string> = {
  "job-alert": "#38BDF8",
  "internship-alert": "#FF9933",
  achievement: "#059669",
  "interview-alert": "#8B5CF6",
  "learning-reminder": "#D97706",
  message: "#000080",
};

function relativeTime(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function toNotificationItem(item: DatabaseNotification): NotificationItem {
  const [title, ...messageParts] = item.text.split(" — ");
  return {
    id: item.id,
    type: item.type,
    title: title || "Notification",
    message: messageParts.join(" — ") || item.text,
    timestamp: new Date(item.created_at),
    read: item.read,
  };
}

function useNotificationHistory(userId: string | undefined) {
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getNotifications();
        if (mounted) setHistory(items.map(toNotificationItem));
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Unable to load notifications.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [userId]);

  return { history, setHistory, loading, error };
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationCenter({ open, onClose, onUnreadCountChange }: NotificationCenterProps) {
  const { user } = useAuth();
  const { history, setHistory, loading, error } = useNotificationHistory(user?.id);
  const [filter, setFilter] = useState<CategoryId | "all">("all");

  useEffect(() => {
    onUnreadCountChange?.(history.filter((item) => !item.read).length);
  }, [history, onUnreadCountChange]);

  const sorted = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const filtered = filter === "all" ? sorted : sorted.filter((n) => categoryOf(n.type) === filter);
  const unreadCount = history.filter((n) => !n.read).length;

  const markRead = async (notificationId: string) => {
    setHistory((items) => items.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    try { await markNotificationRead(notificationId); }
    catch { setHistory((items) => items.map((item) => item.id === notificationId ? { ...item, read: false } : item)); }
  };

  const markAllRead = async () => {
    setHistory((items) => items.map((item) => ({ ...item, read: true })));
    try { await markAllNotificationsRead(); }
    catch { const refreshed = await getNotifications(); setHistory(refreshed.map(toNotificationItem)); }
  };

  const panel = (
    <div className="flex h-full max-h-[75vh] flex-col md:max-h-104">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="font-['Outfit'] text-[14px] font-semibold text-[#000080]">Notifications</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#FF9933]/15 px-2 py-0.5 text-[10.5px] font-semibold text-[#FF9933]">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="flex items-center gap-1 text-[11px] font-medium text-[#8B5CF6] disabled:opacity-30"
        >
          <CheckCheck size={13} /> Mark all read
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-black/5 px-3 py-2 scrollbar-none">
        <button
          onClick={() => setFilter("all")}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            filter === "all" ? "bg-[#000080] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              filter === c.id ? "text-white" : "bg-slate-100 text-slate-500"
            }`}
            style={filter === c.id ? { background: CATEGORY_COLOR[c.id] } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {error && <p role="alert" className="p-4 text-sm text-red-700">{error}</p>}
        {loading ? <p className="p-4 text-sm text-slate-500">Loading notifications…</p> : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Bell size={16} className="text-slate-300" />
            </div>
            <p className="text-[12.5px] font-medium text-slate-400">You're all caught up</p>
          </div>
        ) : (
          <ul>
            {filtered.map((n) => {
              const cat = categoryOf(n.type);
              const Icon = CATEGORY_ICON[cat];
              const color = CATEGORY_COLOR[cat];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => void markRead(n.id)}
                    className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      !n.read ? "bg-[#38BDF8]/5" : ""
                    }`}
                  >
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${color}1A`, color }}
                    >
                      <Icon size={13} strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[12.5px] font-semibold text-slate-700">{n.title}</p>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF9933]" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] text-slate-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{relativeTime(n.timestamp)}</p>
                    </div>
                    {n.read && <Check size={12} className="mt-1 shrink-0 text-slate-300" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-away backdrop (invisible on desktop, dim on mobile) */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/0 md:bg-transparent max-md:bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Desktop dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 hidden w-96 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl md:block"
          >
            {panel}
          </motion.div>

          {/* Mobile bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-3xl border-t border-black/5 bg-white shadow-2xl md:hidden"
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200" />
            {panel}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
