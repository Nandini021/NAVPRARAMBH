import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import LanguageIcon from '@mui/icons-material/Language';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import PaletteIcon from '@mui/icons-material/Palette';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Alert from '@mui/material/Alert';
import { useAuth } from '../auth/AuthProvider';
import { getUserSettings, updateUserSettings } from '../lib/db';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Odia', 'Assamese'];

const SETTINGS_MENU = [
  { label: 'Language & Region', icon: <LanguageIcon />, color: C.navy },
  { label: 'Accessibility', icon: <AccessibilityNewIcon />, color: C.sky },
  { label: 'Security', icon: <SecurityIcon />, color: C.emerald },
  { label: 'Notifications', icon: <NotificationsIcon />, color: C.saffron },
  { label: 'Privacy', icon: <PrivacyTipIcon />, color: '#9B59B6' },
  { label: 'Appearance', icon: <PaletteIcon />, color: C.golden },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState('Language & Region');
  const [lang, setLang] = useState('English');
  const [notifs, setNotifs] = useState({ jobs: true, courses: true, ai: true, sms: false, email: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoading(true);
    getUserSettings(user.id)
      .then((settings) => {
        if (!mounted || !settings) return;
        setLang(settings.language);
        setNotifs({ jobs: settings.notifications_jobs, courses: settings.notifications_courses, ai: settings.notifications_ai, sms: settings.notifications_sms, email: settings.notifications_email });
      })
      .catch(() => { if (mounted) setError('Unable to load your settings.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      await updateUserSettings(user.id, { language: lang, notifications_jobs: notifs.jobs, notifications_courses: notifs.courses, notifications_ai: notifs.ai, notifications_sms: notifs.sms, notifications_email: notifs.email });
      setSuccess('Settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your settings.');
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading your settings…</Box>;

  return (
    <Box sx={{ background: '#F8F9FC', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg,#0B1957,#1A2E7E)', py: { xs: 5, md: 6 }, px: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Typography variant="h3" sx={{ color: '#fff', fontSize: { xs: 24, md: 32 } }}>Settings</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontFamily: '"Outfit",sans-serif', fontSize: 14, mt: 0.5 }}>Manage your account, preferences, and privacy</Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 3, md: 6 }, py: 5 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 24px rgba(11,25,87,0.07)' }}>
              <List disablePadding>
                {SETTINGS_MENU.map((item, i) => (
                  <Box key={item.label}>
                    <ListItem
                      onClick={() => setActive(item.label)}
                      sx={{
                        cursor: 'pointer', px: 2.5, py: 1.8, borderRadius: 2, mx: 1, my: 0.3,
                        background: active === item.label ? 'rgba(11,25,87,0.06)' : 'transparent',
                        '&:hover': { background: 'rgba(11,25,87,0.04)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: active === item.label ? item.color : 'rgba(11,25,87,0.4)' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontFamily: '"Outfit",sans-serif', fontWeight: active === item.label ? 700 : 400, fontSize: 14, color: active === item.label ? C.navy : '#666' }} />
                      {active === item.label && <ArrowForwardIosIcon sx={{ fontSize: 11, color: C.navy }} />}
                    </ListItem>
                    {i < SETTINGS_MENU.length - 1 && <Divider sx={{ mx: 2, opacity: 0.07 }} />}
                  </Box>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card sx={{ borderRadius: 4, background: '#fff', boxShadow: '0 4px 24px rgba(11,25,87,0.07)', minHeight: 400 }}>
              <CardContent sx={{ p: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {active === 'Language & Region' && (
                  <Box>
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 20, color: C.navy, mb: 0.5 }}>Language & Region</Typography>
                    <Typography sx={{ color: '#888', fontFamily: '"Outfit",sans-serif', fontSize: 14, mb: 4 }}>Choose your preferred language for NAVPRARAMBH</Typography>
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 14, color: C.navy, mb: 1.5 }}>Interface Language</Typography>
                    <FormControl sx={{ minWidth: 260, mb: 4 }}>
                      <Select value={lang} onChange={e => setLang(e.target.value)} sx={{ borderRadius: 3, fontFamily: '"Outfit",sans-serif' }}>
                        {LANGUAGES.map(l => <MenuItem key={l} value={l} sx={{ fontFamily: '"Outfit",sans-serif' }}>{l}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 14, color: C.navy, mb: 2 }}>Quick Select</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {LANGUAGES.map(l => (
                        <Chip key={l} label={l} onClick={() => setLang(l)} sx={{ fontFamily: '"Outfit",sans-serif', cursor: 'pointer', background: lang === l ? C.navy : 'rgba(11,25,87,0.05)', color: lang === l ? '#fff' : C.navy, border: `1px solid ${lang === l ? C.navy : 'rgba(11,25,87,0.1)'}` }} />
                      ))}
                    </Box>
                    <Button onClick={saveSettings} disabled={saving || !user} className="btn-gradient" sx={{ mt: 3, color: '#fff', borderRadius: 10 }}>{saving ? 'Saving…' : 'Save Settings'}</Button>
                  </Box>
                )}

                {active === 'Notifications' && (
                  <Box>
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 20, color: C.navy, mb: 0.5 }}>Notifications</Typography>
                    <Typography sx={{ color: '#888', fontFamily: '"Outfit",sans-serif', fontSize: 14, mb: 4 }}>Control what you hear from us</Typography>
                    {[
                      { key: 'jobs', label: 'Job & Internship Alerts', desc: 'Get notified about new matching opportunities' },
                      { key: 'courses', label: 'Course Updates', desc: 'New courses, enrollments, completions' },
                      { key: 'ai', label: 'SIDDHI AI Insights', desc: 'Weekly career tips and resume suggestions' },
                      { key: 'email', label: 'Email Digest', desc: 'Weekly summary of activity' },
                      { key: 'sms', label: 'SMS Alerts', desc: 'Important updates via SMS' },
                    ].map(item => (
                      <Box key={item.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, borderBottom: '1px solid rgba(11,25,87,0.07)' }}>
                        <Box>
                          <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 14, color: C.navy }}>{item.label}</Typography>
                          <Typography sx={{ fontSize: 12, color: '#888', fontFamily: '"Outfit",sans-serif' }}>{item.desc}</Typography>
                        </Box>
                        <Switch checked={notifs[item.key as keyof typeof notifs]} onChange={(e) => setNotifs(p => ({ ...p, [item.key]: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: C.saffron }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { background: C.saffron } }} />
                      </Box>
                    ))}
                    <Button onClick={saveSettings} disabled={saving || !user} className="btn-gradient" sx={{ mt: 3, color: '#fff', borderRadius: 10 }}>{saving ? 'Saving…' : 'Save Settings'}</Button>
                  </Box>
                )}

                {active === 'Security' && (
                  <Box>
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 20, color: C.navy, mb: 0.5 }}>Security</Typography>
                    <Typography sx={{ color: '#888', fontFamily: '"Outfit",sans-serif', fontSize: 14, mb: 4 }}>Keep your account safe</Typography>
                    {[
                      { label: 'Change Password', desc: 'Update your account password', btn: 'Coming soon' },
                      { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', btn: 'Coming soon' },
                      { label: 'Active Sessions', desc: 'Manage devices logged into your account', btn: 'Coming soon' },
                      { label: 'Login History', desc: 'Review recent login activity', btn: 'Coming soon' },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, borderBottom: '1px solid rgba(11,25,87,0.07)' }}>
                        <Box>
                          <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 14, color: C.navy }}>{item.label}</Typography>
                          <Typography sx={{ fontSize: 12, color: '#888', fontFamily: '"Outfit",sans-serif' }}>{item.desc}</Typography>
                        </Box>
                        <Button size="small" variant="outlined" sx={{ borderRadius: 10, borderColor: 'rgba(11,25,87,0.15)', color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 12 }}>{item.btn}</Button>
                      </Box>
                    ))}
                  </Box>
                )}

                {!['Language & Region', 'Notifications', 'Security'].includes(active) && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <Typography sx={{ fontSize: 48, mb: 2 }}>⚙️</Typography>
                    <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 18, color: C.navy, mb: 1 }}>{active}</Typography>
                    <Typography sx={{ color: '#888', fontFamily: '"Outfit",sans-serif', fontSize: 14 }}>Settings for {active} coming soon.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
