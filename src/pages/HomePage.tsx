import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MapIcon from '@mui/icons-material/Map';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import BarChartIcon from '@mui/icons-material/BarChart';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase, type Job, type Internship, type Course, type Career } from '../lib/supabase';
import { askSiddhi } from '../services/siddhi/siddhiService';

const C = { navy: '#0B1957', navyLight: '#1A2E7E', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

const FOOTER_PATHS: Record<string, string> = {
  'Career Explorer': '/careers', Jobs: '/jobs', Internships: '/internships', Courses: '/courses',
  Certifications: '/certifications', Dashboard: '/dashboard', 'Placement Prep': '/placement-prep',
  'Knowledge Games': '/games',
};

// ─── STATIC DATA (hackathons, scholarships, govt jobs, FAQs) ──────
const HACKATHONS: Array<{ title: string; org: string; deadline: string; prize: string; participants: string }> = [];

const SCHOLARSHIPS: Array<{ title: string; amount: string; deadline: string; eligibility: string }> = [];

const GOVT_JOBS: Array<{ title: string; org: string; posts: string; deadline: string }> = [];

const TRENDING_SKILLS = ['Explore skills', 'Build projects', 'Practice interviews', 'Track progress'];

const COMMUNITY = [
  { label: 'Students', icon: <SchoolIcon sx={{ fontSize: 20 }} />, color: C.navy, desc: 'Learn, practice & grow together' },
  { label: 'Mentors', icon: <LightbulbIcon sx={{ fontSize: 20 }} />, color: C.saffron, desc: 'Guide the next generation' },
  { label: 'Recruiters', icon: <BusinessIcon sx={{ fontSize: 20 }} />, color: C.emerald, desc: 'Discover top talent' },
  { label: 'Companies', icon: <BusinessIcon sx={{ fontSize: 20 }} />, color: C.sky, desc: 'Hire & build your team' },
  { label: 'Colleges', icon: <SchoolIcon sx={{ fontSize: 20 }} />, color: '#9B59B6', desc: 'Manage placements' },
  { label: 'Alumni', icon: <GroupIcon sx={{ fontSize: 20 }} />, color: C.golden, desc: 'Give back & connect' },
];

const SIDDHI_CAPABILITIES = [
  { icon: <LightbulbIcon sx={{ fontSize: 14 }} />, label: 'Guided prompts' },
  { icon: <DescriptionIcon sx={{ fontSize: 14 }} />, label: 'Resume Review' },
  { icon: <WorkIcon sx={{ fontSize: 14 }} />, label: 'Find Jobs' },
  { icon: <MapIcon sx={{ fontSize: 14 }} />, label: 'Roadmap' },
  { icon: <CodeIcon sx={{ fontSize: 14 }} />, label: 'Coding Help' },
  { icon: <BarChartIcon sx={{ fontSize: 14 }} />, label: 'Aptitude' },
];

const FAQS = [
  { q: 'Is NAVPRARAMBH free to use?', a: 'Yes! The currently available features—including career explorer, live opportunity listings, courses, and the SIDDHI companion—are free to use.' },
  { q: 'How does SIDDHI work?', a: 'SIDDHI is NAVPRARAMBH’s career companion. Connected responses use authenticated student context when available and are powered by Google Gemini; resume analysis and interview feedback remain informational and are not hiring decisions.' },
  { q: 'Can companies post jobs on NAVPRARAMBH?', a: 'The current student experience is focused on discovering opportunities. Company and recruiter tools are coming soon.' },
  { q: 'Is NAVPRARAMBH only for engineering students?', a: 'No! NAVPRARAMBH’s career catalog is designed to include business, arts, healthcare, government, law, hospitality, and other paths for Indian students.' },
  { q: 'How are certifications verified?', a: 'Certification records are shown from the available NAVPRARAMBH catalog or your authenticated profile. Verification status is displayed only when it is present in the stored record.' }, 
  { q: 'Does NAVPRARAMBH support regional languages?', a: 'Language options are available in Settings when supported by the current interface.' },
];

// ─── SIDDHI AI COMPANION PANEL (compact, right-docked) ────────────
// Retained for compatibility with the existing landing-page module; the live public entry is SiddhiAI in App.tsx.
function SiddhiPanel() {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Namaste! I\'m SIDDHI AI, your NAVPRARAMBH Career Companion. Powered by Google Gemini.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const conversation = messages.map((message) => ({ role: message.role === 'ai' ? 'assistant' as const : 'user' as const, text: message.text }));
    setMessages(p => [...p, { role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    const response = await askSiddhi(trimmed, conversation);
    setTyping(false);
    setMessages(p => [...p, { role: 'ai', text: response.text }]);
  };

  return (
    <Box sx={{
      borderRadius: 4, overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(11,25,87,0.12)',
      border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(16px)',
    }}>
      {/* Header */}
      <Box sx={{ p: 1.5, background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box className="pulse-glow" sx={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <SmartToyIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: '#fff', fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 13, lineHeight: 1.1 }}>✨ SIDDHI AI</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: C.emerald }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"Outfit",sans-serif' }}>Powered by Google Gemini</Typography>
          </Box>
        </Box>
        <Chip label="Local" size="small" sx={{ background: 'rgba(255,106,0,0.2)', color: C.golden, fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 9, height: 18 }} />
      </Box>

      {/* Messages */}
      <Box sx={{ p: 1.5, background: '#FAFAF8', height: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((msg, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 0.5 }}>
            {msg.role === 'ai' && (
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2 }}>
                <AutoAwesomeIcon sx={{ fontSize: 11, color: '#fff' }} />
              </Box>
            )}
            <Box sx={{
              maxWidth: '82%', p: '8px 12px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg,#0B1957,#1A2E7E)' : '#fff',
              border: msg.role === 'ai' ? '1px solid rgba(11,25,87,0.06)' : 'none',
            }}>
              <Typography sx={{ fontSize: 12, color: msg.role === 'user' ? '#fff' : C.navy, fontFamily: '"Outfit",sans-serif', lineHeight: 1.4 }}>{msg.text}</Typography>
            </Box>
          </Box>
        ))}
        {typing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 11, color: '#fff' }} />
            </Box>
            <Box sx={{ p: '8px 14px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: '1px solid rgba(11,25,87,0.08)', display: 'flex', gap: 0.5 }}>
              {[0, 1, 2].map(i => <Box key={i} className="ai-dot" sx={{ width: 5, height: 5, borderRadius: '50%', background: C.saffron }} />)}
            </Box>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Quick prompts */}
      <Box sx={{ px: 1, py: 1, display: 'flex', gap: 0.4, flexWrap: 'wrap', borderTop: '1px solid rgba(11,25,87,0.06)' }}>
        {SIDDHI_CAPABILITIES.map(cap => (
          <Chip key={cap.label} icon={cap.icon} label={cap.label} size="small" sx={{ fontSize: 9, height: 20, fontFamily: '"Outfit",sans-serif', background: 'rgba(11,25,87,0.04)', color: C.navy, '& .MuiChip-icon': { color: C.saffron, fontSize: 12 }, cursor: 'pointer', '&:hover': { background: 'rgba(255,106,0,0.08)' } }} onClick={() => send(cap.label)} />
        ))}
      </Box>

      {/* Input */}
      <Box sx={{ p: 1, display: 'flex', gap: 0.5, alignItems: 'flex-end', borderTop: '1px solid rgba(11,25,87,0.06)' }}>
        <TextField
          fullWidth maxRows={2}
          placeholder="Ask SIDDHI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 12, fontFamily: '"Outfit",sans-serif', background: 'rgba(11,25,87,0.04)' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(11,25,87,0.12)' } }}
        />
        <IconButton onClick={() => void send(input)} disabled={!input.trim() || typing} sx={{ background: input.trim() ? 'linear-gradient(135deg,#FF6A00,#F5B800)' : 'rgba(11,25,87,0.06)', color: input.trim() ? '#fff' : 'rgba(11,25,87,0.25)', borderRadius: 2, '&:hover': { background: input.trim() ? 'linear-gradient(135deg,#FF8C40,#F5C800)' : undefined } }}>
          <SendIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

// This legacy local panel is retained as source history; the public app renders the single SiddhiAI experience from App.tsx.
void SiddhiPanel;

// ─── LIVE CONTENT CARD ───────────────────────────────────────────
function LiveCard({ children, label, labelColor, onSeeAll }: { children: React.ReactNode; label: string; labelColor: string; onSeeAll?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip label={label} sx={{ background: `${labelColor}12`, color: labelColor, fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 11 }} />
          {onSeeAll && <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />} onClick={onSeeAll} sx={{ color: labelColor, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 12, textTransform: 'none' }}>See all</Button>}
        </Box>
        {children}
      </Box>
    </motion.div>
  );
}

// ─── JOB CARD ────────────────────────────────────────────────────
function JobCard({ job, companyName }: { job: Job; companyName: string }) {
  const navigate = useNavigate();
  const modeColor = job.mode === 'remote' ? C.emerald : job.mode === 'hybrid' ? C.saffron : C.navy;
  return (
    <motion.div whileHover={{ y: -4, transition: { duration: 0.3 } }} whileTap={{ scale: 0.98 }}>
      <Card className="card-lift" onClick={() => navigate('/jobs')} sx={{ background: '#fff', borderRadius: 3, border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', fontFamily: '"Outfit",sans-serif', fontWeight: 700, width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>{companyName.charAt(0)}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.2 }}>{job.title}</Typography>
            <Typography sx={{ fontSize: 12, color: '#666', fontFamily: '"Outfit",sans-serif' }}>{companyName} · {job.location || 'Location not specified'}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip label={job.mode} size="small" sx={{ fontSize: 9, height: 18, background: `${modeColor}12`, color: modeColor, fontFamily: '"Outfit",sans-serif', textTransform: 'capitalize' }} />
              {job.salary_min && job.salary_max && (
                <Typography sx={{ fontSize: 11, color: C.saffron, fontFamily: '"Outfit",sans-serif', fontWeight: 700, alignSelf: 'center' }}>₹{job.salary_min}–{job.salary_max} LPA</Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── INTERNSHIP CARD ─────────────────────────────────────────────
function InternshipCard({ intern, companyName }: { intern: Internship; companyName: string }) {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -4, transition: { duration: 0.3 } }} whileTap={{ scale: 0.98 }}>
      <Card className="card-lift" onClick={() => navigate('/internships')} sx={{ background: '#fff', borderRadius: 3, border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(10,155,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WorkIcon sx={{ color: C.emerald, fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.2 }}>{intern.title}</Typography>
            <Typography sx={{ fontSize: 12, color: '#666', fontFamily: '"Outfit",sans-serif' }}>{companyName} · {intern.duration_months ? `${intern.duration_months} mo` : 'Duration not specified'}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip label={intern.mode} size="small" sx={{ fontSize: 9, height: 18, background: 'rgba(10,155,92,0.08)', color: C.emerald, fontFamily: '"Outfit",sans-serif', textTransform: 'capitalize' }} />
              {intern.stipend_monthly && (
                <Typography sx={{ fontSize: 11, color: C.emerald, fontFamily: '"Outfit",sans-serif', fontWeight: 700, alignSelf: 'center' }}>₹{(Number(intern.stipend_monthly) / 1000).toFixed(0)}K/mo</Typography>
              )}
              {intern.has_ppo && <Chip label="PPO" size="small" sx={{ fontSize: 9, height: 18, background: 'rgba(245,184,0,0.1)', color: '#8B6000', fontFamily: '"Outfit",sans-serif', fontWeight: 700 }} />}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── COURSE CARD ─────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate();
  const levelColor = course.level === 'beginner' ? C.emerald : course.level === 'intermediate' ? C.saffron : C.navy;
  return (
    <motion.div whileHover={{ y: -4, transition: { duration: 0.3 } }} whileTap={{ scale: 0.98 }}>
      <Card className="card-lift" onClick={() => navigate('/courses')} sx={{ background: '#fff', borderRadius: 3, border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: 5, background: `linear-gradient(180deg,${levelColor},${levelColor}99)` }} />
          <CardContent sx={{ p: 2.5, flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Chip label={course.category || 'General'} size="small" sx={{ fontSize: 10, background: `${levelColor}12`, color: levelColor, fontFamily: '"Outfit",sans-serif' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <StarIcon sx={{ fontSize: 13, color: C.golden }} />
                <Typography sx={{ fontSize: 12, fontFamily: '"Outfit",sans-serif', fontWeight: 600, color: C.navy }}>{Number(course.rating).toFixed(1)}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy }}>{course.title}</Typography>
            <Typography sx={{ fontSize: 11, color: '#888', fontFamily: '"Outfit",sans-serif' }}>{course.instructor || 'Instructor not specified'}</Typography>
          </CardContent>
        </Box>
      </Card>
    </motion.div>
  );
}

function PmInternshipPreparation() {
  const inputs = ['Student profile', 'Resume and skills', 'Academic background', 'Interests and preferences', 'Location'];
  return (
    <Box component="section" aria-labelledby="pm-internship-heading" sx={{ py: { xs: 7, md: 9 }, background: '#F8FBFF' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 6 } }}>
        <Card sx={{ borderRadius: 5, border: '1px solid rgba(11,25,87,0.08)', boxShadow: '0 12px 40px rgba(11,25,87,0.06)' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, md: 3 }, mb: 2.5 }}>
              <Box
                component="img"
                src="/pm-emblem.png"
                alt="Government emblem for PM Internship Scheme context"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
                sx={{ width: { xs: 58, sm: 72, md: 88 }, height: { xs: 88, sm: 108, md: 132 }, maxWidth: '100%', objectFit: 'contain', objectPosition: 'top center', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Chip label="PM Internship Scheme · Coming Soon" sx={{ mb: 1.5, color: C.navy, background: 'rgba(11,25,87,0.06)', fontWeight: 700 }} />
                <Typography id="pm-internship-heading" variant="h3" sx={{ color: C.navy, fontSize: { xs: 24, md: 34 }, mb: 1.5 }}>AI-Powered Smart Internship Recommendation Engine</Typography>
              </Box>
              <Box
                component="img"
                src="/pm-photo.png"
                alt="Prime Minister of India"
                sx={{ display: { xs: 'none', sm: 'block' }, width: { sm: 120, md: 160 }, height: { sm: 86, md: 114 }, maxWidth: '28%', objectFit: 'contain', objectPosition: 'center', flexShrink: 0, borderRadius: 2 }}
              />
            </Box>
            <Typography sx={{ color: '#555', maxWidth: 760, lineHeight: 1.75, mb: 2 }}>A future-ready product boundary for explainable internship matching. The current application does not yet generate match scores or PM Internship Scheme recommendations.</Typography>
            <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 14, mb: 1 }}>Reference initiative</Typography>
            <Typography sx={{ color: '#777', fontSize: 13, mb: 3 }}>Challenge aligned with the Ministry of Corporate Affairs · Government of India. NAVPRARAMBH does not claim official affiliation, endorsement, or authorization.</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {inputs.map((input) => <Chip key={input} label={input} variant="outlined" sx={{ borderColor: 'rgba(11,25,87,0.16)', color: C.navy }} />)}
            </Box>
            <Box sx={{ borderRadius: 3, background: 'rgba(11,25,87,0.04)', p: { xs: 2, md: 3 } }}>
              <Typography sx={{ color: C.navy, fontWeight: 700, mb: 1 }}>Planned architecture boundary</Typography>
              <Typography sx={{ color: '#555', fontSize: 14, lineHeight: 1.7 }}>Profile inputs → future matching engine → match score with explanation → personalized internship recommendations.</Typography>
              <Typography sx={{ color: C.saffron, fontWeight: 700, fontSize: 13, mt: 1.5 }}>Content-based, collaborative, hybrid, NLP, embeddings, career prediction, sentiment, and explainability: Coming Soon.</Typography>
            </Box>
            <Box sx={{ mt: 3, border: '1px dashed rgba(11,25,87,0.22)', borderRadius: 3, p: 2, textAlign: 'center' }}>
              <Typography sx={{ color: '#777', fontSize: 13 }}>Government visuals shown for PM Internship Scheme challenge context. NAVPRARAMBH does not claim official affiliation, endorsement, or authorization.</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'learning' | 'community'>('opportunities');

  // Real data from Supabase
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [companyMap, setCompanyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    (async () => {
      try {
        const [jobsRes, internRes, coursesRes, careersRes, companiesRes] = await Promise.all([
          supabase.from('jobs').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
          supabase.from('internships').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
          supabase.from('courses').select('*').order('rating', { ascending: false }).limit(6),
          supabase.from('careers').select('*').order('title').limit(12),
          supabase.from('companies').select('id, name'),
        ]);
        const cMap: Record<string, string> = {};
        (companiesRes.data || []).forEach(c => { cMap[c.id] = c.name; });
        setCompanyMap(cMap);
        setJobs(jobsRes.data || []);
        setInternships(internRes.data || []);
        setCourses(coursesRes.data || []);
        setCareers(careersRes.data || []);
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ background: '#FFFDF8', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC SUNRISE HERO — NAVPRARAMBH IS THE FOCAL POINT
      ══════════════════════════════════════════════════════════════ */}
      <Box id="home-hero" sx={{
        position: 'relative', overflow: 'hidden',
        scrollMarginTop: { xs: 64, md: 72 },
        background: 'linear-gradient(135deg,#F7F4FF 0%,#FFFFFF 58%,#FFF8EE 100%)',
        minHeight: { xs: 420, md: 480 },
        pt: { xs: 5, md: 7 }, pb: { xs: 4, md: 5 },
      }}>

        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* ── Left 70%: NAVPRARAMBH as the main focal point ── */}
            <Grid size={{ xs: 12, md: 10 }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={heroVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Box sx={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(30px)', transition: 'all 0.9s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, duration: 0.6 }}>
                    <Chip
                      icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                      label="A practical career operating system for Indian students"
                      sx={{
                        mb: 3, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 12,
                        background: 'rgba(255,255,255,0.7)', color: C.navy,
                        border: '1px solid rgba(11,25,87,0.1)', letterSpacing: 0.5,
                        '& .MuiChip-icon': { color: C.saffron },
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </motion.div>

                  {/* NAVPRARAMBH — Clean tricolor (saffron / navy / green) */}
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.8 }}>
                    <Typography className="tricolor-title" sx={{
                      fontFamily: '"Cinzel",serif', fontWeight: 900,
                      fontSize: { xs: 32, sm: 48, md: 58, lg: 66 },
                      lineHeight: 1, mb: 0.5,
                      letterSpacing: { xs: 1, md: 2 },
                      display: 'block',
                      width: '100%',
                    }}>NAVPRARAMBH</Typography>
                  </motion.div>

                  {/* Sanskrit subtitle */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.7 }}>
                    <Typography sx={{
                      fontFamily: '"Fraunces",serif', fontStyle: 'italic',
                      fontSize: { xs: 20, md: 28 },
                      color: C.navy, mb: 2, fontWeight: 600,
                      opacity: 0.85,
                    }}>
                      नवप्रारंभ
                    </Typography>
                  </motion.div>

                  {/* Tagline with shimmer */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4, duration: 0.8 }}>
                    <Typography className="shimmer-text" sx={{
                      fontFamily: '"Fraunces",serif', fontWeight: 800,
                      fontSize: { xs: 24, sm: 32, md: 36 },
                      lineHeight: 1.15, mb: 1.5,
                    }}>
                      Rise Like the Sun
                    </Typography>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={heroVisible ? { opacity: 1 } : {}} transition={{ delay: 0.5, duration: 0.8 }}>
                    <Typography sx={{
                      fontFamily: '"Outfit",sans-serif', fontWeight: 500,
                      fontSize: { xs: 15, md: 17 },
                      color: C.navy, opacity: 0.7, lineHeight: 1.7, mb: 4, maxWidth: 480,
                    }}>
                      A practical career companion for learning, preparation, and growth.
                    </Typography>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 0.7 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button className="btn-gradient" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/careers')} sx={{ color: '#fff', px: 4, py: 1.5, fontSize: 15, borderRadius: 14 }}>
                        Explore Careers
                      </Button>
                      <Button variant="outlined" size="large" endIcon={<PlayArrowIcon />} onClick={() => navigate('/dashboard')} sx={{ borderColor: C.navy, color: C.navy, px: 3.5, py: 1.5, fontSize: 15, borderRadius: 14, '&:hover': { borderColor: C.saffron, background: 'rgba(255,106,0,0.05)' } }}>
                        View Dashboard
                      </Button>
                    </Box>
                  </motion.div>

                  {/* Trust badges */}
                  <motion.div initial={{ opacity: 0 }} animate={heroVisible ? { opacity: 1 } : {}} transition={{ delay: 0.7, duration: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 4, flexWrap: 'wrap' }}>
                      {['Free to Start', 'Structured guidance', 'Live catalog', 'Regional language support · Coming Soon'].map((badge, i) => (
                        <motion.div key={badge} initial={{ opacity: 0, x: -10 }} animate={heroVisible ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 15, color: C.emerald }} />
                            <Typography sx={{ fontSize: 13, color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 500, opacity: 0.8 }}>{badge}</Typography>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>


          </Grid>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          TRENDING SKILLS MARQUEE
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: 3, background: '#fff', borderBottom: '1px solid rgba(11,25,87,0.06)' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Typography sx={{ fontSize: 11, color: '#999', fontFamily: '"Outfit",sans-serif', letterSpacing: 1.5, mb: 1.5, textAlign: 'center' }}>TRENDING SKILLS</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {TRENDING_SKILLS.map((skill, i) => (
              <motion.div key={skill} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                <Chip label={skill} sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 500, fontSize: 13, background: 'rgba(11,25,87,0.04)', color: C.navy, border: '1px solid rgba(11,25,87,0.06)', '&:hover': { background: 'rgba(255,106,0,0.08)', color: C.saffron, cursor: 'pointer' } }} />
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          LIVE CONTENT TABS
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: 'linear-gradient(180deg,#FFFDF8 0%,#FFF8F0 100%)' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 } }}>
          {/* Tab switcher */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 5 }}>
              {[
                { key: 'opportunities' as const, label: 'Opportunities' },
                { key: 'learning' as const, label: 'Learning' },
                { key: 'community' as const, label: 'Community' },
              ].map(tab => (
                <motion.div key={tab.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setActiveTab(tab.key)} sx={{
                    borderRadius: 12, px: 3, py: 1.2, fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14,
                    background: activeTab === tab.key ? 'linear-gradient(135deg,#0B1957,#1A2E7E)' : 'rgba(11,25,87,0.05)',
                    color: activeTab === tab.key ? '#fff' : C.navy,
                    border: `1px solid ${activeTab === tab.key ? 'transparent' : 'rgba(11,25,87,0.1)'}`,
                    transition: 'all 0.3s',
                  }}>
                    {tab.label}
                  </Button>
                </motion.div>
              ))}
            </Box>
          </motion.div>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: C.saffron }} />
            </Box>
          )}

          {/* ── OPPORTUNITIES TAB ── */}
          {!loading && activeTab === 'opportunities' && (
            <motion.div className="slide-up" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <Grid container spacing={4}>
                {/* Latest Jobs */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LiveCard label="Latest Jobs" labelColor={C.navy} onSeeAll={() => navigate('/jobs')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {jobs.length > 0 ? jobs.slice(0, 3).map((job, i) => (
                        <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                          <JobCard job={job} companyName={job.company_id ? companyMap[job.company_id] || 'Company' : 'Company'} />
                        </motion.div>
                      )) : (
                        <Typography sx={{ color: '#999', fontSize: 14, fontFamily: '"Outfit",sans-serif', textAlign: 'center', py: 3 }}>No jobs available yet.</Typography>
                      )}
                    </Box>
                  </LiveCard>
                </Grid>

                {/* Latest Internships */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LiveCard label="Latest Internships" labelColor={C.emerald} onSeeAll={() => navigate('/internships')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {internships.length > 0 ? internships.slice(0, 4).map((intern, i) => (
                        <motion.div key={intern.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                          <InternshipCard intern={intern} companyName={intern.company_id ? companyMap[intern.company_id] || 'Company' : 'Company'} />
                        </motion.div>
                      )) : (
                        <Typography sx={{ color: '#999', fontSize: 14, fontFamily: '"Outfit",sans-serif', textAlign: 'center', py: 3 }}>No internships available yet.</Typography>
                      )}
                    </Box>
                  </LiveCard>
                </Grid>

                {/* Government Jobs */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LiveCard label="Government Jobs" labelColor="#607D8B" onSeeAll={() => navigate('/jobs')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {GOVT_JOBS.length === 0 ? <Typography sx={{ color: '#999', fontSize: 14, textAlign: 'center', py: 3 }}>Verified government opportunities will appear here when available.</Typography> : GOVT_JOBS.map((job, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                          <Card className="card-lift" sx={{ background: '#fff', borderRadius: 3, border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer' }}>
                            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(96,125,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🏛️</Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.2 }}>{job.title}</Typography>
                                <Typography sx={{ fontSize: 12, color: '#666', fontFamily: '"Outfit",sans-serif' }}>{job.org} · {job.posts} posts</Typography>
                              </Box>
                              <Chip label={job.deadline} size="small" sx={{ fontSize: 10, background: 'rgba(231,76,60,0.08)', color: '#E74C3C', fontFamily: '"Outfit",sans-serif', fontWeight: 600 }} />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  </LiveCard>
                </Grid>

                {/* Hackathons */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LiveCard label="Upcoming Hackathons" labelColor="#9B59B6" onSeeAll={() => navigate('/games')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {HACKATHONS.map((hack, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                          <Card className="card-lift" sx={{ background: '#fff', borderRadius: 3, border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer' }}>
                            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(155,89,182,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🏆</Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.2 }}>{hack.title}</Typography>
                                <Typography sx={{ fontSize: 12, color: '#666', fontFamily: '"Outfit",sans-serif' }}>{hack.org} · {hack.participants} participating</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <Chip label={`Prize ${hack.prize}`} size="small" sx={{ fontSize: 9, height: 18, background: 'rgba(155,89,182,0.08)', color: '#9B59B6', fontFamily: '"Outfit",sans-serif', fontWeight: 700 }} />
                                  <Chip label={`Deadline ${hack.deadline}`} size="small" sx={{ fontSize: 9, height: 18, background: 'rgba(231,76,60,0.08)', color: '#E74C3C', fontFamily: '"Outfit",sans-serif' }} />
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  </LiveCard>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* ── LEARNING TAB ── */}
          {!loading && activeTab === 'learning' && (
            <motion.div className="slide-up" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <Grid container spacing={4}>
                {/* Trending Courses */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LiveCard label="Trending Courses" labelColor={C.sky} onSeeAll={() => navigate('/courses')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {courses.length > 0 ? courses.slice(0, 4).map((course, i) => (
                        <motion.div key={course.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                          <CourseCard course={course} />
                        </motion.div>
                      )) : (
                        <Typography sx={{ color: '#999', fontSize: 14, fontFamily: '"Outfit",sans-serif', textAlign: 'center', py: 3 }}>No courses available yet.</Typography>
                      )}
                    </Box>
                  </LiveCard>
                </Grid>

                {/* Scholarships */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <LiveCard label="Scholarships" labelColor={C.golden} onSeeAll={() => navigate('/courses')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {SCHOLARSHIPS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
                          <Card className="card-lift" sx={{ background: '#fff', borderRadius: 3, border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer' }}>
                            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(245,184,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🎓</Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.2 }}>{s.title}</Typography>
                                <Typography sx={{ fontSize: 12, color: '#666', fontFamily: '"Outfit",sans-serif' }}>{s.eligibility}</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <Chip label={s.amount} size="small" sx={{ fontSize: 9, height: 18, background: 'rgba(10,155,92,0.08)', color: C.emerald, fontFamily: '"Outfit",sans-serif', fontWeight: 700 }} />
                                  <Chip label={`Deadline ${s.deadline}`} size="small" sx={{ fontSize: 9, height: 18, background: 'rgba(231,76,60,0.08)', color: '#E74C3C', fontFamily: '"Outfit",sans-serif' }} />
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  </LiveCard>
                </Grid>

                {/* Career Paths */}
                <Grid size={{ xs: 12 }}>
                  <LiveCard label="Career Paths" labelColor={C.navy} onSeeAll={() => navigate('/careers')}>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {careers.map((career, i) => (
                        <motion.div key={career.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.3 }}>
                          <Chip
                            label={`${career.emoji || '🎯'} ${career.title}`}
                            onClick={() => navigate('/careers')}
                            sx={{
                              fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13,
                              background: 'rgba(11,25,87,0.04)', color: C.navy,
                              border: '1px solid rgba(11,25,87,0.08)', py: 2.5, px: 1,
                              '&:hover': { background: 'rgba(255,106,0,0.08)', color: C.saffron, cursor: 'pointer' },
                            }}
                          />
                        </motion.div>
                      ))}
                    </Box>
                  </LiveCard>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* ── COMMUNITY TAB ── */}
          {!loading && activeTab === 'community' && (
            <motion.div className="slide-up" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <Typography variant="h3" sx={{ color: C.navy, fontSize: { xs: 24, md: 34 }, mb: 1 }}>A Community That Grows Together</Typography>
                  <Typography sx={{ color: '#555', fontFamily: '"Outfit",sans-serif', fontSize: 15, maxWidth: 480, mx: 'auto' }}>
                    Students, mentors, recruiters, companies, colleges, and alumni — all connected in one career-focused ecosystem.
                  </Typography>
                </motion.div>
              </Box>
              <Grid container spacing={3}>
                {COMMUNITY.map((member, i) => (
                  <Grid key={i} size={{ xs: 6, md: 2 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
                      <Box className="card-lift" sx={{ textAlign: 'center', p: 3, borderRadius: 4, background: '#fff', border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer' }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 2, background: `${member.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: member.color }}>
                          {member.icon}
                        </Box>
                        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 14, color: C.navy, mb: 0.5 }}>{member.label}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#888', fontFamily: '"Outfit",sans-serif', lineHeight: 1.5 }}>{member.desc}</Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}>
                <Box sx={{ mt: 4, p: 4, borderRadius: 4, background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', textAlign: 'center' }}>
                  <Typography sx={{ color: '#fff', fontFamily: '"Fraunces",serif', fontWeight: 700, fontSize: 20, mb: 1 }}>A focused space for career growth.</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Outfit",sans-serif', fontSize: 14, mb: 3 }}>
                    Follow · Connect · Message · Share Projects · Create Study Groups · Form Hackathon Teams
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontFamily: '"Outfit",sans-serif', fontSize: 13 }}>Community features · Coming Soon</Typography>
                </Box>
              </motion.div>
            </motion.div>
          )}
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#fff' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Chip label="Everything you need" sx={{ mb: 2, background: 'rgba(11,25,87,0.06)', color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 600 }} />
              <Typography variant="h3" sx={{ color: C.navy, mb: 2, fontSize: { xs: 28, md: 40 } }}>Explore NAVPRARAMBH</Typography>
              <Typography sx={{ color: '#555', maxWidth: 520, mx: 'auto', fontFamily: '"Outfit",sans-serif', fontSize: 16 }}>
                Explore, learn, and prepare using the features currently available in NAVPRARAMBH.
              </Typography>
            </motion.div>
          </Box>
          <Grid container spacing={3}>
            {[
              { icon: <MapIcon sx={{ fontSize: 28 }} />, title: 'Career Explorer', desc: 'Explore career paths available in the live catalog, with roadmap and market details where supplied.', path: '/careers', color: C.navy, bg: 'rgba(11,25,87,0.06)' },
              { icon: <SmartToyIcon sx={{ fontSize: 28 }} />, title: 'SIDDHI AI', desc: 'Your personal AI career mentor for resume reviews, mock interviews, and guidance.', path: null, color: C.saffron, bg: 'rgba(255,106,0,0.06)' },
              { icon: <WorkIcon sx={{ fontSize: 28 }} />, title: 'Jobs & Internships', desc: 'Browse available opportunities from the live catalog and review their supplied details.', path: '/jobs', color: C.emerald, bg: 'rgba(10,155,92,0.06)' },
              { icon: <SchoolIcon sx={{ fontSize: 28 }} />, title: 'Courses', desc: 'Structured learning paths across the categories available in the live course catalog.', path: '/courses', color: C.sky, bg: 'rgba(96,178,229,0.1)' },
              { icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />, title: 'Certifications', desc: 'Certification listings with provider details from the available catalog.', path: '/certifications', color: C.golden, bg: 'rgba(245,184,0,0.08)' },
              { icon: <SportsEsportsIcon sx={{ fontSize: 28 }} />, title: 'Knowledge Games', desc: 'Learn through play — Career Escape, SQL Detective, Python Quest and more.', path: '/games', color: '#9B59B6', bg: 'rgba(155,89,182,0.06)' },
            ].map((f, i) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card className="card-lift feature-card" onClick={() => f.path && navigate(f.path)} sx={{ cursor: f.path ? 'pointer' : 'default', height: '100%', background: '#fff', border: '1px solid rgba(11,25,87,0.06)', borderRadius: 4, p: 0.5 }}>
                    <CardContent sx={{ p: 3.5 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 3, mb: 2.5, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color }}>{f.icon}</Box>
                      <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 17, color: C.navy, mb: 1 }}>{f.title}</Typography>
                      <Typography sx={{ color: '#666', fontSize: 14, fontFamily: '"Outfit",sans-serif', lineHeight: 1.7 }}>{f.desc}</Typography>
                      {f.path && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2.5, color: f.color }}><Typography sx={{ fontSize: 13, fontFamily: '"Outfit",sans-serif', fontWeight: 600 }}>Explore</Typography><ArrowForwardIcon sx={{ fontSize: 14 }} /></Box>}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <PmInternshipPreparation />

      {/* ══════════════════════════════════════════════════════════════
          CAREER ROADMAP CTA
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: 'linear-gradient(180deg,#FFF8F0 0%,#FFFDF8 100%)' }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Box sx={{ borderRadius: 6, background: 'linear-gradient(135deg,#0B1957 0%,#1A2E7E 60%,#0B1957 100%)', p: { xs: 5, md: 8 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,184,0,0.1) 0%,transparent 65%)' }} />
              <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,155,92,0.08) 0%,transparent 65%)' }} />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <LightbulbIcon sx={{ fontSize: 48, color: C.golden, mb: 2 }} />
              </motion.div>
              <Typography variant="h3" sx={{ color: '#fff', mb: 2, fontSize: { xs: 24, md: 36 } }}>Discover Your Career Roadmap</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Outfit",sans-serif', fontSize: 16, mb: 4, maxWidth: 560, mx: 'auto' }}>Career roadmaps with step-by-step milestones, skills, projects, and timelines where available.</Typography>
              <Button className="btn-gradient" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/careers')} sx={{ color: '#fff', px: 5, py: 1.5, borderRadius: 14, fontSize: 15 }}>Explore Career Paths</Button>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: '#fff' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Typography variant="h3" sx={{ color: C.navy, fontSize: { xs: 26, md: 36 } }}>Frequently Asked Questions</Typography>
            </motion.div>
          </Box>
          {FAQS.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <Accordion elevation={0} sx={{ mb: 1.5, border: '1px solid rgba(11,25,87,0.07)', borderRadius: '16px !important', '&:before': { display: 'none' }, '&.Mui-expanded': { border: '1px solid rgba(11,25,87,0.14)' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: C.saffron }} />} sx={{ px: 3, py: 1 }}>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, color: C.navy, fontSize: 15 }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontSize: 14, color: '#555', lineHeight: 1.8 }}>{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ background: 'linear-gradient(180deg,#0B1957 0%,#060E38 100%)', color: '#fff', pt: { xs: 8, md: 10 }, pb: 5 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 } }}>
          <Grid container spacing={5} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: 18 }}>N</Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: 18, letterSpacing: 1.5 }}>NAVPRARAMBH</Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: '"Outfit",sans-serif', lineHeight: 1.8, mb: 3 }}>A practical career platform for Indian students. Rise like the sun.</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: '"Fraunces",serif', fontStyle: 'italic' }}>नवप्रारंभ — A New Beginning</Typography>
              <Box component="section" aria-labelledby="project-contact-heading" sx={{ mt: 2 }}>
                <Typography id="project-contact-heading" sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontFamily: '"Outfit",sans-serif', fontWeight: 600, mb: 0.5 }}>
                  Contact us · Support · Feedback
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: '"Outfit",sans-serif' }}>
                  Project and contest communication:{' '}
                  <Box component="a" href="mailto:navprarambh.team@gmail.com" aria-label="Email NAVPRARAMBH project support" sx={{ color: C.golden, textDecoration: 'none', overflowWrap: 'anywhere', '&:hover': { textDecoration: 'underline' } }}>
                    navprarambh.team@gmail.com
                  </Box>
                </Typography>
              </Box>
            </Grid>
            {[
              { title: 'Explore', links: ['Career Explorer', 'Jobs', 'Internships', 'Courses', 'Certifications'] },
              { title: 'Platform', links: ['Dashboard', 'Placement Prep', 'Knowledge Games', 'Company Portal', 'College Portal'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'] },
            ].map(col => (
              <Grid key={col.title} size={{ xs: 6, md: 2.67 }}>
                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, mb: 2.5, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{col.title}</Typography>
                {col.links.map(link => {
                  const path = FOOTER_PATHS[link];
                  return path ? (
                    <Typography key={link} component="button" onClick={() => navigate(path)} sx={{ display: 'block', border: 0, background: 'none', p: 0, color: 'rgba(255,255,255,0.45)', fontSize: 13, fontFamily: '"Outfit",sans-serif', mb: 1.2, cursor: 'pointer', textAlign: 'left', '&:hover': { color: C.golden }, transition: 'color 0.2s' }}>{link}</Typography>
                  ) : (
                    <Typography key={link} sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: '"Outfit",sans-serif', mb: 1.2 }}>{link} <span style={{ fontSize: 10 }}>(Coming Soon)</span></Typography>
                  );
                })}
              </Grid>
            ))}
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: '"Outfit",sans-serif' }}>© 2025 NAVPRARAMBH. Crafted with ♥ for India.</Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {['EN', 'HI', 'TE', 'TA'].map(lang => <Chip key={lang} label={`${lang} · Coming Soon`} size="small" sx={{ fontSize: 10, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: '"Outfit",sans-serif' }} />)}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

