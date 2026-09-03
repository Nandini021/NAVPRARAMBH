import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { supabase } from '../lib/supabase';
import type { GovernmentOpportunity } from '../lib/supabase';

const C = { navy: '#0B1957', saffron: '#FF6A00', gold: '#F5B800', ink: '#25304F' };
const NOTICE = 'Sourced opportunities curated for students. NAVPRARAMBH is not a government website or partner.';
const EXTERNAL_GOVERNMENT_SOURCES = [
  ['National Career Service', 'https://www.ncs.gov.in/'],
  ['data.gov.in', 'https://www.data.gov.in/'],
  ['AICTE Internship Portal', 'https://internship.aicte-india.org/'],
] as const;

export default function GovernmentOpportunitiesPage() {
  const [items, setItems] = useState<GovernmentOpportunity[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [selected, setSelected] = useState<GovernmentOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('government_opportunities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (queryError) setError('Unable to load sourced opportunities right now.');
    else setItems((data ?? []) as GovernmentOpportunity[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadItems(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const types = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.opportunity_type)))], [items]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = `${item.title} ${item.description ?? ''} ${item.official_source_name} ${item.category}`.toLowerCase();
      return (!needle || haystack.includes(needle)) && (category === 'All' || item.category === category) && (type === 'All' || item.opportunity_type === type);
    });
  }, [items, search, category, type]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#FFFDF8' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#0B1957 0%,#1A2E7E 100%)', px: { xs: 3, md: 6 }, py: { xs: 7, md: 10 } }}>
        <Box sx={{ maxWidth: 1120, mx: 'auto', position: 'relative', zIndex: 1 }}>
          <Chip icon={<AccountBalanceIcon sx={{ color: `${C.gold} !important` }} />} label="SOURCED OPPORTUNITY CATALOG" sx={{ color: C.gold, borderColor: 'rgba(245,184,0,.45)', mb: 2 }} variant="outlined" />
          <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 32, md: 54 }, maxWidth: 760, mb: 2, fontWeight: 700 }}>Government opportunities, carefully curated.</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.76)', maxWidth: 680, fontSize: { xs: 16, md: 18 }, mb: 4 }}>Explore linked public portals for jobs, scholarships, schemes, and skills—then continue on the source website.</Typography>
          <TextField fullWidth value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search portals and opportunities" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,.62)' }} /></InputAdornment> }} sx={{ maxWidth: 680, '& .MuiOutlinedInput-root': { borderRadius: 4, color: '#fff', background: 'rgba(255,255,255,.1)', '& fieldset': { borderColor: 'rgba(255,255,255,.25)' } }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,.62)', opacity: 1 } }} />
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 3, md: 6 }, py: 3 }}>
        <Alert severity="info" sx={{ mb: 4, borderRadius: 3, color: C.ink }}>{NOTICE}</Alert>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {categories.map((item) => <Chip key={item} label={item} onClick={() => setCategory(item)} sx={{ cursor: 'pointer', fontWeight: 600, background: category === item ? C.navy : 'rgba(11,25,87,.06)', color: category === item ? '#fff' : C.navy }} />)}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {types.map((item) => <Chip key={item} label={item === 'All' ? item : item[0].toUpperCase() + item.slice(1)} onClick={() => setType(item)} variant={type === item ? 'filled' : 'outlined'} sx={{ cursor: 'pointer', color: type === item ? '#fff' : C.saffron, background: type === item ? C.saffron : 'transparent', borderColor: C.saffron }} />)}
        </Box>
        {error && <Alert severity="error" action={<Button color="inherit" onClick={() => void loadItems()}>Retry</Button>} sx={{ mb: 3 }}>{error}</Alert>}
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: C.saffron }} /></Box> : filtered.length === 0 ? <Box sx={{ textAlign: 'center', py: 6 }}><Typography variant="h6" sx={{ color: C.navy, mb: 1 }}>{items.length === 0 ? 'No government opportunities are currently published in NAVPRARAMBH.' : 'No opportunities match your filters.'}</Typography><Typography sx={{ color: '#777', mb: 2 }}>{items.length === 0 ? 'Explore trusted public portals directly; their listings are not imported into NAVPRARAMBH.' : 'Try a different search or category.'}</Typography>{items.length === 0 && <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>{EXTERNAL_GOVERNMENT_SOURCES.map(([label, href]) => <Button key={label} component="a" href={href} target="_blank" rel="noopener noreferrer" size="small" variant="outlined" sx={{ borderColor: C.navy, color: C.navy }}>{label} ↗</Button>)}</Box>}</Box> : <Grid container spacing={3}>{filtered.map((item) => <OpportunityCard key={item.id} item={item} onOpen={() => setSelected(item)} />)}</Grid>}
      </Box>
      <OpportunityDialog item={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}

