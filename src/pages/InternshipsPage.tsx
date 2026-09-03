import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { getInternships, getStudentBookmarks, toggleBookmark } from '../lib/db';
import { useAuth } from '../auth/AuthProvider';
import type { Internship } from '../lib/supabase';

const C = { navy: '#0B1957', emerald: '#0A9B5C', saffron: '#FF6A00' };
const EXTERNAL_INTERNSHIP_SOURCES = [
  ['AICTE Internship Portal', 'https://internship.aicte-india.org/'],
  ['National Career Service', 'https://www.ncs.gov.in/'],
  ['data.gov.in', 'https://www.data.gov.in/'],
] as const;
const FILTERS = ['All', 'remote', 'hybrid', 'onsite', 'PPO Available'];

export default function InternshipsPage() {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'stipend'>('recent');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Internship | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getInternships(), user ? getStudentBookmarks(user.id) : Promise.resolve([])])
      .then(([items, bookmarks]) => { if (mounted) { setInternships(items); setSaved(new Set(bookmarks.filter((b) => b.internship_id).map((b) => b.internship_id as string))); } })
      .catch(() => { if (mounted) setError('Unable to load internships right now.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const filtered = useMemo(() => internships
    .filter((item) => filter === 'All' || (filter === 'PPO Available' ? item.has_ppo : item.mode === filter))
    .filter((item) => `${item.title} ${item.company?.name ?? ''} ${item.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'stipend' ? Number(b.stipend_monthly ?? 0) - Number(a.stipend_monthly ?? 0) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [internships, filter, search, sort]);
  const bookmark = async (internshipId: string) => {
    setBusyId(internshipId);
    try {
      const nextSaved = await toggleBookmark({ internshipId });
      setSaved((current) => {
        const next = new Set(current);
        if (nextSaved) next.add(internshipId); else next.delete(internshipId);
        return next;
      });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update bookmark.'); }
    finally { setBusyId(null); }
  };

  return <Box sx={{ background: '#FFFDF8', minHeight: '100vh' }}>
    <Box sx={{ background: 'linear-gradient(135deg,#0A9B5C,#077A47)', py: { xs: 6, md: 8 }, px: 3, textAlign: 'center' }}><Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 44 }, mb: 2 }}>Internships</Typography><Typography sx={{ color: 'rgba(255,255,255,.75)' }}>Real opportunities from the NAVPRARAMBH catalog.</Typography></Box>
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3, p: 2, borderRadius: 3, background: '#F1FBF6', border: '1px solid rgba(10,155,92,.1)' }}>
        <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 13, mb: 1 }}>External internship sources</Typography>
        <Typography sx={{ color: '#667085', fontSize: 12, mb: 1.25 }}>Open trusted providers directly. Their listings are not imported into NAVPRARAMBH.</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{EXTERNAL_INTERNSHIP_SOURCES.map(([label, href]) => <Box key={label} component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: C.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none', '&:hover': { color: C.emerald, textDecoration: 'underline' } }}>{label} ↗</Box>)}</Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        <input aria-label="Search internships" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search role, company, or skill" style={{ flex: '1 1 260px', minWidth: 0, border: '1px solid rgba(11,25,87,.12)', borderRadius: 12, padding: '12px 14px', font: 'inherit' }} />
        <select aria-label="Sort internships" value={sort} onChange={(event) => setSort(event.target.value as 'recent' | 'stipend')} style={{ border: '1px solid rgba(11,25,87,.12)', borderRadius: 12, padding: '0 12px', background: '#fff' }}><option value="recent">Newest first</option><option value="stipend">Highest stipend</option></select>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>{FILTERS.map((item) => <Chip key={item} label={item === 'PPO Available' ? item : item[0].toUpperCase() + item.slice(1)} onClick={() => setFilter(item)} sx={{ cursor: 'pointer', background: filter === item ? C.emerald : 'rgba(11,25,87,.05)', color: filter === item ? '#fff' : C.navy }} />)}</Box>
      {loading ? <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : filtered.length === 0 ? <Typography sx={{ textAlign: 'center', color: '#777', py: 6 }}>{internships.length === 0 ? 'No published internships are available yet.' : 'No internships match your selected filters.'}</Typography> : <Grid container spacing={3}>{filtered.map((item) => <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}><Card onClick={() => setSelected(item)} sx={{ borderRadius: 4, height: '100%', cursor: 'pointer' }}><CardContent sx={{ p: 3 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Box sx={{ display: 'flex', gap: 1.5 }}><Avatar sx={{ background: C.emerald }}>{(item.company?.name ?? item.title)[0]}</Avatar><Box><Typography sx={{ fontWeight: 700, color: C.navy }}>{item.title}</Typography><Typography sx={{ fontSize: 13, color: '#777' }}>{item.company?.name ?? 'Company not specified'}</Typography></Box></Box><Button onClick={() => bookmark(item.id)} disabled={busyId === item.id} sx={{ minWidth: 0 }}>{saved.has(item.id) ? <BookmarkIcon sx={{ color: C.saffron }} /> : <BookmarkBorderIcon />}</Button></Box><Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap', mb: 2 }}><Chip label={item.mode} size="small" />{item.has_ppo && <Chip label="PPO" size="small" />}</Box><Typography sx={{ color: '#666', fontSize: 13, mb: 1 }}>Duration: {item.duration_months ? `${item.duration_months} months` : 'Flexible'}</Typography><Typography sx={{ color: '#666', fontSize: 13, mb: 2 }}>Stipend: {item.stipend_monthly ? `₹${item.stipend_monthly}/month` : 'Not specified'}</Typography><Box sx={{ display: 'flex', gap: .5, flexWrap: 'wrap', mb: 2 }}>{item.skills.map((skill) => <Chip key={skill} label={skill} size="small" />)}</Box>{item.apply_url ? <Button fullWidth component="a" href={item.apply_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} sx={{ background: C.emerald, color: '#fff', borderRadius: 10 }}>Apply ↗</Button> : <Button fullWidth onClick={(event) => { event.stopPropagation(); setSelected(item); }} sx={{ background: 'rgba(10,155,92,.08)', color: C.emerald, borderRadius: 10 }}>View details</Button>}</CardContent></Card></Grid>)}</Grid>}
    </Box>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        {selected && <>
          <Box sx={{ p: 3, background: 'linear-gradient(135deg,#0A9B5C,#077A47)', color: '#fff' }}>
            <IconButton onClick={() => setSelected(null)} aria-label="Close internship details" sx={{ float: 'right', color: '#fff' }}><CloseIcon /></IconButton>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{selected.title}</Typography>
            <Typography sx={{ opacity: .8 }}>{selected.company?.name ?? 'Company not specified'} · {selected.mode}</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: '#555', whiteSpace: 'pre-wrap', mb: 2 }}>{selected.description || 'No internship description is available.'}</Typography>
            <Typography sx={{ color: '#666', fontSize: 13, mb: 1 }}>Duration: {selected.duration_months ? `${selected.duration_months} months` : 'Not specified'}</Typography>
            <Typography sx={{ color: '#666', fontSize: 13, mb: 2 }}>Stipend: {selected.stipend_monthly ? `₹${selected.stipend_monthly}/month` : 'Not specified'}{selected.has_ppo ? ' · PPO available' : ''}</Typography>
            <Typography sx={{ color: C.navy, fontWeight: 700, mb: 1 }}>Skills and eligibility</Typography>
            <Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap', mb: 2 }}>{selected.skills.length ? selected.skills.map((skill) => <Chip key={skill} label={skill} size="small" />) : <Typography sx={{ color: '#888', fontSize: 13 }}>Skills not specified</Typography>}</Box>
            <Typography sx={{ color: '#777', fontSize: 13, mb: 2 }}>Eligibility details are limited to the fields supplied by the listing.</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{selected.apply_url ? <Button component="a" href={selected.apply_url} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />} variant="contained" sx={{ background: C.emerald }}>Official application ↗</Button> : <Typography sx={{ alignSelf: 'center', color: '#888', fontSize: 12 }}>Application link unavailable for this listing.</Typography>}</Box>
          </Box>
        </>}
      </DialogContent>
    </Dialog>
  </Box>;
}
