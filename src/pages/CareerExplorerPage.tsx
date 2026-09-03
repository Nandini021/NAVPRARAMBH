import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import InputAdornment from '@mui/material/InputAdornment';
import { useAuth } from '../auth/AuthProvider';
import { getCareers, getSavedCareerIds, toggleSavedCareer } from '../lib/db';
import type { Career } from '../lib/supabase';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

export default function CareerExplorerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadCareers = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getCareers(), user ? getSavedCareerIds(user.id) : Promise.resolve([])])
      .then(([items, savedIds]) => { setCareers(items); setSaved(new Set(savedIds)); })
      .catch(() => setError('Unable to load career paths right now.'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadCareers(); }, [loadCareers]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(careers.map((item) => item.category).filter(Boolean) as string[]))], [careers]);
  const filtered = useMemo(() => careers.filter((career) => (category === 'All' || career.category === category) && `${career.title} ${career.category ?? ''} ${career.description ?? ''} ${career.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [careers, category, search]);

  const toggleCareerSave = async (careerId: string) => {
    if (!user) { navigate('/login'); return; }
    try {
      const next = await toggleSavedCareer(careerId);
      setSaved((current) => {
        const result = new Set(current);
        if (next) result.add(careerId); else result.delete(careerId);
        return result;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save this career.');
    }
  };

  const save = async () => {
    if (!selected || !user) { navigate('/login'); return; }
    setSaving(true); setError(null);
    try {
      const next = await toggleSavedCareer(selected.id);
      setSaved((current) => {
        const result = new Set(current);
        if (next) result.add(selected.id); else result.delete(selected.id);
        return result;
      });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save this career.'); }
    finally { setSaving(false); }
  };

  const startPath = async () => {
    if (!selected || !user) { navigate('/login'); return; }
    setStarting(true); setError(null); setMessage(null);
    try {
      const { data, error: insertError } = await (await import('../lib/supabase')).supabase.from('roadmaps').insert({ user_id: user.id, career_id: selected.id, title: selected.title, steps: selected.roadmap_steps.map((step) => ({ title: step, completed: false })), progress: 0 }).select('id').single();
      if (insertError) throw insertError;
      setMessage('Your career path is ready in your journey.');
      navigate(`/student-dashboard?roadmap=${data.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to start this career path.'); }
    finally { setStarting(false); }
  };

  return <Box sx={{ background: '#FFFDF8', minHeight: '100vh' }}>
    <Box sx={{ background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', py: { xs: 6, md: 8 }, px: 3, textAlign: 'center' }}>
      <Chip label="Real Supabase career catalog" sx={{ mb: 2, background: 'rgba(245,184,0,.15)', color: C.golden }} />
      <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 44 }, mb: 2 }}>Explore Your Career Path</Typography>
      <Typography sx={{ color: 'rgba(255,255,255,.7)', maxWidth: 560, mx: 'auto', mb: 3 }}>Compare skills and available career information, then save or start a path from the live catalog.</Typography>
      <TextField fullWidth value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search careers, skills, or fields" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,.6)' }} /></InputAdornment> }} sx={{ maxWidth: 560, '& .MuiOutlinedInput-root': { color: '#fff', borderRadius: 3, background: 'rgba(255,255,255,.1)', '& fieldset': { borderColor: 'rgba(255,255,255,.25)' } }, '& input::placeholder': { color: 'rgba(255,255,255,.55)' } }} />
    </Box>
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>{categories.map((item) => <Chip key={item} label={item} onClick={() => setCategory(item)} sx={{ cursor: 'pointer', background: category === item ? C.navy : 'rgba(11,25,87,.05)', color: category === item ? '#fff' : C.navy }} />)}</Box>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : filtered.length === 0 ? <Typography sx={{ textAlign: 'center', py: 8, color: '#777' }}>No live career paths match your search.</Typography> : <Grid container spacing={3}>{filtered.map((career) => <Grid key={career.id} size={{ xs: 12, sm: 6, md: 4 }}><Card className="card-lift" onClick={() => setSelected(career)} sx={{ cursor: 'pointer', height: '100%', border: '1px solid rgba(11,25,87,.08)' }}><CardContent sx={{ p: 3 }}><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontSize: 36 }}>{career.emoji ?? '🎯'}</Typography><IconButton onClick={(event) => { event.stopPropagation(); void toggleCareerSave(career.id); }} aria-label="Save career">{saved.has(career.id) ? <BookmarkIcon sx={{ color: C.saffron }} /> : <BookmarkBorderIcon />}</IconButton></Box><Typography sx={{ fontWeight: 700, color: C.navy, fontSize: 17, mt: 1 }}>{career.title}</Typography><Typography sx={{ color: '#777', fontSize: 13, mb: 2 }}>{career.category ?? 'Career path'}</Typography><Typography sx={{ color: '#666', fontSize: 13, lineHeight: 1.6, mb: 2 }}>{career.description ?? 'Details are provided by the career catalog.'}</Typography><Box sx={{ display: 'flex', gap: .5, flexWrap: 'wrap' }}>{career.skills.slice(0, 4).map((skill) => <Chip key={skill} label={skill} size="small" />)}</Box></CardContent></Card></Grid>)}</Grid>}
    </Box>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogContent sx={{ p: 0 }}>{selected && <><Box sx={{ p: 3, background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', color: '#fff' }}><IconButton onClick={() => setSelected(null)} sx={{ float: 'right', color: '#fff' }}><CloseIcon /></IconButton><Typography sx={{ fontSize: 44 }}>{selected.emoji ?? '🎯'}</Typography><Typography sx={{ fontSize: 24, fontWeight: 700 }}>{selected.title}</Typography><Typography sx={{ opacity: .7 }}>{selected.category ?? 'Career path'}</Typography></Box><Box sx={{ p: 3 }}>{selected.description && <Typography sx={{ color: '#555', mb: 3 }}>{selected.description}</Typography>}<Typography sx={{ fontWeight: 700, color: C.navy, mb: 1 }}>Catalog skills</Typography><Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>{selected.skills.map((skill) => <Chip key={skill} label={skill} />)}</Box>{(selected.salary_min !== null || selected.salary_max !== null) && <Typography sx={{ color: C.emerald, mb: 2 }}>Salary data in catalog: ₹{selected.salary_min ?? '—'}–{selected.salary_max ?? '—'} LPA</Typography>}{selected.growth && <Typography sx={{ color: '#666', mb: 2 }}>Catalog growth information: {selected.growth}</Typography>}<Box sx={{ display: 'flex', gap: 1 }}><Button onClick={() => void save()} disabled={saving} startIcon={saved.has(selected.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />} variant="outlined">{saved.has(selected.id) ? 'Saved' : 'Save career'}</Button><Button onClick={() => void startPath()} disabled={starting} endIcon={<ArrowForwardIcon />} variant="contained" sx={{ background: C.saffron }}>{starting ? 'Starting…' : 'Start this path'}</Button></Box></Box></>}</DialogContent></Dialog>
  </Box>;
}