function OpportunityCard({ item, onOpen }: { item: GovernmentOpportunity; onOpen: () => void }) {
  return <Grid size={{ xs: 12, sm: 6, md: 4 }}><Card className="card-lift" sx={{ height: '100%', borderRadius: 5, border: '1px solid rgba(11,25,87,.08)', boxShadow: '0 10px 30px rgba(11,25,87,.07)', background: 'linear-gradient(160deg,#fff 0%,#FFF9F1 100%)' }}><CardContent sx={{ p: { xs: 3, md: 3.5 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}><Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,#FF6A00,#F5B800)' }}><AccountBalanceIcon /></Box><Chip icon={<VerifiedIcon sx={{ fontSize: 16 }} />} label="Verified source" size="small" sx={{ color: '#0A9B5C', background: 'rgba(10,155,92,.08)', '& .MuiChip-icon': { color: '#0A9B5C' } }} /></Box>
    <Chip label={item.category} size="small" sx={{ alignSelf: 'flex-start', mb: 1.5, color: '#0B1957', background: 'rgba(11,25,87,.07)' }} />
    <Typography variant="h6" sx={{ color: '#0B1957', fontWeight: 700, mb: 1 }}>{item.title}</Typography>
    <Typography sx={{ color: '#667085', fontSize: 14, lineHeight: 1.65, mb: 2, flexGrow: 1 }}>{item.description ?? 'Explore details on the linked source website.'}</Typography>
    <Typography sx={{ color: '#777', fontSize: 12, mb: 2 }}>Source: {item.official_source_name}</Typography>
    <Button fullWidth onClick={onOpen} variant="contained" sx={{ borderRadius: 3, background: '#0B1957', '&:hover': { background: '#1A2E7E' } }}>View details</Button>
  </CardContent></Card></Grid>;
}

function OpportunityDialog({ item, onClose }: { item: GovernmentOpportunity | null; onClose: () => void }) {
  return <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle sx={{ color: '#0B1957', fontWeight: 700 }}>{item?.title}</DialogTitle><DialogContent dividers>
    {item && <Box sx={{ display: 'grid', gap: 2 }}><Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Chip label={item.category} /><Chip label={item.opportunity_type} sx={{ color: '#FF6A00' }} /></Box><Typography sx={{ color: '#475467', lineHeight: 1.7 }}>{item.description}</Typography><Typography sx={{ fontSize: 14, color: '#667085' }}><strong>Source website:</strong> {item.official_source_name}</Typography>{item.last_verified_at && <Typography sx={{ fontSize: 13, color: '#667085' }}>Last verified: {item.last_verified_at}</Typography>}<Alert severity="info" sx={{ borderRadius: 3 }}>{NOTICE}</Alert></Box>}
  </DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose} sx={{ color: '#0B1957' }}>Close</Button>{item && <Button component="a" href={item.application_url ?? item.official_source_url} target="_blank" rel="noreferrer" endIcon={<OpenInNewIcon />} variant="contained" sx={{ borderRadius: 3, background: '#FF6A00' }}>Open source website</Button>}</DialogActions></Dialog>;
}
