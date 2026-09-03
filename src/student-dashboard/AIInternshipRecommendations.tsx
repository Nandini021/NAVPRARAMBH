import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';


type Recommendation = {
  internshipId: string;
  opportunityType: 'job' | 'internship';
  title: string;
  company: string;
  matchScore: number;
  semanticScore: number;
  skillScore: number | null;
  eligibilityScore: number | null;
  preferenceScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
  applicationUrl: string | null;
  location: string | null;
  workMode: string | null;
};

type RecommendationResponse = {
  model: string;
  recommendations: Recommendation[];
  evaluatedInternships: number;
  evaluatedOpportunities?: number;
  embeddingDimension: number;
};

function Metric({ label, value }: { label: string; value: number | null }) {
  return <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">{label}: {value === null ? 'Unavailable' : `${value}%`}</span>;
}

export function AIInternshipRecommendations({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const recommendationApiUrl = import.meta.env.VITE_RECOMMENDATION_API_URL || '/api/recommendations';
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Your session is not available. Please sign in again.');
      const response = await fetch(recommendationApiUrl, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json() as RecommendationResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'AI recommendations are temporarily unavailable.');
      setData(payload);
    } catch (caught) {
      if (import.meta.env.DEV) console.error('Recommendation request failed:', caught);
      setError(caught instanceof Error ? caught.message : 'AI recommendations are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadRecommendations(); }, [loadRecommendations]);

  return <section id="ai-internship-recommendations" aria-labelledby="ai-internship-heading" className="scroll-mt-24 rounded-3xl bg-[#F4F1FF]/70 p-5 sm:p-7">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF9933]">Powered by Ollama · {data?.model ?? 'nomic-embed-text:latest'}</p>
        <h2 id="ai-internship-heading" className="mt-2 font-['Outfit'] text-2xl font-semibold text-[#000080] sm:text-3xl">AI-Powered Matches for You</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Opportunities matched to your profile, skills and career interests. Scores come from the existing recommendation engine and indicate profile-to-opportunity similarity, not hiring probability.</p>
      </div>
      {compact ? <button type="button" onClick={() => navigate('/student/match')} className="text-sm font-semibold text-[#000080] underline underline-offset-4 hover:text-[#FF9933]">View all matches →</button> : <button type="button" onClick={() => void loadRecommendations()} disabled={loading} className="rounded-full border border-[#000080]/15 bg-white px-4 py-2 text-sm font-semibold text-[#000080] hover:border-[#FF9933]/50 disabled:opacity-50">{loading ? 'Analyzing…' : 'Refresh matches'}</button>}
    </div>
    {loading && <div role="status" className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">Generating profile embeddings with Ollama…</div>}
    {error && !loading && <div role="alert" className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-sm text-amber-800">Recommendations are temporarily unavailable.<button type="button" onClick={() => void loadRecommendations()} className="ml-2 font-semibold underline">Try again</button></div>}
    {!loading && !error && data && data.recommendations.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">No matching jobs or internships are available in the live catalog yet.</div>}
    {!loading && !error && data && data.recommendations.length > 0 && <>
      <p className="mb-4 text-xs text-slate-400">Evaluated {data.evaluatedOpportunities ?? data.evaluatedInternships} real active job/internship record{(data.evaluatedOpportunities ?? data.evaluatedInternships) === 1 ? '' : 's'} · {data.embeddingDimension}-dimension embeddings</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.recommendations.slice(0, compact ? 3 : undefined).map((recommendation) => <article key={recommendation.internshipId} className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#059669]">Live catalog · {recommendation.opportunityType === 'job' ? 'Job' : 'Internship'}</p><h3 className="mt-1 font-['Outfit'] text-lg font-semibold text-[#000080]">{recommendation.title}</h3><p className="mt-1 text-sm text-slate-500">{recommendation.company}{recommendation.workMode ? ` · ${recommendation.workMode}` : ''}{recommendation.location ? ` · ${recommendation.location}` : ''} · {recommendation.opportunityType === 'job' ? 'Job' : 'Internship'}</p></div><div className="shrink-0 rounded-2xl bg-[#059669]/10 px-3 py-2 text-center"><p className="text-2xl font-semibold text-[#059669]">{recommendation.matchScore}%</p><p className="text-[10px] uppercase tracking-wide text-[#059669]">Match</p></div></div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600"><strong className="text-[#000080]">Why this matches you:</strong> {recommendation.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Metric label="AI semantic match" value={recommendation.semanticScore} /><Metric label="Skill match" value={recommendation.skillScore} /><Metric label="Profile compatibility" value={recommendation.eligibilityScore} /><Metric label="Preference compatibility" value={recommendation.preferenceScore} /></div>
          {recommendation.matchedSkills.length > 0 && <p className="mt-4 text-xs text-slate-600"><strong className="text-[#059669]">Matched skills:</strong> {recommendation.matchedSkills.join(', ')}</p>}
          {recommendation.missingSkills.length > 0 && <p className="mt-2 text-xs text-slate-600"><strong className="text-[#FF9933]">Skills to improve:</strong> {recommendation.missingSkills.join(', ')}</p>}
          {recommendation.applicationUrl && <a href={recommendation.applicationUrl} target="_blank" rel="noreferrer" className="mt-5 self-start text-sm font-semibold text-[#000080] underline underline-offset-4 hover:text-[#FF9933]">View application</a>}
        </article>)}
      </div>
    </>}
  </section>;
}
