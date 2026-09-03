import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import StarIcon from '@mui/icons-material/Star';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import { getCourses, getEnrollments, enrollInCourse, seedDemoCourses, updateEnrollmentProgress } from '../lib/db';
import { useAuth } from '../auth/AuthProvider';
import type { Course } from '../lib/supabase';

const C = { navy: '#0B1957', sky: '#60B2E5', emerald: '#0A9B5C' };
const EXTERNAL_LEARNING_RESOURCES = [
  ['Microsoft Learn', 'https://learn.microsoft.com/en-us/training/'],
  ['IBM SkillsBuild', 'https://skillsbuild.org/learning-catalog'],
  ['Infosys Springboard', 'https://www.infosys.com/about/esg/esg-opportunity/springboard.html'],
  ['Cisco Networking Academy', 'https://www.netacad.com/'],
  ['NPTEL / SWAYAM', 'https://onlinecourses.nptel.ac.in/'],
  ['AWS Skill Builder', 'https://skillbuilder.aws/'],
  ['Salesforce Trailhead', 'https://trailhead.salesforce.com/'],
] as const;

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [enrollmentIds, setEnrollmentIds] = useState<Record<string, string>>({});
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [search, setSearch] = useState('');
  const [enrollmentProgress, setEnrollmentProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [demoSeedBusy, setDemoSeedBusy] = useState(false);
  const [demoSeedComplete, setDemoSeedComplete] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCourses(), user ? getEnrollments(user.id) : Promise.resolve([])])
      .then(([nextCourses, nextEnrollments]) => { if (mounted) { setCourses(nextCourses);
        setEnrolled(new Set(nextEnrollments.map((item) => item.course_id)));
        setEnrollmentIds(Object.fromEntries(nextEnrollments.map((item) => [item.course_id, item.id])));
        setEnrollmentProgress(Object.fromEntries(nextEnrollments.map((item) => [item.course_id, item.progress]))); } })
      .catch(() => { if (mounted) setError('Unable to load courses right now.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const seedCourses = async () => {
    setDemoSeedBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await seedDemoCourses();
      setDemoSeedComplete(true);
      setMessage(result.inserted > 0 ? `${result.inserted} demo learning courses added to Supabase.` : 'Demo learning content is already available.');
      const refreshedCourses = await getCourses();
      setCourses(refreshedCourses);
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : 'Unable to add demo learning content.');
    } finally {
      setDemoSeedBusy(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(courses.map((course) => course.category).filter(Boolean) as string[]))];
  const filtered = useMemo(() => courses.filter((course) => (category === 'All' || course.category === category) && (level === 'All' || course.level === level) && `${course.title} ${course.description ?? ''} ${course.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [courses, category, level, search]);
  const enroll = async (courseId: string) => { setBusyId(courseId); setError(null); setMessage(null); try { const enrollment = await enrollInCourse(courseId); setEnrolled((current) => new Set(current).add(courseId)); setEnrollmentIds((current) => ({ ...current, [courseId]: enrollment.id })); setEnrollmentProgress((current) => ({ ...current, [courseId]: enrollment.progress })); setMessage('You are enrolled in this course.'); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to enroll in this course.'); } finally { setBusyId(null); } };

  return <Box sx={{ background: '#FFFDF8', minHeight: '100vh' }}>
    <Box sx={{ background: 'linear-gradient(135deg,#60B2E5,#0B1957)', py: { xs: 6, md: 8 }, px: 3, textAlign: 'center' }}><Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 28, md: 44 }, mb: 2 }}>Learn New Skills</Typography><Typography sx={{ color: 'rgba(255,255,255,.75)' }}>Courses from the real NAVPRARAMBH catalog.</Typography></Box>
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Box sx={{ mb: 4, p: 2.5, borderRadius: 3, background: '#F4F1FF', border: '1px solid rgba(11,25,87,.08)' }}>
        <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 14, mb: 0.5 }}>Explore external learning resources</Typography>
        <Typography sx={{ color: '#667085', fontSize: 12, mb: 1.5 }}>These official provider links are not imported into NAVPRARAMBH and are separate from your saved learning.</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{EXTERNAL_LEARNING_RESOURCES.map(([label, href]) => <Box key={label} component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: C.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none', '&:hover': { color: C.sky, textDecoration: 'underline' } }}>{label} ↗</Box>)}</Box>
      </Box>
      {import.meta.env.DEV && user && !demoSeedComplete && <Box sx={{ mb: 3, p: 2, borderRadius: 3, background: '#F8F5FF', border: '1px dashed rgba(11,25,87,.18)' }}>
        <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 13 }}>Demo mode</Typography>
        <Typography sx={{ color: '#667085', fontSize: 12, mb: 1.25 }}>Add clearly marked learning content to your authenticated Supabase account. This affects courses only.</Typography>
        <Button onClick={() => void seedCourses()} disabled={demoSeedBusy} variant="outlined" sx={{ color: C.navy, borderColor: 'rgba(11,25,87,.25)', borderRadius: 2 }}>{demoSeedBusy ? 'Adding learning content…' : 'Populate Demo Learning'}</Button>
      </Box>}
      <TextField fullWidth value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses or skills" sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3, background: '#fff' } }} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>{categories.map((item) => <Chip key={item} label={item} onClick={() => setCategory(item)} sx={{ cursor: 'pointer', background: category === item ? C.navy : 'rgba(11,25,87,.05)', color: category === item ? '#fff' : C.navy }} />)}{['All', 'beginner', 'intermediate', 'advanced'].map((item) => <Chip key={item} label={item === 'All' ? 'All levels' : item} onClick={() => setLevel(item)} sx={{ cursor: 'pointer', background: level === item ? C.sky : 'rgba(96,178,229,.08)', color: level === item ? '#fff' : C.navy, textTransform: 'capitalize' }} />)}</Box>
      {loading ? <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : filtered.length === 0 ? <Typography sx={{ textAlign: 'center', color: '#777', py: 6 }}>{courses.length === 0 ? 'No courses are currently published in NAVPRARAMBH.' : 'No courses match your selected filters.'}</Typography> : <Grid container spacing={3}>{filtered.map((course) => <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}><Card onClick={() => setSelected(course)} sx={{ borderRadius: 4, height: '100%', cursor: 'pointer' }}><CardContent sx={{ p: 3 }}><Chip label={course.category ?? 'General'} size="small" sx={{ mb: 2 }} /><Typography sx={{ fontWeight: 700, color: C.navy, mb: 1 }}>{course.title}</Typography><Typography sx={{ color: '#888', fontSize: 13, mb: 2 }}>{course.description ?? 'Build practical career skills.'}</Typography><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}><StarIcon sx={{ fontSize: 14, color: '#D97706' }} /><Typography sx={{ fontSize: 12 }}>{course.rating}</Typography></Box><Typography sx={{ fontSize: 12, color: '#777' }}>{course.duration_hours ?? '—'} hours</Typography></Box>{enrolled.has(course.id) && <Box sx={{ mb: 2 }}><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontSize: 11, color: C.emerald }}>Self-reported progress</Typography><Typography sx={{ fontSize: 11, color: C.emerald }}>{enrollmentProgress[course.id] ?? 0}%</Typography></Box><LinearProgress variant="determinate" value={enrollmentProgress[course.id] ?? 0} sx={{ height: 5, borderRadius: 2, '& .MuiLinearProgress-bar': { background: C.emerald } }} /></Box>}<Button fullWidth onClick={(event) => { event.stopPropagation(); void enroll(course.id); }} disabled={busyId === course.id || enrolled.has(course.id)} startIcon={<PlayCircleIcon />} sx={{ background: enrolled.has(course.id) ? 'rgba(10,155,92,.1)' : C.sky, color: enrolled.has(course.id) ? C.emerald : '#fff', borderRadius: 10 }}>{enrolled.has(course.id) ? 'Enrolled' : busyId === course.id ? 'Please wait…' : 'Enroll'}</Button></CardContent></Card></Grid>)}</Grid>}
    </Box>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        {selected && <>
          <Box sx={{ p: 3, background: 'linear-gradient(135deg,#60B2E5,#0B1957)', color: '#fff' }}>
            <IconButton onClick={() => setSelected(null)} aria-label="Close course details" sx={{ float: 'right', color: '#fff' }}><CloseIcon /></IconButton>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{selected.title}</Typography>
            <Typography sx={{ opacity: .8 }}>{selected.instructor ?? 'Instructor not specified'} · {selected.level}</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Typography sx={{ color: '#555', mb: 2 }}>{selected.description || 'No course description is available.'}</Typography>
            <Typography sx={{ color: C.navy, fontWeight: 700, mb: 1 }}>Skills covered</Typography>
            <Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap', mb: 2 }}>{selected.skills.length ? selected.skills.map((skill) => <Chip key={skill} label={skill} size="small" />) : <Typography sx={{ color: '#888', fontSize: 13 }}>Not specified</Typography>}</Box>
            <Typography sx={{ color: '#777', fontSize: 13, mb: 2 }}>Duration: {selected.duration_hours ?? 'Not specified'} hours · Rating: {selected.rating}</Typography>
            {enrolled.has(selected.id) ? <>
              <Typography sx={{ color: C.emerald, fontSize: 13, mb: 1 }}>Saved progress: {enrollmentProgress[selected.id] ?? 0}%</Typography>
              <Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap' }}>{[25, 50, 75, 100].map((value) => <Button key={value} size="small" variant="outlined" disabled={busyId === selected.id} onClick={() => { const enrollmentId = enrollmentIds[selected.id]; if (!enrollmentId) { setError('This enrollment could not be identified.'); return; } setBusyId(selected.id); void updateEnrollmentProgress(enrollmentId, value).then((item) => { setEnrollmentProgress((current) => ({ ...current, [selected.id]: item.progress })); setMessage('Course progress saved.'); }).catch((e) => setError(e instanceof Error ? e.message : 'Unable to update progress.')).finally(() => setBusyId(null)); }}>{value}% complete</Button>)}</Box>
            </> : <Button onClick={() => void enroll(selected.id)} disabled={busyId === selected.id} variant="contained" sx={{ background: C.sky }}>Enroll in course</Button>}
          </Box>
        </>}
      </DialogContent>
    </Dialog>
  </Box>;
}
