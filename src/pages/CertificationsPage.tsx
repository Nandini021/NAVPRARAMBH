import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Alert from '@mui/material/Alert';
import { useAuth } from '../auth/AuthProvider';
import { getCertificationCatalog, getUserCertifications } from '../lib/db';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

export default function CertificationsPage() {
  const { user } = useAuth();
  const [earned, setEarned] = useState<Awaited<ReturnType<typeof getUserCertifications>>>([]);
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof getCertificationCatalog>>>([]);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCertificationCatalog(), user ? getUserCertifications(user.id) : Promise.resolve([])])
      .then(([catalogItems, earnedItems]) => { if (mounted) { setCatalog(catalogItems); setEarned(earnedItems); } })
      .catch(() => { if (mounted) setError('Unable to load the certification catalog.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const providers = useMemo(() => ['All', ...Array.from(new Set(catalog.map((item) => item.provider)))], [catalog]);
  const filteredCatalog = useMemo(() => catalog.filter((item) => (provider === 'All' || item.provider === provider) && `${item.name} ${item.provider} ${item.domain ?? ''} ${item.description ?? ''}`.toLowerCase().includes(search.toLowerCase())), [catalog, provider, search]);

  return (
    <Box sx={{ background: '#FFFDF8', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg,#F5B800 0%,#FF6A00 60%,#0B1957 100%)', py: { xs: 6, md: 8 }, px: { xs: 3, md: 6 }, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Chip label="NAVPRARAMBH catalog records" sx={{ mb: 2, background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: '"Outfit",sans-serif', fontWeight: 600 }} />
          <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 44 }, mb: 2 }}>Explore Certifications</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: '"Outfit",sans-serif', fontSize: 16, maxWidth: 520, mx: 'auto' }}>
            Review certifications and provider information stored in NAVPRARAMBH.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 6 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {earned.length > 0 && <Card sx={{ borderRadius: 4, mb: 4 }}><CardContent sx={{ p: 3 }}><Typography sx={{ color: C.navy, fontWeight: 700, mb: 2 }}>My Certifications</Typography><Grid container spacing={2}>{earned.map((item) => <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><EmojiEventsIcon sx={{ color: C.emerald }} /><Box><Typography sx={{ fontWeight: 700, color: C.navy }}>{item.name}</Typography><Typography sx={{ color: '#777', fontSize: 12 }}>{item.provider}</Typography></Box></Box></Grid>)}</Grid></CardContent></Card>}
        {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading certification catalog…</Alert>}
        {!loading && catalog.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>No certification catalog items are available yet.</Alert>}
        <TextField fullWidth value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search certifications or providers" sx={{ mb: 2, '& .MuiOutlinedInput-root': { background: '#fff', borderRadius: 3 } }} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>{providers.map((item) => <Chip key={item} label={item} onClick={() => setProvider(item)} sx={{ cursor: 'pointer', background: provider === item ? C.navy : 'rgba(11,25,87,.05)', color: provider === item ? '#fff' : C.navy }} />)}</Box>
        {!loading && filteredCatalog.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>{catalog.length === 0 ? 'No published certification catalog items are available yet.' : 'No certifications match your selected filters.'}</Alert>}
        <Grid container spacing={3}>
          {filteredCatalog.map((cert, i) => ({ ...cert, level: cert.level ?? 'Not specified', color: ['#4285F4', '#00A1F1', '#FF9900', '#054ADA'][i % 4], tag: cert.is_development_seed ? 'Development catalog' : '', domain: cert.domain ?? 'Not specified' })).map((cert) => (
            <Grid key={cert.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card className="card-lift" sx={{ borderRadius: 4, background: '#fff', border: '1px solid rgba(11,25,87,0.06)', cursor: 'pointer', height: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: `${cert.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${cert.color}30` }}>
                        <EmojiEventsIcon sx={{ color: cert.color, fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 13, color: cert.color }}>{cert.provider}</Typography>
                        <Chip label={cert.domain} size="small" sx={{ fontSize: 9, height: 18, background: `${cert.color}10`, color: cert.color, fontFamily: '"Outfit",sans-serif' }} />
                      </Box>
                    </Box>
                    {cert.tag && <Chip label={cert.tag} size="small" sx={{ fontSize: 9, background: 'rgba(245,184,0,0.12)', color: '#8B6000', fontFamily: '"Outfit",sans-serif', fontWeight: 700 }} />}
                  </Box>
                  <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 15, color: C.navy, mb: 2, lineHeight: 1.35, flex: 1 }}>{cert.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5 }}>
                    <Chip label={cert.level} size="small" sx={{ fontSize: 10, background: cert.level === 'beginner' ? 'rgba(10,155,92,0.08)' : 'rgba(96,178,229,0.1)', color: cert.level === 'beginner' ? C.emerald : C.sky, fontFamily: '"Outfit",sans-serif', textTransform: 'capitalize' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {cert.credential_url ? <Button component="a" href={cert.credential_url} target="_blank" rel="noopener noreferrer" size="small" endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />} sx={{ borderRadius: 8, background: `${cert.color}12`, color: cert.color, fontSize: 11, fontFamily: '"Outfit",sans-serif', fontWeight: 600, '&:hover': { background: `${cert.color}22` } }}>Official provider</Button> : <Typography sx={{ fontSize: 11, color: '#888' }}>Provider link unavailable</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
