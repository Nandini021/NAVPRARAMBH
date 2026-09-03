import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '../auth/AuthProvider';
import { getMockInterviewSessions, saveMockInterviewSession } from '../lib/db';
import { useInterviewCoach } from '../hooks/useInterviewCoach';
import { askSiddhi } from '../services/siddhi/siddhiService';
import type { InterviewMode } from '../store/interviewStore';

const C = { navy: '#0B1957', saffron: '#FF6A00', emerald: '#0A9B5C' };
const MODES: InterviewMode[] = ['hr', 'technical', 'coding', 'behavioral'];

type PersistedSession = Awaited<ReturnType<typeof getMockInterviewSessions>>[number];

export default function MockInterviewPanel() {
  const { user } = useAuth();
  const { session, currentQuestion, start, submitAnswer, nextQuestion, end } = useInterviewCoach();
  const [history, setHistory] = useState<PersistedSession[]>([]);
  const [mode, setMode] = useState<InterviewMode>('hr');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [answer, setAnswer] = useState('');
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let mounted = true;
    getMockInterviewSessions(user.id)
      .then((items) => { if (mounted) setHistory(items); })
      .catch((loadError) => { if (mounted) setError(loadError instanceof Error ? loadError.message : 'Unable to load interview history.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const begin = () => {
    setError(null);
    setLastFeedback(null);
    setAnswer('');
    start(mode, company.trim() || 'General practice', position.trim() || 'Target role', difficulty);
  };

  const submit = async () => {
    const submittedAnswer = answer.trim();
    if (!submittedAnswer || !currentQuestion || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      const response = await askSiddhi(`Give concise, informational coaching on this mock interview answer. Question: ${currentQuestion.question}\nAnswer: ${submittedAnswer}\nMention one strength and one improvement. Do not make a hiring decision or invent facts.`);
      submitAnswer(submittedAnswer, response.text);
      setLastFeedback(`${response.text} ${response.provider === 'gemini' ? 'Powered by Google Gemini.' : 'Local structured fallback.'}`);
      setAnswer('');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const finish = async () => {
    const completed = end();
    if (!completed || !user) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveMockInterviewSession({
        interviewType: completed.mode,
        metadata: {
          company: completed.company,
          position: completed.position,
          difficulty: completed.difficulty,
          questions: completed.questions,
        },
        score: completed.totalScore,
        feedback: completed.questions.map((question) => question.feedback ?? ''),
        completed: true,
      });
      setHistory((items) => [saved, ...items]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this interview.');
    } finally {
      setSaving(false);
    }
  };

  const advance = () => {
    if (!nextQuestion()) void finish();
    else setAnswer('');
  };

  return (
    <Card sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
      <CardContent sx={{ p: 3.5 }}>
        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, color: C.navy, fontSize: 18 }}>Mock Interview Practice</Typography>
        <Typography sx={{ mt: 0.5, color: '#666', fontSize: 13 }}>Practice with structured questions and optional Gemini-backed coaching. Feedback is informational, not a hiring decision, and completed sessions are saved to your private account history.</Typography>
        {error && <Typography role="alert" sx={{ mt: 2, color: '#B42318', fontSize: 13 }}>{error}</Typography>}

        {!session || session.status === 'completed' ? (
          <>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              {MODES.map((item) => <Chip key={item} label={item} onClick={() => setMode(item)} color={mode === item ? 'primary' : 'default'} />)}
              {(['easy', 'medium', 'hard'] as const).map((item) => <Chip key={item} label={item} onClick={() => setDifficulty(item)} color={difficulty === item ? 'secondary' : 'default'} />)}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
              <TextField size="small" fullWidth label="Company (optional)" value={company} onChange={(event) => setCompany(event.target.value)} />
              <TextField size="small" fullWidth label="Target role (optional)" value={position} onChange={(event) => setPosition(event.target.value)} />
            </Stack>
            <Button onClick={begin} disabled={!user || loading} variant="contained" sx={{ mt: 2, background: C.saffron }}>Start practice</Button>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>Saved history</Typography>
            {loading ? <Typography sx={{ mt: 1, color: '#888', fontSize: 13 }}>Loading interview history…</Typography> : history.length === 0 ? <Typography sx={{ mt: 1, color: '#888', fontSize: 13 }}>No completed mock interviews yet.</Typography> : history.slice(0, 5).map((item) => <Typography key={item.id} sx={{ mt: 1, color: '#666', fontSize: 13 }}>{item.interview_type} · {item.score ?? 'No score'} · {new Date(item.started_at).toLocaleDateString()}</Typography>)}
          </>
        ) : (
          <>
            <Chip label={`${session.mode} interview`} sx={{ mt: 2 }} />
            <Typography sx={{ mt: 2, fontWeight: 700, color: C.navy }}>{currentQuestion?.question ?? 'Answer the current question.'}</Typography>
            <TextField fullWidth multiline minRows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write your answer…" sx={{ mt: 2 }} />
            {lastFeedback && <Typography role="status" sx={{ mt: 1.5, color: C.emerald, fontSize: 12 }}>{lastFeedback}</Typography>}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button onClick={() => void submit()} disabled={!answer.trim() || feedbackLoading} variant="outlined">{feedbackLoading ? 'Reviewing…' : 'Submit answer'}</Button>
              <Button onClick={advance} disabled={saving} variant="contained" sx={{ background: C.emerald }}>{currentQuestion && session.currentQuestionIndex < session.questions.length - 1 ? 'Next question' : 'Finish & save'}</Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

