import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MinimizeIcon from '@mui/icons-material/Remove';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import MapIcon from '@mui/icons-material/Map';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAuth } from '../auth/AuthProvider';
import { getSiddhiContext } from '../lib/db';
import { askSiddhi, type SiddhiAction, type SiddhiMessage } from '../services/siddhi/siddhiService';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C' };

const QUICK_PROMPTS = [
  { label: 'Review my resume', icon: <DescriptionIcon sx={{ fontSize: 13 }} /> },
  { label: 'Mock interview', icon: <MicIcon sx={{ fontSize: 13 }} /> },
  { label: 'Career roadmap', icon: <MapIcon sx={{ fontSize: 13 }} /> },
  { label: 'Coding help', icon: <CodeIcon sx={{ fontSize: 13 }} /> },
  { label: 'Find jobs', icon: <TrendingUpIcon sx={{ fontSize: 13 }} /> },
  { label: 'Recommend courses', icon: <SchoolIcon sx={{ fontSize: 13 }} /> },
  { label: 'Aptitude practice', icon: <BarChartIcon sx={{ fontSize: 13 }} /> },
  { label: 'Certifications', icon: <EmojiEventsIcon sx={{ fontSize: 13 }} /> },
];

const SIDDHI_RESPONSES: Record<string, string> = {
  default: "Namaste! I'm SIDDHI, your guided career companion. I provide structured, local guidance for resumes, interviews, coding, roadmaps, jobs, and courses. What would you like to explore today?",
  resume: "I'd love to review your resume! Share it and I'll analyze ATS compatibility, formatting, keywords, and give you a score out of 100 with detailed suggestions for improvement.",
  interview: "Let's practice! Tell me the role and company you're targeting, and I'll simulate a real interview — technical, HR, and behavioral — with instant feedback on your answers.",
  roadmap: "Great choice! Share your target career and current skills. I'll create a personalized step-by-step roadmap with courses, projects, milestones, and a timeline to get you job-ready.",
  coding: "I'm here to help with coding! Share your code or describe the problem — Python, Java, JavaScript, SQL, React, DSA — I'll guide you through the solution step by step.",
  job: "Let me find the best jobs for you! Tell me your skills, preferred location, and desired role. I'll match you with opportunities from our curated listings and partner companies.",
  course: "Based on your career goals, I'll recommend the best courses. Are you looking for programming, data science, marketing, or something else? I'll find courses that fit your level.",
  aptitude: "Let's sharpen your aptitude! I can generate practice questions for quantitative, logical reasoning, and verbal ability — just like real placement tests. Ready to start?",
  certification: "I can recommend certifications that boost your career! Google, Microsoft, AWS, IBM, Cisco — tell me your field and I'll suggest the most valuable ones for your profile.",
};

interface Message {
  role: 'user' | 'assistant';
  text: string;
  time: string;
  actions?: SiddhiAction[];
}

