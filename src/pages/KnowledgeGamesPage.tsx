import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarsIcon from '@mui/icons-material/Stars';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../auth/AuthProvider';
import { getGames, getAchievementData, startGameAttempt, submitGameAttempt } from '../lib/db';
import type { Game } from '../lib/supabase';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

type GameCard = Game & { color: string; players: string };
const GAME_COLORS = ['#0B1957', '#FF6A00', '#9B59B6', '#2ECC71', '#3498DB'];

type AchievementView = { label: string; emoji: string; xp: number; earned: boolean };

export default function KnowledgeGamesPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameCard[]>([]);
  const [achievements, setAchievements] = useState<AchievementView[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GameCard | null>(null);
  const [attempt, setAttempt] = useState<Awaited<ReturnType<typeof startGameAttempt>> | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitGameAttempt>> | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameMessage, setGameMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([getGames(), getAchievementData(user.id)])
      .then(([items, achievementData]) => {
        if (!mounted) return;
        setGames(items.map((game, index) => ({ ...game, color: GAME_COLORS[index % GAME_COLORS.length], players: 'Catalog game' })));
        const earnedIds = new Set(achievementData.earnedBadges.map((item) => item.badge_id));
        setAchievements(achievementData.badges.map((badge) => ({ label: badge.name, emoji: badge.emoji ?? '🏅', xp: badge.xp_required, earned: earnedIds.has(badge.id) })));
      })
      .catch(() => { if (mounted) setError('Games could not be loaded. Please try again later.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const beginGame = async () => {
    if (!selected || !user || starting) return;
    setStarting(true);
    setGameMessage(null);
    setResult(null);
    try {
      setAttempt(await startGameAttempt(selected.id, selected.difficulty ?? undefined));
    } catch (startError) {
      setGameMessage(startError instanceof Error ? startError.message : 'This game could not be started.');
    } finally {
      setStarting(false);
    }
  };

  const submitAnswers = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    setGameMessage(null);
    try {
      const payload = attempt.questions.map((question) => ({ questionId: question.id, selectedAnswer: answers[question.id] ?? '' }));
      setResult(await submitGameAttempt(attempt.attemptId, payload));
    } catch (submitError) {
      setGameMessage(submitError instanceof Error ? submitError.message : 'The game result could not be recorded.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ background: '#0B0B1A', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg,#0B0B1A 0%,#1A0A3E 50%,#0B0B1A 100%)', py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
          <Box key={i} sx={{ position: 'absolute', borderRadius: '50%', background: `rgba(${i % 3 === 0 ? '255,106,0' : i % 3 === 1 ? '245,184,0' : '96,178,229'},0.15)`, width: 4 + (i % 5) * 3, height: 4 + (i % 5) * 3, top: `${(i * 7.3) % 100}%`, left: `${(i * 5.2) % 100}%`, animation: `sunRay ${2 + (i % 4)}s ease-in-out infinite`, animationDelay: `${(i % 6) * 0.3}s` }} />
        ))}
        <SportsEsportsIcon sx={{ fontSize: 56, color: C.golden, mb: 2 }} />
        <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 48 }, mb: 2 }}>Knowledge Games</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontFamily: '"Outfit",sans-serif', fontSize: 16, maxWidth: 520, mx: 'auto', mb: 3 }}>
          Learn through play. Earn XP, unlock achievements, climb the leaderboard.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          {[{ label: 'Live catalog', value: loading ? '…' : String(games.length), icon: '🎮' }, { label: 'Reward engine', value: 'Protected', icon: '🔒' }, { label: 'Badges', value: loading ? '…' : String(achievements.filter((item) => item.earned).length), icon: '🏅' }].map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 28 }}>{stat.icon}</Typography>
              <Typography sx={{ color: C.golden, fontFamily: '"Outfit",sans-serif', fontWeight: 800, fontSize: 22 }}>{stat.value}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: '"Outfit",sans-serif' }}>{stat.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 6 }}>
        {/* Achievements */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, color: '#fff', fontSize: 18, mb: 2.5 }}>Your Achievements</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {achievements.length === 0 ? <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>No earned or available badges yet.</Typography> : achievements.map((a) => (
              <Box key={a.label} sx={{ p: 2, borderRadius: 3, background: a.earned ? 'rgba(245,184,0,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${a.earned ? 'rgba(245,184,0,0.3)' : 'rgba(255,255,255,0.07)'}`, textAlign: 'center', minWidth: 100, opacity: a.earned ? 1 : 0.5 }}>
                <Typography sx={{ fontSize: 28 }}>{a.emoji}</Typography>
                <Typography sx={{ color: '#fff', fontSize: 11, fontFamily: '"Outfit",sans-serif', fontWeight: 600 }}>{a.label}</Typography>
                <Typography sx={{ color: C.golden, fontSize: 10, fontFamily: '"Outfit",sans-serif' }}>+{a.xp} XP</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Games Grid */}
        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, color: '#fff', fontSize: 18, mb: 3 }}>All Games</Typography>
        <Grid container spacing={3}>
          {loading ? <Grid size={{ xs: 12 }}><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: C.golden }} /></Box></Grid> : error ? <Grid size={{ xs: 12 }}><Alert severity="error">{error}</Alert></Grid> : games.length === 0 ? <Grid size={{ xs: 12 }}><Alert severity="info">No games are available yet.</Alert></Grid> : games.map((game, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card className="card-lift" onClick={() => setSelected(game)} sx={{ cursor: 'pointer', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', '&:hover': { background: 'rgba(255,255,255,0.08)', border: `1px solid ${game.color}40` } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography sx={{ fontSize: 40 }}>{game.emoji}</Typography>
                    <Chip label={game.difficulty} size="small" sx={{ fontSize: 10, fontFamily: '"Outfit",sans-serif', fontWeight: 600, background: game.difficulty === 'Easy' ? 'rgba(10,155,92,0.15)' : game.difficulty === 'Medium' ? 'rgba(245,184,0,0.15)' : 'rgba(231,76,60,0.15)', color: game.difficulty === 'Easy' ? C.emerald : game.difficulty === 'Medium' ? C.golden : '#E74C3C' }} />
                  </Box>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', mb: 1 }}>{game.name}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontFamily: '"Outfit",sans-serif', fontSize: 12, lineHeight: 1.7, mb: 2 }}>{game.description ?? 'Practice a career-building challenge.'}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarsIcon sx={{ fontSize: 14, color: C.golden }} />
                      <Typography sx={{ fontSize: 12, color: C.golden, fontFamily: '"Outfit",sans-serif', fontWeight: 700 }}>{game.xp_reward} XP base reward</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: '"Outfit",sans-serif' }}>{game.players} players</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Game Dialog */}
      <Dialog open={!!selected} onClose={() => { setSelected(null); setAttempt(null); setAnswers({}); setResult(null); setGameMessage(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 5 } }}>
        {selected && <>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(11,25,87,.08)' }}>
            <Box><Typography sx={{ fontSize: 36 }}>{selected.emoji}</Typography><Typography sx={{ fontWeight: 700, color: C.navy, fontSize: 20 }}>{selected.name}</Typography><Chip label={selected.difficulty ?? 'Not specified'} size="small" sx={{ mt: 1 }} /></Box>
            <IconButton onClick={() => { setSelected(null); setAttempt(null); setAnswers({}); setResult(null); }} aria-label="Close game"><CloseIcon /></IconButton>
          </Box>
          <DialogContent sx={{ p: 3 }}>
            {!attempt && !result && <><Typography sx={{ color: '#667085', lineHeight: 1.8, mb: 3 }}>{selected.description ?? 'Practice a career-building challenge.'}</Typography><Typography sx={{ color: '#667085', fontSize: 13, mb: 2 }}>Questions and scoring are supplied by the protected game backend. No questions or scores are invented in the browser.</Typography>{gameMessage && <Alert severity="warning" sx={{ mb: 2 }}>{gameMessage}</Alert>}<Button fullWidth size="large" onClick={() => void beginGame()} disabled={starting} variant="contained" sx={{ background: selected.color }}>{starting ? 'Starting…' : 'Start Game'}</Button></>}
            {attempt && !result && <Box><Typography sx={{ color: C.navy, fontWeight: 700, mb: 2 }}>Answer the published questions</Typography>{attempt.questions.map((question) => <Box key={question.id} sx={{ mb: 3 }}><Typography sx={{ color: C.navy, fontWeight: 600, mb: 1.5 }}>{question.prompt}</Typography><Grid container spacing={1}>{question.options.map((option) => <Grid key={option} size={{ xs: 12, sm: 6 }}><Button fullWidth onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))} sx={{ justifyContent: 'flex-start', border: '1px solid', borderColor: answers[question.id] === option ? C.saffron : 'rgba(11,25,87,.12)', color: C.navy, background: answers[question.id] === option ? 'rgba(255,106,0,.08)' : '#fff' }}>{option}</Button></Grid>)}</Grid></Box>)}{gameMessage && <Alert severity="warning" sx={{ mb: 2 }}>{gameMessage}</Alert>}<Button fullWidth onClick={() => void submitAnswers()} disabled={submitting || attempt.questions.some((question) => !answers[question.id])} variant="contained" sx={{ background: C.emerald }}>{submitting ? 'Submitting securely…' : 'Submit game'}</Button></Box>}
            {result && <Alert severity="success">Result recorded: {result.score}% ({result.correctAnswers}/{result.totalQuestions} correct). XP earned: {result.xpEarned}.</Alert>}
          </DialogContent>
        </>}
      </Dialog>
    </Box>
  );
}

