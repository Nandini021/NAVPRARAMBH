import { useEffect, useState } from "react";
import { toggleGoal } from "../lib/db";
import type { Goal } from "../lib/supabase";

export function GoalsPanel({ goals }: { goals?: Goal[] }) {
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals ?? []);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setLocalGoals(goals ?? []); }, [goals]);

  const complete = async (goal: Goal) => {
    setSavingId(goal.id); setError(null);
    try {
      await toggleGoal(goal.id, !goal.completed);
      setLocalGoals((items) => items.map((item) => item.id === goal.id ? { ...item, completed: !goal.completed } : item));
    } catch { setError("This goal could not be updated. Please try again."); }
    finally { setSavingId(null); }
  };

  return <section id="goals" className="scroll-mt-24">
    <div className="mb-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#059669]">Your commitments</p><h2 className="mt-1 font-['Outfit'] text-xl font-semibold text-[#000080] sm:text-2xl">Goals</h2><p className="mt-1 text-sm text-slate-500">Completion is saved to your authenticated account.</p></div>
    <div className="rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      {error && <p role="alert" className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {goals === undefined ? <p className="text-sm text-slate-500">Loading goals…</p> : localGoals.length === 0 ? <p className="text-sm text-slate-500">No daily or weekly goals have been assigned yet.</p> : <div className="space-y-2">{localGoals.slice(0, 8).map((goal) => <label key={goal.id} className="flex items-center gap-3 rounded-xl border border-black/5 bg-slate-50/70 p-3"><input type="checkbox" checked={goal.completed} disabled={savingId === goal.id} onChange={() => void complete(goal)} className="h-4 w-4 accent-[#059669]" /><span className={`text-sm ${goal.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{goal.title}</span><span className="ml-auto text-[10px] uppercase text-slate-400">{goal.type}</span></label>)}</div>}
    </div>
  </section>;
}

