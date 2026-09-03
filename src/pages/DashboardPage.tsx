import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

function ScoreRing({ value, label, color, size = 100 }: { value: number; label: string; color: string; size?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
        <CircularProgress variant="determinate" value={100} size={size} thickness={4} sx={{ color: 'rgba(11,25,87,0.06)', position: 'absolute' }} />
        <CircularProgress variant="determinate" value={value} size={size} thickness={4} sx={{ color }} />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 800, fontSize: size > 90 ? 22 : 16, color: C.navy }}>{value}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 11, fontFamily: '"Outfit",sans-serif', color: '#666', textAlign: 'center' }}>{label}</Typography>
    </Box>
  );
}

const DAILY_GOALS = [
  { label: 'Complete Python Module 3', done: true },
  { label: 'Practice 5 aptitude questions', done: true },
  { label: 'Review SIDDHI\'s roadmap suggestion', done: false },
  { label: 'Apply to 2 internships', done: false },
  { label: 'Update project portfolio', done: false },
];

const NOTIFICATIONS = [
  { text: 'New job match: SDE at Infosys', time: '2m ago', type: 'job' },
  { text: 'SIDDHI AI: Your resume score improved!', time: '1h ago', type: 'ai' },
  { text: 'Mock interview scheduled for tomorrow', time: '3h ago', type: 'interview' },
  { text: 'New course: Advanced React available', time: '1d ago', type: 'course' },
];

