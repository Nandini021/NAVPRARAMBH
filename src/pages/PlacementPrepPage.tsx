import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MockInterviewPanel from '../components/MockInterviewPanel';
import { getPrepTests, saveTestResult, type PrepTest } from '../lib/db';
import { useAuth } from '../auth/AuthProvider';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C' };

export default function PlacementPrepPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<PrepTest[]>([]);
  const [selected, setSelected] = useState<PrepTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getPrepTests().then((items) => { if (mounted) setTests(items); }).catch(() => { if (mounted) setError('Placement tests could not be loaded.'); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const questions = useMemo(() => selected?.questions ?? [], [selected]);
  const score = useMemo(() => questions.reduce((total, question, index) => total + (question.answer !== undefined && answers[index] === String(question.answer) ? 1 : 0), 0), [questions, answers]);
  const submit = async () => {
    if (!selected || !user) { setError('Please sign in to submit a test result.'); return; }
    setSubmitted(true);
    try { await saveTestResult({ testId: selected.id, score: questions.length ? Math.round((score / questions.length) * 100) : 0, totalQuestions: questions.length, correctAnswers: score }); }
    catch (e) { setError(e instanceof Error ? e.message : 'The result could not be saved.'); }
  };

  return <Box sx={{ background: '#FFFDF8', minHeight: '100vh' }}>
    <Box sx={{ background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', py: { xs: 6, md: 8 }, px: 3, textAlign: 'center' }}><Chip label="Live prep-test catalog" icon={<AssignmentIcon />} sx={{ mb: 2, color: C.golden, background: 'rgba(245,184,0,.15)' }} /><Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 44 }, mb: 2 }}>Placement Preparation</Typography><Typography sx={{ color: 'rgba(255,255,255,.7)' }}>Practice with tests stored in your Supabase prep catalog.</Typography></Box>
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Box sx={{ mb: 5 }}><MockInterviewPanel /></Box>
      <Typography sx={{ color: C.navy, fontSize: 21, fontWeight: 700, mb: 3 }}>Available tests</Typography>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : tests.length === 0 ? <Alert severity="info">No placement tests are available yet.</Alert> : <Grid container spacing={3}>{tests.map((test) => <Grid key={test.id} size={{ xs: 12, sm: 6, md: 4 }}><Card className="card-lift" sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}><Chip label={test.category} size="small" sx={{ mb: 2, textTransform: 'capitalize' }} /><Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 17, mb: 1 }}>{test.title}</Typography><Typography sx={{ color: '#777', mb: 2 }}>{test.questions.length} question{test.questions.length === 1 ? '' : 's'}</Typography><Box sx={{ display: 'flex', gap: 1, mb: 3 }}><Chip icon={<TimerIcon />} label={`${test.duration_minutes} min`} size="small" /><Chip label={test.difficulty ?? 'Not specified'} size="small" /></Box><Button fullWidth onClick={() => { setSelected(test); setAnswers({}); setSubmitted(false); setError(null); }} variant="contained" sx={{ background: C.saffron }}>Start test</Button></CardContent></Card></Grid>)}</Grid>}
    </Box>
    {selected && <Box sx={{ position: 'fixed', inset: 0, zIndex: 1400, background: 'rgba(5,14,56,.72)', overflow: 'auto', p: { xs: 2, md: 6 } }}><Card sx={{ maxWidth: 760, mx: 'auto', mt: { xs: 2, md: 5 } }}><CardContent sx={{ p: { xs: 2, md: 4 } }}><Typography sx={{ color: C.navy, fontSize: 23, fontWeight: 700, mb: 1 }}>{selected.title}</Typography><Typography sx={{ color: '#777', mb: 3 }}>Select one answer for each question, then submit.</Typography>{questions.length === 0 && <Alert severity="info">This test has no question content yet.</Alert>}{questions.map((question, index) => <Box key={index} sx={{ mb: 3, p: 2.5, border: '1px solid rgba(11,25,87,.1)', borderRadius: 3 }}><Typography sx={{ color: C.navy, fontWeight: 600, mb: 2 }}>{index + 1}. {question.question ?? question.q ?? 'Question'}</Typography>{(question.options ?? question.opts ?? []).map((option) => <Button key={option} fullWidth onClick={() => !submitted && setAnswers((current) => ({ ...current, [index]: option }))} sx={{ justifyContent: 'flex-start', mb: 1, border: '1px solid', borderColor: answers[index] === option ? C.saffron : 'rgba(11,25,87,.12)', color: C.navy, background: answers[index] === option ? 'rgba(255,106,0,.08)' : '#fff' }}>{option}</Button>)}</Box>)}{submitted && <Alert severity="success" sx={{ mb: 2 }}>Result saved: {score}/{questions.length} correct.</Alert>}<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}><Button onClick={() => setSelected(null)}>Close</Button>{!submitted && <Button onClick={() => void submit()} variant="contained" sx={{ background: C.saffron }} disabled={!questions.length}>Submit test</Button>}</Box></CardContent></Card></Box>}
  </Box>;
}
