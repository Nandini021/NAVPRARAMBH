import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InputAdornment from '@mui/material/InputAdornment';
import { getJobs, getStudentBookmarks, toggleBookmark } from '../lib/db';
import { useAuth } from '../auth/AuthProvider';
import type { Job } from '../lib/supabase';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };
const EXTERNAL_JOB_SOURCES = [
  ['National Career Service', 'https://www.ncs.gov.in/'],
  ['RemoteOK', 'https://remoteok.com/'],
  ['data.gov.in', 'https://www.data.gov.in/'],
] as const;

export default function JobsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [mode, setMode] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getJobs(), user ? getStudentBookmarks(user.id) : Promise.resolve([])])
      .then(([nextJobs, bookmarks]) => {
        if (!mounted) return;
        setJobs(nextJobs);
        setSaved(new Set(bookmarks.filter((b) => b.job_id).map((b) => b.job_id as string)));
      })
      .catch(() => { if (mounted) setError('Unable to load jobs right now.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const text = `${job.title} ${job.description ?? ''} ${job.company?.name ?? ''} ${job.skills.join(' ')}`.toLowerCase();
    return (mode === 'All' || job.mode === mode.toLowerCase())
      && (jobType === 'All' || job.type === jobType)
      && (category === 'All' || job.category === category)
      && text.includes(search.toLowerCase());
  }), [jobs, mode, jobType, category, search]);

  const bookmark = async (jobId: string) => {
    setBusyId(jobId); setError(null);
    try {
      const isSaved = await toggleBookmark({ jobId });
      setSaved((current) => {
        const next = new Set(current);
        if (isSaved) next.add(jobId); else next.delete(jobId);
        return next;
      });
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update bookmark.'); }
    finally { setBusyId(null); }
  };

  return (
    <Box sx={{ background: '#FFFDF8', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg,#0B1957 0%,#1A2E7E 100%)', py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 44 }, mb: 2 }}>Find Your Dream Job</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mb: 4 }}>Curated opportunities from the real NAVPRARAMBH catalog.</Typography>
          <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, companies, skills..." InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} /></InputAdornment> }} sx={{ maxWidth: 600, width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 14, background: 'rgba(255,255,255,0.1)', color: '#fff' }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' } }} />
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 3, p: 2, borderRadius: 3, background: '#F4F1FF', border: '1px solid rgba(11,25,87,.06)' }}>
          <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 13, mb: 1 }}>External job sources</Typography>
          <Typography sx={{ color: '#667085', fontSize: 12, mb: 1.25 }}>These links open trusted providers. Their listings are not imported into NAVPRARAMBH.</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{EXTERNAL_JOB_SOURCES.map(([label, href]) => <Box key={label} component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: C.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none', '&:hover': { color: C.saffron, textDecoration: 'underline' } }}>{label} ↗</Box>)}</Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}><Typography sx={{ alignSelf: 'center', fontSize: 12, color: '#777' }}>Mode</Typography>{['All','remote','hybrid','onsite'].map((item) => <Chip key={item} label={item === 'All' ? item : item[0].toUpperCase() + item.slice(1)} onClick={() => setMode(item)} sx={{ cursor: 'pointer', background: mode.toLowerCase() === item.toLowerCase() ? C.navy : 'rgba(11,25,87,0.05)', color: mode.toLowerCase() === item.toLowerCase() ? '#fff' : C.navy }} />)}<Typography sx={{ alignSelf: 'center', fontSize: 12, color: '#777' }}>Type</Typography>{['All','full_time','part_time','contract'].map((item) => <Chip key={item} label={item.replace('_', ' ')} onClick={() => setJobType(item)} sx={{ cursor: 'pointer', background: jobType === item ? C.saffron : 'rgba(255,106,0,0.06)', color: jobType === item ? '#fff' : C.navy, textTransform: 'capitalize' }} />)}<Typography sx={{ alignSelf: 'center', fontSize: 12, color: '#777' }}>Category</Typography>{['All','government','private','international'].map((item) => <Chip key={item} label={item} onClick={() => setCategory(item)} sx={{ cursor: 'pointer', background: category === item ? C.emerald : 'rgba(10,155,92,0.06)', color: category === item ? '#fff' : C.navy, textTransform: 'capitalize' }} />)}</Box>
        {loading ? <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : filtered.length === 0 ? <Typography sx={{ color: '#777', py: 6, textAlign: 'center' }}>{jobs.length === 0 ? 'No published jobs are available yet.' : 'No jobs match your selected filters.'}</Typography> : <Grid container spacing={3}>{filtered.map((job) => (
          <Grid key={job.id} size={{ xs: 12, sm: 6, md: 4 }}><Card onClick={() => setSelected(job)} sx={{ borderRadius: 4, height: '100%', cursor: 'pointer' }}><CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Box sx={{ display: 'flex', gap: 1.5 }}><Avatar sx={{ background: C.navy }}>{(job.company?.name ?? job.title)[0]}</Avatar><Box><Typography sx={{ fontWeight: 700, color: C.navy }}>{job.title}</Typography><Typography sx={{ fontSize: 13, color: '#777' }}>{job.company?.name ?? 'Company not specified'}</Typography></Box></Box><Button onClick={() => bookmark(job.id)} disabled={busyId === job.id} sx={{ minWidth: 0 }}>{saved.has(job.id) ? <BookmarkIcon sx={{ color: C.saffron }} /> : <BookmarkBorderIcon />}</Button></Box>
            <Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap', mb: 2 }}><Chip label={job.mode} size="small" /><Chip label={job.type.replace('_',' ')} size="small" /><Chip label={job.category} size="small" /></Box>
            <Box sx={{ display: 'flex', gap: .5, mb: 2 }}><LocationOnIcon sx={{ fontSize: 15, color: '#999' }} /><Typography sx={{ fontSize: 12, color: '#777' }}>{job.location ?? 'Location flexible'}</Typography></Box>
            <Box sx={{ display: 'flex', gap: .5, flexWrap: 'wrap', mb: 2 }}>{job.skills.map((skill) => <Chip key={skill} label={skill} size="small" />)}</Box>
            {job.apply_url ? <Button fullWidth component="a" href={job.apply_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} sx={{ background: C.navy, color: '#fff', borderRadius: 10 }}>Apply ↗</Button> : <Button fullWidth onClick={(event) => { event.stopPropagation(); setSelected(job); }} sx={{ background: 'rgba(11,25,87,.06)', color: C.navy, borderRadius: 10 }}>View details</Button>}
          </CardContent></Card></Grid>
        ))}</Grid>}
      </Box>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogContent sx={{ p: 0 }}>{selected && <><Box sx={{ p: 3, background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', color: '#fff' }}><Button onClick={() => setSelected(null)} startIcon={<CloseIcon />} sx={{ float: 'right', color: '#fff' }}>Close</Button><Typography sx={{ fontSize: 24, fontWeight: 700 }}>{selected.title}</Typography><Typography sx={{ opacity: .75 }}>{selected.company?.name ?? 'Company'} · {selected.location ?? 'Location not provided'}</Typography></Box><Box sx={{ p: 3 }}><Typography sx={{ color: '#555', whiteSpace: 'pre-wrap', mb: 2 }}>{selected.description || 'No job description is available.'}</Typography><Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>{selected.skills.map((skill) => <Chip key={skill} label={skill} size="small" />)}</Box>{(selected.salary_min !== null || selected.salary_max !== null) && <Typography sx={{ color: C.emerald, mb: 2 }}>Salary stored in listing: ₹{selected.salary_min ?? '—'}–{selected.salary_max ?? '—'}</Typography>}<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{selected.apply_url ? <Button component="a" href={selected.apply_url} target="_blank" rel="noopener noreferrer" variant="contained" sx={{ background: C.navy }}>Apply on official company website ↗</Button> : <Typography sx={{ alignSelf: 'center', color: '#888', fontSize: 12 }}>Application link unavailable for this listing.</Typography>}</Box></Box></>}</DialogContent></Dialog>
    </Box>
  );
}