export default function SiddhiAI() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [contextSummary, setContextSummary] = useState('');
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: SIDDHI_RESPONSES.default, time: 'now' },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openSiddhi = () => { setOpen(true); setMinimized(false); };
    window.addEventListener('navprarambh:open-siddhi', openSiddhi);
    return () => window.removeEventListener('navprarambh:open-siddhi', openSiddhi);
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    getSiddhiContext(user.id).then((context) => {
      if (!mounted) return;
      const name = context.profile?.full_name?.trim() || profile?.full_name?.trim() || 'there';
      const applications = context.dashboard.applications.length;
      const enrollments = context.dashboard.enrollments.length;
      const roadmapProgress = context.roadmaps[0]?.progress ?? 0;
      const goalsCompleted = context.dashboard.goals.filter((goal) => goal.completed).length;
      const goalsTotal = context.dashboard.goals.length;
      const atsScore = context.dashboard.score?.ats_score ?? null;
      setContextSummary(`${name} has ${applications} application${applications === 1 ? '' : 's'}, ${enrollments} enrollment${enrollments === 1 ? '' : 's'}, ${goalsCompleted}/${goalsTotal} goals complete, and ${roadmapProgress}% roadmap progress${atsScore === null ? '' : `; ATS score ${atsScore}.`}`);
    }).catch(() => {
      if (mounted) setContextSummary('Your live student data is temporarily unavailable.');
    });
    return () => { mounted = false; };
  }, [user, profile]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);



  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const conversation: SiddhiMessage[] = messages.map((message) => ({ role: message.role === 'assistant' ? 'assistant' : 'user', text: message.text }));
    setMessages(p => [...p, { role: 'user', text: trimmed, time: now() }]);
    setInput('');
    setTyping(true);
    const response = await askSiddhi(trimmed, conversation);
    setTyping(false);
    setMessages(p => [...p, { role: 'assistant', text: response.text, time: now(), actions: response.actions }]);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <Box
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open SIDDHI career companion"
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setOpen(true); }}
          className="glow-pulse"
          sx={{
            position: 'fixed', bottom: { xs: 'calc(5.25rem + env(safe-area-inset-bottom))', sm: 32 }, right: { xs: 16, sm: 32 }, zIndex: 1300,
            width: { xs: 58, sm: 64 }, height: { xs: 58, sm: 64 }, borderRadius: '50%', cursor: 'pointer',
            background: 'linear-gradient(135deg, #FF6A00 0%, #F5B800 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 28px rgba(255,106,0,0.42)',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.08)' },
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/siddhi-character.webp"
              alt="SIDDHI AI"
              sx={{ width: { xs: 42, sm: 48 }, height: { xs: 42, sm: 48 }, objectFit: 'contain', filter: 'drop-shadow(0 3px 8px rgba(11,25,87,0.25))' }}
            />
            <Box sx={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: C.emerald, border: '2px solid #fff' }} />
          </Box>
        </Box>
      )}

      {/* Chat Panel */}
      <Fade in={open}>
        <Box sx={{
          position: 'fixed', bottom: { xs: 76, sm: 32 }, right: { xs: 12, sm: 32 }, zIndex: 1300,
          width: { xs: 'calc(100vw - 24px)', sm: 400 }, maxWidth: 400, height: minimized ? 72 : { xs: 'min(76vh, 600px)', sm: 600 },
          borderRadius: 4, overflow: 'hidden',
          background: 'rgba(255,253,248,0.96)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 72px rgba(11,25,87,0.18)',
          border: '1px solid rgba(11,25,87,0.1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: open ? 'flex' : 'none',
          flexDirection: 'column',
          transition: 'height 0.3s ease',
        }}>
          {/* Header */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(135deg, #0B1957 0%, #1A2E7E 100%)' }}>
            <Box className="pulse-glow" sx={{ width: 48, height: 48, borderRadius: 3, background: 'linear-gradient(135deg, #FFF7E8, #EAF7F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,.35)' }}>
              <Box component="img" src="/siddhi-character.webp" alt="SIDDHI career mentor" sx={{ width: 44, height: 44, objectFit: 'contain' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#fff', fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>✨ SIDDHI AI</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: C.emerald }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: '"Outfit",sans-serif' }}>Your NAVPRARAMBH Career Companion · Powered by Google Gemini</Typography>
              </Box>
            </Box>
            <IconButton size="small" aria-label={minimized ? 'Expand SIDDHI' : 'Minimize SIDDHI'} onClick={() => setMinimized(p => !p)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' } }}><MinimizeIcon fontSize="small" /></IconButton>
            <IconButton size="small" aria-label="Close SIDDHI" onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' } }}><CloseIcon fontSize="small" /></IconButton>
          </Box>

          {!minimized && (
            <>
              {/* Messages */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {contextSummary && <Typography sx={{ fontSize: 11, color: '#777', background: 'rgba(11,25,87,0.04)', borderRadius: 2, p: 1.2 }}>{contextSummary}</Typography>}
                {messages.map((msg, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
                    {msg.role === 'assistant' && (
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, mt: 0.3, background: 'linear-gradient(135deg, #FF6A00, #F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 14, color: '#fff' }} />
                      </Box>
                    )}
                    <Box sx={{ maxWidth: '80%' }}>
                      <Box sx={{
                        p: '10px 14px',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #0B1957, #1A2E7E)' : 'rgba(11,25,87,0.05)',
                        border: msg.role === 'assistant' ? '1px solid rgba(11,25,87,0.08)' : 'none',
                      }}>
                        <Typography sx={{ fontSize: 13, lineHeight: 1.5, fontFamily: '"Outfit",sans-serif', color: msg.role === 'user' ? '#fff' : C.navy }}>{msg.text}</Typography>
                        {msg.actions?.length ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>{msg.actions.map((action) => <Chip key={action.id} label={action.label} size="small" onClick={() => navigate(action.id === 'roadmap' || action.id === 'resume' ? action.id === 'roadmap' ? '/dashboard#roadmap' : '/dashboard#resume-health' : ({ jobs: '/jobs', internships: '/internships', courses: '/courses', careers: '/careers', interview: '/placement-prep', quizzes: '/placement-prep', games: '/games', certifications: '/certifications' } as Record<string, string>)[action.id])} sx={{ fontSize: 10, color: C.navy, background: '#fff' }} />)}</Box> : null}
                      </Box>
                      <Typography sx={{ fontSize: 10, color: 'rgba(11,25,87,0.4)', mt: 0.3, px: 0.5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</Typography>
                    </Box>
                  </Box>
                ))}
                {typing && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AutoAwesomeIcon sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                    <Box sx={{ p: '10px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(11,25,87,0.05)', border: '1px solid rgba(11,25,87,0.08)', display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      {[0, 1, 2].map(i => <Box key={i} className="ai-dot" sx={{ width: 6, height: 6, borderRadius: '50%', background: C.saffron }} />)}
                    </Box>
                  </Box>
                )}
                <div ref={bottomRef} />
              </Box>

              {/* Quick Prompts */}
              <Box sx={{ px: 1.5, pb: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap', overflow: 'hidden' }}>
                {QUICK_PROMPTS.map(p => (
                  <Chip key={p.label} icon={p.icon} label={p.label} size="small" onClick={() => send(p.label)} sx={{ fontSize: 10, fontFamily: '"Outfit",sans-serif', cursor: 'pointer', background: 'rgba(255,106,0,0.06)', color: C.navy, border: '1px solid rgba(255,106,0,0.15)', '& .MuiChip-icon': { color: C.saffron }, '&:hover': { background: 'rgba(255,106,0,0.12)' } }} />
                ))}
              </Box>

              {/* Input */}
              <Box sx={{ p: 1.5, pt: 0.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth multiline maxRows={3}
                  placeholder="Ask SIDDHI anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: 13, fontFamily: '"Outfit",sans-serif', background: 'rgba(11,25,87,0.04)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,25,87,0.12)' },
                  }}
                />
                <IconButton disabled aria-label="Voice input unavailable" title="Voice input is not available" sx={{ color: 'rgba(11,25,87,0.25)' }}>
                  <MicIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton onClick={() => void send(input)} disabled={!input.trim() || typing} aria-label="Send message to SIDDHI" sx={{ background: input.trim() ? 'linear-gradient(135deg,#FF6A00,#F5B800)' : 'rgba(11,25,87,0.06)', color: input.trim() ? '#fff' : 'rgba(11,25,87,0.25)', borderRadius: 2, '&:hover': { background: input.trim() ? 'linear-gradient(135deg,#FF8C40,#F5C800)' : undefined } }}>
                  <SendIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </>
  );
}
