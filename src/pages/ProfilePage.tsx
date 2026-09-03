import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../auth/AuthProvider';
import { createStudentProject, createUserCertification, deleteStudentSkill, getInternships, getJobs, getResumeVersions, getStudentProjects, getStudentSkills, getUserCertifications, removeResumeFile, uploadResumeFile, updateProfile, upsertStudentSkill } from '../lib/db';
import type { Project } from '../lib/supabase';
import type { UserCertification } from '../lib/db';

const C = { navy: '#0B1957', saffron: '#FF6A00', sky: '#60B2E5', emerald: '#0A9B5C' };
const DEGREE_OPTIONS = ['B.Sc', 'B.Com', 'B.Tech', 'B.E.', 'BCA', 'BBA', 'BA', 'MCA', 'M.Tech', 'MBA', 'M.A.', 'M.Com', 'Other'];
const LOCATION_OPTIONS = ['Hyderabad, Telangana', 'Bengaluru, Karnataka', 'Chennai, Tamil Nadu', 'Mumbai, Maharashtra', 'Delhi, India', 'Pune, Maharashtra', 'Kolkata, West Bengal', 'Remote'];

export default function ProfilePage() {
  const { user, profile, profileLoading, profileError, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [skills, setSkills] = useState<Awaited<ReturnType<typeof getStudentSkills>>>([]);
  const [skillName, setSkillName] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [highlightedSkill, setHighlightedSkill] = useState(0);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillSaving, setSkillSaving] = useState(false);
  const [resumeVersions, setResumeVersions] = useState<Awaited<ReturnType<typeof getResumeVersions>>>([]);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', bio: '', phone: '', location: '', github_url: '', linkedin_url: '', college: '', degree: '', graduation_year: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tech_stack: '', project_url: '' });
  const [certificationForm, setCertificationForm] = useState({ name: '', provider: '', issue_year: '', credential_url: '' });
  const [addingProject, setAddingProject] = useState(false);
  const [addingCertification, setAddingCertification] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([getStudentProjects(user.id), getUserCertifications(user.id), getStudentSkills(user.id), getResumeVersions(user.id), getJobs(), getInternships()])
      .then(([nextProjects, nextCertifications, nextSkills, nextResumes, jobs, internships]) => {
        if (!mounted) return;
        const catalogSkills = [...jobs, ...internships].flatMap((item) => item.skills ?? []);
        setAvailableSkills([...new Set(catalogSkills)].sort((a, b) => a.localeCompare(b)));
        setProjects(nextProjects);
        setCertifications(nextCertifications);
        setSkills(nextSkills);
        setResumeVersions(nextResumes);
      })
      .catch(() => { if (mounted) setError('Unable to load your portfolio data.'); })
      .finally(() => { if (mounted) setPortfolioLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    setForm({ full_name: profile.full_name ?? '', bio: profile.bio ?? '', phone: profile.phone ?? '', location: profile.location ?? '', github_url: profile.github_url ?? '', linkedin_url: profile.linkedin_url ?? '', college: profile.college ?? '', degree: profile.degree ?? '', graduation_year: profile.graduation_year?.toString() ?? '' });
  }, [profile]);

  const name = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Student';
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const completionFields = [profile?.full_name, profile?.phone, profile?.location, profile?.college, profile?.degree, profile?.graduation_year, profile?.bio, profile?.github_url, profile?.linkedin_url];
  const profileCompletion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const updateSkillName = (value: string) => {
    setSkillName(value);
    setHighlightedSkill(0);
    const query = value.trim().toLowerCase();
    setSkillSuggestions(query ? availableSkills.filter((skill) => skill.toLowerCase().includes(query) && !skills.some((saved) => saved.name.toLowerCase() === skill.toLowerCase())).slice(0, 6) : []);
  };

  const removeSkill = async (skillId: string) => {
    setSkillSaving(true); setError(null);
    try {
      await deleteStudentSkill(skillId);
      setSkills((items) => items.filter((item) => item.id !== skillId));
      setSaveMessage('Skill removed.');
    } catch (skillError) { setError(skillError instanceof Error ? skillError.message : 'Unable to remove your skill.'); }
    finally { setSkillSaving(false); }
  };

  const chooseSkill = (value: string) => {
    setSkillName(value);
    setSkillSuggestions([]);
  };

  const saveSkill = async () => {
    if (!skillName.trim()) return;
    setSkillSaving(true); setError(null); setSaveMessage(null);
    try {
      const saved = await upsertStudentSkill({ name: skillName.trim(), category: null, proficiency: 0 });
      setSkills((items) => [...items.filter((item) => item.id !== saved.id && item.name.toLowerCase() !== saved.name.toLowerCase()), saved].sort((a, b) => a.name.localeCompare(b.name)));
      setSkillName(''); setSkillSuggestions([]); setSaveMessage('Skill saved successfully.');
    } catch (skillError) { setError(skillError instanceof Error ? skillError.message : 'Unable to save your skill.'); }
    finally { setSkillSaving(false); }
  };

  const editSkill = (skill: Awaited<ReturnType<typeof getStudentSkills>>[number]) => {
    setSkillName(skill.name); setEditing(true);
  };

  const uploadResume = async (file: File) => {
    setResumeUploading(true); setError(null); setSaveMessage(null);
    try {
      const saved = await uploadResumeFile(file);
      setResumeVersions([saved]);
      setSaveMessage(`${file.name} uploaded securely and is now your current resume.`);
    } catch (resumeError) { setError(resumeError instanceof Error ? resumeError.message : 'Unable to upload your resume.'); }
    finally { setResumeUploading(false); }
  };

  const removeResume = async (version: Awaited<ReturnType<typeof getResumeVersions>>[number]) => {
    if (!window.confirm(`Remove ${version.title}?`)) return;
    setResumeUploading(true); setError(null); setSaveMessage(null);
    try {
      await removeResumeFile(version);
      setResumeVersions((items) => items.filter((item) => item.id !== version.id));
      setSaveMessage('Resume removed.');
    } catch (resumeError) { setError(resumeError instanceof Error ? resumeError.message : 'Unable to remove your resume.'); }
    finally { setResumeUploading(false); }
  };

  const addProject = async () => {
    setAddingProject(true); setError(null);
    try {
      const saved = await createStudentProject({ title: projectForm.title, description: projectForm.description, tech_stack: projectForm.tech_stack.split(',').map((item) => item.trim()).filter(Boolean), project_url: projectForm.project_url });
      setProjects((items) => [saved, ...items]);
      setProjectForm({ title: '', description: '', tech_stack: '', project_url: '' });
      setSaveMessage('Project added successfully.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to add project.'); }
    finally { setAddingProject(false); }
  };

  const addCertification = async () => {
    setAddingCertification(true); setError(null);
    try {
      const saved = await createUserCertification({ name: certificationForm.name, provider: certificationForm.provider, issue_date: certificationForm.issue_year ? `${certificationForm.issue_year}-01-01` : undefined, credential_url: certificationForm.credential_url });
      setCertifications((items) => [saved, ...items]);
      setCertificationForm({ name: '', provider: '', issue_year: '', credential_url: '' });
      setSaveMessage('Certification added successfully.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to add certification.'); }
    finally { setAddingCertification(false); }
  };

  const save = async () => {
    if (!user) return;
    const name = form.full_name.trim();
    const phone = form.phone.trim();
    const urlFields = [form.github_url, form.linkedin_url].map((value) => value.trim()).filter(Boolean);
    if (!name) { setError('Full name is required.'); return; }
    if (phone && !/^[+\d][\d\s().-]{6,19}$/.test(phone)) { setError('Enter a valid phone number.'); return; }
    if (form.graduation_year && (!/^\d{4}$/.test(form.graduation_year) || Number(form.graduation_year) < 1950 || Number(form.graduation_year) > new Date().getFullYear() + 10)) { setError('Enter a reasonable graduation year.'); return; }
    try { urlFields.forEach((value) => new URL(value)); } catch { setError('GitHub and LinkedIn fields must contain valid URLs.'); return; }
    setSaving(true); setError(null); setSaveMessage(null);
    try {
      await updateProfile(user.id, { ...form, graduation_year: form.graduation_year ? Number(form.graduation_year) : null });
      await refreshProfile();
      setEditing(false); setSaveMessage('Profile saved successfully.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save your profile.'); }
    finally { setSaving(false); }
  };

  if (profileLoading) return <Box sx={{ p: 4 }}>Loading your profile…</Box>;

  return (
    <Box sx={{ background: '#F8F9FC', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', height: 200, position: 'relative' }}>
        <Box sx={{ position: 'absolute', bottom: -56, left: { xs: 24, md: 56 } }}>
          <Avatar src={profile?.avatar_url ?? undefined} sx={{ width: 112, height: 112, background: 'linear-gradient(135deg,#FF6A00,#F5B800)', fontSize: 36, fontWeight: 700, border: '4px solid #fff' }}>{initials}</Avatar>
        </Box>
        <Button onClick={() => setEditing((value) => !value)} startIcon={<EditIcon />} sx={{ position: 'absolute', bottom: 16, right: 24, color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: 10 }}>{editing ? 'Close Editor' : 'Edit Profile'}</Button>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 6 }, mt: 9, pb: 8 }}>
        {profileError && <Alert severity="warning" sx={{ mb: 2 }}>{profileError}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saveMessage && <Alert severity="success" sx={{ mb: 2 }}>{saveMessage}</Alert>}
        <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid rgba(255,106,0,.14)' }}><CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 1 }}><Typography sx={{ color: C.navy, fontWeight: 700 }}>Profile completion</Typography><Typography sx={{ color: C.saffron, fontWeight: 700 }}>{profileCompletion}%</Typography></Box>
          <Box sx={{ height: 8, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}><Box sx={{ width: `${profileCompletion}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#FF6A00,#F5B800)' }} /></Box>
          <Typography sx={{ mt: 1.5, color: '#777', fontSize: 13 }}>Complete your profile using the information already supported by your account.</Typography>
        </CardContent></Card>
        {editing && (
          <Card sx={{ borderRadius: 4, mb: 3 }}><CardContent sx={{ p: 3 }}>
            <Typography sx={{ color: C.navy, fontWeight: 700, mb: 2 }}>Edit your profile</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Email" value={user?.email ?? ''} InputProps={{ readOnly: true }} helperText="Email is managed by Supabase Auth." /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Full name" value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField select fullWidth size="small" label="Degree" value={form.degree} onChange={(event) => setForm((current) => ({ ...current, degree: event.target.value }))} SelectProps={{ native: true }}>{['', ...DEGREE_OPTIONS].map((degree) => <option key={degree} value={degree}>{degree || 'Select degree'}</option>)}</TextField></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="College / University" value={form.college} onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Autocomplete freeSolo options={LOCATION_OPTIONS} value={form.location} onChange={(_, value) => setForm((current) => ({ ...current, location: value ?? '' }))} onInputChange={(_, value) => setForm((current) => ({ ...current, location: value }))} renderInput={(params) => <TextField {...params} size="small" label="Location" placeholder="Search or enter your city" />} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField select fullWidth size="small" label="Graduation year" value={form.graduation_year} onChange={(event) => setForm((current) => ({ ...current, graduation_year: event.target.value }))} SelectProps={{ native: true }}><option value="">Select year</option>{Array.from({ length: 15 }, (_, index) => new Date().getFullYear() - 5 + index).map((year) => <option key={year} value={year}>{year}</option>)}</TextField></Grid>
              <Grid size={{ xs: 12 }}><TextField fullWidth multiline minRows={4} size="small" label="Bio / About" helperText="Write a short introduction about yourself, your skills, interests, and career goals." value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="GitHub URL" placeholder="Your GitHub profile, e.g. https://github.com/username" value={form.github_url} onChange={(event) => setForm((current) => ({ ...current, github_url: event.target.value }))} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="LinkedIn URL" placeholder="Your LinkedIn profile." value={form.linkedin_url} onChange={(event) => setForm((current) => ({ ...current, linkedin_url: event.target.value }))} /></Grid>
            </Grid>
            <Button onClick={save} disabled={saving || !user} sx={{ mt: 2, color: '#fff', background: C.saffron, borderRadius: 10 }}>{saving ? 'Saving…' : 'Save Profile'}</Button>
          </CardContent></Card>
        )}

        <Card sx={{ borderRadius: 4, mb: 3 }}><CardContent sx={{ p: 3 }}>
          <Typography sx={{ color: C.navy, fontWeight: 700, mb: 1 }}>My resume</Typography>
          <Typography sx={{ color: '#777', fontSize: 13, mb: 2 }}>Upload a private PDF, DOC, or DOCX file. Resume text is not stored in the profile form; ATS analysis uses the existing saved resume pipeline.</Typography>
          <Button component="label" variant="contained" disabled={resumeUploading || portfolioLoading} sx={{ color: '#fff', background: C.saffron, borderRadius: 10 }}>{resumeUploading ? 'Uploading…' : resumeVersions.some((version) => Boolean(version.file_url)) ? 'Replace resume' : 'Upload Resume'}<input hidden type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadResume(file); event.target.value = ''; }} /></Button>
          {resumeVersions.filter((version) => version.file_url).slice(0, 1).map((version) => <Box key={version.id} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><Typography sx={{ color: C.navy, fontWeight: 600 }}>{version.title}</Typography><Chip label="Uploaded / available" size="small" color="success" /><Button size="small" color="error" onClick={() => void removeResume(version)}>Remove Resume</Button></Box>)}
          <Typography sx={{ mt: 1.5, color: '#888', fontSize: 12 }}>Files remain private and are stored under your authenticated user path in the existing `resume` bucket.</Typography>
          {resumeVersions.some((version) => version.file_url) && <>
            <Divider sx={{ my: 2.5 }} />
            <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 14, mb: 1 }}>Uploaded versions</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {resumeVersions.filter((version) => version.file_url).map((version) => <Chip key={version.id} label={`${version.title} · ${new Date(version.created_at).toLocaleDateString()}`} variant="outlined" />)}
            </Box>
          </>}
        </CardContent></Card>

        <Card sx={{ borderRadius: 4, mb: 3 }}><CardContent sx={{ p: 3 }}>
          <Typography sx={{ color: C.navy, fontWeight: 700, mb: 1 }}>My skills</Typography>
          <Typography sx={{ color: '#777', fontSize: 13, mb: 2 }}>Skills are private to your account and saved through Supabase.</Typography>
          <Box sx={{ position: 'relative', display: 'flex', gap: 1.5 }}>
            <TextField fullWidth size="small" label="Search and add your skills" placeholder="Type Python, data, SQL…" value={skillName} onChange={(event) => updateSkillName(event.target.value)} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setHighlightedSkill((value) => Math.min(value + 1, Math.max(skillSuggestions.length - 1, 0))); } else if (event.key === 'ArrowUp') { event.preventDefault(); setHighlightedSkill((value) => Math.max(value - 1, 0)); } else if (event.key === 'Enter') { event.preventDefault(); if (skillSuggestions[highlightedSkill]) chooseSkill(skillSuggestions[highlightedSkill]); else void saveSkill(); } }} />
            <Button onClick={() => void saveSkill()} disabled={skillSaving || !skillName.trim()} sx={{ color: '#fff', background: C.saffron, borderRadius: 2, px: 3 }}>{skillSaving ? 'Saving…' : 'Add'}</Button>
            {skillSuggestions.length > 0 && <Box role="listbox" sx={{ position: 'absolute', zIndex: 5, top: 58, left: 0, right: 90, borderRadius: 2, background: '#fff', boxShadow: '0 8px 28px rgba(11,25,87,.14)', border: '1px solid rgba(11,25,87,.1)', overflow: 'hidden' }}>{skillSuggestions.map((suggestion, index) => <Button key={suggestion} role="option" aria-selected={highlightedSkill === index} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSkill(suggestion)} sx={{ display: 'block', width: '100%', px: 2, py: 1, textAlign: 'left', justifyContent: 'flex-start', color: C.navy, textTransform: 'none', background: highlightedSkill === index ? 'rgba(255,106,0,.08)' : 'transparent' }}>{suggestion}</Button>)}</Box>}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {portfolioLoading ? <Typography sx={{ color: '#888', fontSize: 13 }}>Loading skills…</Typography> : skills.length === 0 ? <Typography sx={{ color: '#888', fontSize: 13 }}>No skills saved yet.</Typography> : skills.map((skill) => <Chip key={skill.id} label={skill.name} onDelete={() => void removeSkill(skill.id)} onClick={() => editSkill(skill)} sx={{ cursor: 'pointer' }} />)}
          </Box>
        </CardContent></Card>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 4, mb: 3 }}><CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: C.navy, fontWeight: 700, fontSize: 22 }}>{name}</Typography>
              <Typography sx={{ color: '#777', mb: 2 }}>{profile?.degree || 'Student'}{profile?.college ? ` · ${profile.college}` : ''}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography sx={{ color: '#777', fontSize: 13 }}>{profile?.bio || 'Add a short bio from Edit Profile.'}</Typography>
            </CardContent></Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 4, mb: 3 }}><CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: C.navy, fontWeight: 700, mb: 2 }}>Education</Typography>
              <Typography sx={{ fontWeight: 700 }}>{profile?.degree || 'Education not added'}</Typography>
              <Typography sx={{ color: '#777' }}>{profile?.college || 'Add your college in Edit Profile'}</Typography>
              <Typography sx={{ color: '#999', fontSize: 13 }}>{profile?.graduation_year || '—'}</Typography>
            </CardContent></Card>

            <Card sx={{ borderRadius: 4, mb: 3 }}><CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}><Typography sx={{ color: C.navy, fontWeight: 700 }}>PROJECTS</Typography><Button size="small" onClick={() => setAddingProject((value) => !value)}>+ Add Project</Button></Box>
              {addingProject && <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: '#F8F9FC' }}><Grid container spacing={1.5}><Grid size={{ xs: 12 }}><TextField fullWidth size="small" label="Project title" value={projectForm.title} onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))} /></Grid><Grid size={{ xs: 12 }}><TextField fullWidth size="small" multiline minRows={2} label="Description" value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} /></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Technologies (comma separated)" value={projectForm.tech_stack} onChange={(event) => setProjectForm((current) => ({ ...current, tech_stack: event.target.value }))} /></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Project URL" value={projectForm.project_url} onChange={(event) => setProjectForm((current) => ({ ...current, project_url: event.target.value }))} /></Grid></Grid><Button variant="contained" onClick={() => void addProject()} disabled={addingProject || !projectForm.title.trim()} sx={{ mt: 2, background: C.saffron }}>Save Project</Button></Box>}
              {portfolioLoading ? <Typography sx={{ color: '#888' }}>Loading projects…</Typography> : projects.length === 0 ? <Typography sx={{ color: '#888' }}>No projects added yet.</Typography> : projects.map((project) => (
                <Box key={project.id} sx={{ mb: 2 }}>
                  <Typography sx={{ color: C.navy, fontWeight: 700 }}>{project.title}</Typography>
                  <Typography sx={{ color: '#666', fontSize: 13 }}>{project.description || 'No description added.'}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>{project.tech_stack.map((skill) => <Chip key={skill} label={skill} size="small" />)}</Box>
                  {project.project_url && <Button href={project.project_url} target="_blank" rel="noreferrer" size="small" sx={{ mt: 1, textTransform: 'none' }}>View project ↗</Button>}
                </Box>
              ))}
            </CardContent></Card>

            <Card sx={{ borderRadius: 4 }}><CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}><Typography sx={{ color: C.navy, fontWeight: 700 }}>CERTIFICATIONS</Typography><Button size="small" onClick={() => setAddingCertification((value) => !value)}>+ Add Certification</Button></Box>
              {addingCertification && <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: '#F8F9FC' }}><Grid container spacing={1.5}><Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Certification name" value={certificationForm.name} onChange={(event) => setCertificationForm((current) => ({ ...current, name: event.target.value }))} /></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Provider" value={certificationForm.provider} onChange={(event) => setCertificationForm((current) => ({ ...current, provider: event.target.value }))} /></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Issue year" inputProps={{ inputMode: 'numeric' }} value={certificationForm.issue_year} onChange={(event) => setCertificationForm((current) => ({ ...current, issue_year: event.target.value }))} /></Grid><Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Credential URL (optional)" value={certificationForm.credential_url} onChange={(event) => setCertificationForm((current) => ({ ...current, credential_url: event.target.value }))} /></Grid></Grid><Button variant="contained" onClick={() => void addCertification()} disabled={addingCertification || !certificationForm.name.trim() || !certificationForm.provider.trim()} sx={{ mt: 2, background: C.saffron }}>Save Certification</Button></Box>}
              {portfolioLoading ? <Typography sx={{ color: '#888' }}>Loading certifications…</Typography> : certifications.length === 0 ? <Typography sx={{ color: '#888' }}>No certifications added yet.</Typography> : certifications.map((certification) => (
                <Box key={certification.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <EmojiEventsIcon sx={{ color: C.sky }} />
                  <Box sx={{ flex: 1 }}><Typography sx={{ color: C.navy, fontWeight: 700 }}>{certification.name}</Typography><Typography sx={{ color: '#888', fontSize: 13 }}>{certification.provider}{certification.issue_date ? ` · ${new Date(certification.issue_date).getFullYear()}` : ''}</Typography>{certification.credential_url && <Button href={certification.credential_url} target="_blank" rel="noreferrer" size="small" sx={{ p: 0, minWidth: 0, textTransform: 'none' }}>View credential ↗</Button>}</Box>
                  <Chip label={certification.verified ? 'Verified' : 'Added'} size="small" sx={{ color: certification.verified ? C.emerald : '#777' }} />
                </Box>
              ))}
            </CardContent></Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
