import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '../auth/AuthProvider';
import { getPMInternships, getStudentSkills } from '../lib/db';
import { matchPMInternship } from '../lib/pmMatching';
import type { PMInternship, StudentSkill } from '../lib/supabase';

const C = { navy: '#0B1957', saffron: '#FF6A00', emerald: '#0A9B5C' };

export default function PMInternshipMatchPage() {
  const { user, profile, profileLoading } = useAuth();
  const [items, setItems] = useState<PMInternship[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([getPMInternships(), getStudentSkills(user.id)])
      .then(([nextItems, nextSkills]) => { if (mounted) { setItems(nextItems); setSkills(nextSkills); } })
      .catch(() => { if (mounted) setError('The profile-based match preview is temporarily unavailable.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const matches = useMemo(() => items.map((item) => ({ item, breakdown: matchPMInternship(profile, skills, item) })).sort((a, b) => b.breakdown.score - a.breakdown.score), [items, profile, skills]);
  if (profileLoading) return <Box sx={{ p: 4 }}>Loading your student profile…</Box>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ minHeight: '100vh', background: '#FFFDF8', pb: 8 }}>
      <Box sx={{ background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', color: '#fff', px: 3, py: { xs: 6, md: 8 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 3 }, mb: 2 }}>
            <Box
              component="img"
              src="/pm-emblem.png"
              alt="Government emblem shown for PM Internship Scheme context"
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
              sx={{ width: { xs: 52, sm: 68 }, height: { xs: 78, sm: 102 }, maxWidth: '100%', objectFit: 'contain', objectPosition: 'center', flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Chip label="Profile-based match preview" sx={{ color: '#fff', background: 'rgba(255,255,255,.14)' }} />
              <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 48 }, fontWeight: 700, mt: 1 }}>PM Internship Smart Match</Typography>
            </Box>
            <Box
              component="img"
              src="/pm-photo.png"
              alt="Prime Minister of India"
              sx={{ display: { xs: 'none', sm: 'block' }, width: { sm: 120, md: 170 }, height: { sm: 86, md: 120 }, maxWidth: '28%', objectFit: 'contain', objectPosition: 'center', flexShrink: 0, borderRadius: 2 }}
            />
          </Box>
          <Typography sx={{ maxWidth: 700, color: 'rgba(255,255,255,.78)', lineHeight: 1.7 }}>Find internships that match your skills, education, location and career goals. This explainable profile-based preview uses transparent rules, not an AI/ML score, and is not a government-affiliated service.</Typography>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
        {loading && <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: C.saffron }} /></Box>}
        {error && <Card role="alert" sx={{ borderRadius: 4, border: '1px solid #F2C6A4' }}><CardContent><Typography sx={{ color: '#8A4B08' }}>{error}</Typography></CardContent></Card>}
        <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid rgba(11,25,87,.08)', background: '#fff' }}><CardContent sx={{ p: { xs: 3, md: 4 } }}><Typography sx={{ color: C.navy, fontWeight: 700, mb: 1 }}>Your profile inputs</Typography><Typography sx={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>Matching uses only information currently saved to your account. Unsupported preferences are not assumed.</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>{profile?.degree && <Chip label={`Education: ${profile.degree}`} />}{profile?.college && <Chip label={`College: ${profile.college}`} />}{profile?.location && <Chip label={`Location: ${profile.location}`} />}{skills.length ? skills.map((skill) => <Chip key={skill.id} label={skill.name} size="small" />) : <Typography sx={{ color: '#888', fontSize: 13, alignSelf: 'center' }}>No saved skills yet.</Typography>}</Box></CardContent></Card>
        {!loading && !error && items.length === 0 && <Card sx={{ borderRadius: 4, border: '1px dashed rgba(11,25,87,.22)', background: '#FBFCFF' }}><CardContent sx={{ p: { xs: 3, md: 5 } }}><Typography sx={{ color: C.saffron, fontWeight: 700, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}>Connected data source</Typography><Typography variant="h2" sx={{ color: C.navy, fontSize: { xs: 25, md: 34 }, mt: 1, mb: 1.5 }}>No verified PM Internship opportunities right now</Typography><Typography sx={{ color: '#666', lineHeight: 1.8, maxWidth: 720 }}>No verified PM Internship opportunities are currently available in the connected data source. This preview is not a government-affiliated service.</Typography><Button component="a" href="https://pminternship.mca.gov.in/" target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ mt: 3, borderColor: C.navy, color: C.navy }}>Check Official Opportunities</Button><Typography sx={{ color: '#888', fontSize: 13, mt: 2 }}>Matching weights when records are available: skills 50%, domain 20%, location 10%, work mode 10%, eligibility 10%.</Typography></CardContent></Card>}
        {!loading && !error && matches.length > 0 && <Box sx={{ display: 'grid', gap: 3 }}>{matches.map(({ item, breakdown }) => <Card key={item.id} sx={{ borderRadius: 4, border: '1px solid rgba(11,25,87,.08)' }}><CardContent sx={{ p: { xs: 3, md: 4 } }}><Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}><Box><Typography sx={{ color: C.navy, fontSize: 20, fontWeight: 700 }}>{item.title}</Typography><Typography sx={{ color: '#777', mt: .5 }}>{item.organization}{item.location ? ` · ${item.location}` : ''}</Typography></Box><Typography sx={{ color: C.emerald, fontSize: 26, fontWeight: 700 }}>{breakdown.score}% <Typography component="span" sx={{ fontSize: 12, color: '#777' }}>Match</Typography></Typography></Box><Typography sx={{ color: '#666', mt: 2, lineHeight: 1.7 }}>{item.description || 'No description supplied.'}</Typography><Typography sx={{ color: C.navy, fontWeight: 700, mt: 3, mb: 1 }}>Why this match?</Typography><Box component="ul" sx={{ pl: 2.5, m: 0, color: '#555' }}>{breakdown.reasons.map((reason) => <li key={reason}><Typography component="span" sx={{ fontSize: 14 }}>{reason}</Typography></li>)}</Box><Typography sx={{ color: C.navy, fontWeight: 700, mt: 3, mb: 1 }}>Improve your match</Typography><Box component="ul" sx={{ pl: 2.5, m: 0, color: '#555' }}>{breakdown.suggestions.map((suggestion) => <li key={suggestion}><Typography component="span" sx={{ fontSize: 14 }}>{suggestion}</Typography></li>)}</Box><Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}>{item.domain && <Chip label={item.domain} size="small" />}{item.work_mode && <Chip label={item.work_mode} size="small" />}{item.apply_url && <Button component="a" href={item.apply_url} target="_blank" rel="noopener noreferrer" size="small" endIcon={<OpenInNewIcon />} sx={{ color: C.navy }}>Application link</Button>}</Box><Typography sx={{ color: '#999', fontSize: 11, mt: 2 }}>Source: {item.source_type} · Verified {item.verified_at}</Typography></CardContent></Card>)}</Box>}
      </Box>
    </Box>
  );
}