const ACHIEVEMENTS = [
  { label: 'Resume Master', icon: '📄', xp: 200 },
  { label: 'Quiz Champion', icon: '🧠', xp: 150 },
  { label: 'First Apply', icon: '🚀', xp: 100 },
  { label: 'Code Streak', icon: '🔥', xp: 300 },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ background: '#F8F9FC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg,#0B1957 0%,#1A2E7E 100%)', pt: 5, pb: 8, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Outfit",sans-serif', fontSize: 13, mb: 0.5 }}>
                Good Morning 🌅
              </Typography>
              <Typography sx={{ fontFamily: '"Fraunces",serif', fontWeight: 700, color: '#fff', fontSize: { xs: 24, md: 32 }, mb: 0.5 }}>
                Arjun Mehta
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"Outfit",sans-serif', fontSize: 14 }}>
                Computer Science · Final Year · BITS Pilani
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Chip icon={<LocalFireDepartmentIcon sx={{ fontSize: 14 }} />} label="12-day streak!" sx={{ background: 'rgba(255,106,0,0.2)', color: C.golden, fontFamily: '"Outfit",sans-serif', fontWeight: 600, border: '1px solid rgba(255,106,0,0.3)', '& .MuiChip-icon': { color: C.saffron } }} />
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <NotificationsIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Avatar sx={{ background: 'linear-gradient(135deg,#FF6A00,#F5B800)', fontFamily: '"Outfit",sans-serif', fontWeight: 700, width: 42, height: 42, fontSize: 16 }}>A</Avatar>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 6 }, mt: -4, pb: 8 }}>
        {/* Score Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 4, p: 1, background: '#fff', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 17, color: C.navy }}>Placement Readiness</Typography>
                  <Chip label="Rising Fast!" icon={<TrendingUpIcon sx={{ fontSize: 13 }} />} size="small" sx={{ background: 'rgba(10,155,92,0.08)', color: C.emerald, fontFamily: '"Outfit",sans-serif', fontWeight: 600, '& .MuiChip-icon': { color: C.emerald } }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 3 }}>
                  <ScoreRing value={87} label="Career Score" color={C.saffron} size={110} />
                  <ScoreRing value={74} label="Resume Score" color={C.navy} size={110} />
                  <ScoreRing value={68} label="ATS Score" color={C.emerald} size={110} />
                  <ScoreRing value={80} label="Interview Ready" color={C.golden} size={110} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', height: '100%', boxShadow: '0 4px 24px rgba(11,25,87,0.15)' }}>
              <CardContent sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ color: '#fff', fontFamily: '"Outfit",sans-serif', fontWeight: 700 }}>SIDDHI AI Insight</Typography>
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontFamily: '"Outfit",sans-serif', fontSize: 13, lineHeight: 1.8, flex: 1 }}>
                  Your Python skills are strong! Focus on System Design and DSA to boost your career score to 95+. I've prepared a 3-week plan.
                </Typography>
                <Button sx={{ mt: 2, color: C.golden, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13, p: 0, '&:hover': { background: 'none', textDecoration: 'underline' } }} endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}>
                  View My Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Daily Goals */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', height: '100%', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 16, color: C.navy }}>Today's Goals</Typography>
                  <Chip label="2/5 done" size="small" sx={{ background: 'rgba(255,106,0,0.08)', color: C.saffron, fontFamily: '"Outfit",sans-serif', fontWeight: 600 }} />
                </Box>
                <LinearProgress variant="determinate" value={40} sx={{ mb: 3, borderRadius: 3, height: 6, background: 'rgba(11,25,87,0.06)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#FF6A00,#F5B800)', borderRadius: 3 } }} />
                {DAILY_GOALS.map((g, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: g.done ? C.emerald : 'rgba(11,25,87,0.15)' }} />
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontSize: 13, color: g.done ? '#777' : C.navy, textDecoration: g.done ? 'line-through' : 'none' }}>{g.label}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Learning Progress */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', height: '100%', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 16, color: C.navy, mb: 2.5 }}>Learning Progress</Typography>
                {[
                  { label: 'Python for AI', pct: 72, color: C.navy },
                  { label: 'DSA Fundamentals', pct: 45, color: C.saffron },
                  { label: 'System Design', pct: 28, color: C.emerald },
                  { label: 'Communication Skills', pct: 60, color: C.golden },
                ].map((c) => (
                  <Box key={c.label} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                      <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontSize: 13, color: C.navy }}>{c.label}</Typography>
                      <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontSize: 12, color: '#777', fontWeight: 600 }}>{c.pct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={c.pct} sx={{ borderRadius: 3, height: 6, background: 'rgba(11,25,87,0.06)', '& .MuiLinearProgress-bar': { background: c.color, borderRadius: 3 } }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', height: '100%', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 16, color: C.navy, mb: 2.5 }}>Notifications</Typography>
                {NOTIFICATIONS.map((n, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: n.type === 'ai' ? 'rgba(255,106,0,0.1)' : n.type === 'job' ? 'rgba(11,25,87,0.07)' : n.type === 'interview' ? 'rgba(10,155,92,0.08)' : 'rgba(96,178,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {n.type === 'ai' ? <AutoAwesomeIcon sx={{ fontSize: 15, color: C.saffron }} /> : n.type === 'job' ? <WorkIcon sx={{ fontSize: 15, color: C.navy }} /> : n.type === 'interview' ? <AssignmentIcon sx={{ fontSize: 15, color: C.emerald }} /> : <SchoolIcon sx={{ fontSize: 15, color: C.sky }} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontSize: 13, color: C.navy, lineHeight: 1.4 }}>{n.text}</Typography>
                      <Typography sx={{ fontSize: 11, color: '#aaa', fontFamily: '"Outfit",sans-serif', mt: 0.3 }}>{n.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 16, color: C.navy, mb: 3 }}>Quick Actions</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Find Jobs', icon: <WorkIcon />, color: C.navy, bg: 'rgba(11,25,87,0.06)', path: '/jobs' },
                    { label: 'Courses', icon: <SchoolIcon />, color: C.sky, bg: 'rgba(96,178,229,0.1)', path: '/courses' },
                    { label: 'Certifications', icon: <EmojiEventsIcon />, color: C.golden, bg: 'rgba(245,184,0,0.08)', path: '/certifications' },
                    { label: 'Mock Interview', icon: <AssignmentIcon />, color: C.emerald, bg: 'rgba(10,155,92,0.07)', path: '/placement-prep' },
                    { label: 'Career Map', icon: <TrendingUpIcon />, color: C.saffron, bg: 'rgba(255,106,0,0.07)', path: '/careers' },
                    { label: 'Games', icon: <StarIcon />, color: '#9B59B6', bg: 'rgba(155,89,182,0.07)', path: '/games' },
                  ].map((a) => (
                    <Grid key={a.label} size={{ xs: 6, sm: 4 }}>
                      <Box onClick={() => navigate(a.path)} className="card-lift" sx={{ p: 2.5, borderRadius: 3, background: a.bg, cursor: 'pointer', textAlign: 'center', border: `1px solid ${a.bg}` }}>
                        <Box sx={{ color: a.color, mb: 1 }}>{a.icon}</Box>
                        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13, color: C.navy }}>{a.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Achievements */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', height: '100%', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 16, color: C.navy }}>Achievements</Typography>
                  <Chip label="2,400 XP" icon={<StarIcon sx={{ fontSize: 13 }} />} size="small" sx={{ background: 'rgba(245,184,0,0.1)', color: '#8B6000', fontFamily: '"Outfit",sans-serif', fontWeight: 700, '& .MuiChip-icon': { color: C.golden } }} />
                </Box>
                <Grid container spacing={1.5}>
                  {ACHIEVEMENTS.map((a) => (
                    <Grid key={a.label} size={{ xs: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 3, background: 'rgba(11,25,87,0.03)', border: '1px solid rgba(11,25,87,0.06)', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 24, mb: 0.5 }}>{a.icon}</Typography>
                        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontSize: 11, fontWeight: 600, color: C.navy, lineHeight: 1.3 }}>{a.label}</Typography>
                        <Typography sx={{ fontSize: 10, color: C.golden, fontFamily: '"Outfit",sans-serif', fontWeight: 700 }}>+{a.xp} XP</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button fullWidth sx={{ mt: 2.5, borderRadius: 10, background: 'rgba(11,25,87,0.04)', color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13, '&:hover': { background: 'rgba(11,25,87,0.08)' } }}>
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
