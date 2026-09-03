import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import SchoolIcon from '@mui/icons-material/School';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800', emerald: '#0A9B5C', sky: '#60B2E5' };

const LOGIN_TYPES = [
  { label: 'Student', icon: <SchoolIcon />, color: C.navy },
];

type AuthMode = 'email' | 'signup' | 'otp' | 'forgot';

function getAuthRedirectUrl(path: '/student-dashboard' | '/login'): string {
  const configuredOrigin = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim();
  const origin = configuredOrigin || window.location.origin;
  return new URL(path, origin.endsWith('/') ? origin : `${origin}/`).toString();
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userType, setUserType] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem('np_auth_landing') === 'true') {
      sessionStorage.removeItem('np_auth_landing');
      navigate('/', { replace: true });
      return;
    }
    navigate('/student-dashboard', { replace: true });
  }, [user, navigate]);

  const enterPlatformThroughHome = () => {
    sessionStorage.removeItem('np_intro');
    sessionStorage.setItem('np_auth_landing', 'true');
  };

  const handleEmailAuth = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error('Enter your email address.');
      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: pass,
          // The database trigger assigns every self-registered user the student role.
          // Never send a role from the browser, even if the visual login selector changes.
          options: { data: { full_name: normalizedEmail.split('@')[0] } },
        });
        if (signUpError) throw signUpError;
        if (data.session) { enterPlatformThroughHome(); navigate('/', { replace: true }); }
        else setNotice('Account created. Check your email to confirm your account before signing in.');
      } else {
        enterPlatformThroughHome();
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: pass });
        if (signInError) throw signInError;
        navigate('/', { replace: true });
      }
    } catch (authError) {
      sessionStorage.removeItem('np_auth_landing');
      const authMessage = authError instanceof Error ? authError.message : 'Authentication failed. Please try again.';
      setError(authMessage === 'Email not confirmed'
        ? 'Please confirm your email from the link we sent, then sign in again.'
        : authMessage === 'Invalid login credentials'
          ? 'Email or password is incorrect. If you just signed up, confirm your email first.'
          : authMessage);
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: getAuthRedirectUrl('/login'),
      });
      if (resetError) throw resetError;
      setNotice('If that email is registered, a password reset link has been sent.');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to send the reset link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg,#FFF8F0 0%,#FFFDF8 50%,#F8FBFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box sx={{ position: 'fixed', top: 80, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,184,0,0.08) 0%,transparent 65%)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,155,92,0.06) 0%,transparent 65%)' }} />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 1000, position: 'relative', zIndex: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3, color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 500, '&:hover': { background: 'rgba(11,25,87,0.04)' } }}>
          Back to Home
        </Button>

        <Grid container spacing={4} alignItems="stretch">
          {/* Left panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ background: 'linear-gradient(160deg,#0B1957 0%,#1A2E7E 100%)', borderRadius: 5, p: 5, height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,184,0,0.12) 0%,transparent 65%)' }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00,#F5B800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#fff', fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: 20 }}>N</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, color: '#fff', fontSize: 16, letterSpacing: 1.5 }}>NAVPRARAMBH</Typography>
                    <Typography sx={{ fontFamily: '"Fraunces",serif', fontStyle: 'italic', color: 'rgba(245,184,0,0.7)', fontSize: 11 }}>नवप्रारंभ</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: '"Fraunces",serif', fontWeight: 700, color: '#fff', fontSize: 26, lineHeight: 1.3, mb: 2 }}>
                  Welcome Back to Your Career Journey
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Outfit",sans-serif', fontSize: 14, lineHeight: 1.8 }}>
                  Sign in to access your personalized dashboard, career roadmaps, SIDDHI AI, and everything you need to shine.
                </Typography>
              </Box>
              {/* Login type selector */}
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: '"Outfit",sans-serif', letterSpacing: 1.5, mb: 2 }}>SIGN IN AS</Typography>
                <Grid container spacing={1}>
                  {LOGIN_TYPES.map((t, i) => (
                    <Grid key={t.label} size={{ xs: 6 }}>
                      <Box
                        onClick={() => setUserType(i)}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1, p: 1.2,
                          borderRadius: 2, cursor: 'pointer',
                          background: userType === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${userType === i ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                          transition: 'all 0.2s',
                          '&:hover': { background: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        <Box sx={{ color: userType === i ? C.golden : 'rgba(255,255,255,0.5)', '& svg': { fontSize: 14 } }}>{t.icon}</Box>
                        <Typography sx={{ color: userType === i ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: '"Outfit",sans-serif', fontWeight: userType === i ? 600 : 400 }}>{t.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Grid>

          {/* Right panel */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ background: '#fff', borderRadius: 5, p: { xs: 4, md: 5 }, boxShadow: '0 8px 48px rgba(11,25,87,0.08)', border: '1px solid rgba(11,25,87,0.07)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 22, color: C.navy, mb: 0.5 }}>
                {authMode === 'forgot' ? 'Reset Password' : authMode === 'signup' ? 'Create Student Account' : 'Student Sign In'}
              </Typography>
              <Typography sx={{ color: '#777', fontFamily: '"Outfit",sans-serif', fontSize: 13, mb: 3.5 }}>
                {authMode === 'forgot' ? "We'll send a reset link to your email" : 'Continue your career journey'}
              </Typography>

              {/* Social login */}
              {authMode === 'email' && (
                <>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                    <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ borderColor: 'rgba(11,25,87,0.15)', color: C.navy, borderRadius: 12, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13, py: 1.2, '&:hover': { borderColor: C.saffron, color: C.saffron, background: 'rgba(255,106,0,0.03)' } }}>
                      Google
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<GitHubIcon />} sx={{ borderColor: 'rgba(11,25,87,0.15)', color: C.navy, borderRadius: 12, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13, py: 1.2, '&:hover': { borderColor: C.navy, background: 'rgba(11,25,87,0.04)' } }}>
                      GitHub
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 3, '&::before,&::after': { borderColor: 'rgba(11,25,87,0.08)' } }}>
                    <Typography sx={{ px: 1.5, color: '#aaa', fontSize: 11, fontFamily: '"Outfit",sans-serif' }}>or continue with</Typography>
                  </Divider>
                </>
              )}

              {/* Auth mode tabs */}
              {authMode !== 'forgot' && (
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {(['email', 'otp'] as AuthMode[]).map(m => (
                    <Button key={m} onClick={() => setAuthMode(m)} sx={{
                      flex: 1, borderRadius: 10, py: 1, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 12,
                      background: authMode === m ? 'rgba(11,25,87,0.07)' : 'transparent',
                      color: authMode === m ? C.navy : '#888',
                      border: `1px solid ${authMode === m ? 'rgba(11,25,87,0.15)' : 'transparent'}`,
                    }}>
                      {m === 'email' ? <><EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />Email</> : <><PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />OTP</>}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Form */}
              {(authMode === 'email' || authMode === 'signup') && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Email Address" fullWidth value={email} onChange={e => setEmail(e.target.value)} type="email" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                  <TextField
                    label="Password" fullWidth value={pass} onChange={e => setPass(e.target.value)}
                    type={showPass ? 'text' : 'password'} size="small"
                    InputProps={{ endAdornment: <IconButton size="small" onClick={() => setShowPass(p => !p)}>{showPass ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}</IconButton> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                  {authMode === 'email' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button onClick={() => { setError(null); setAuthMode('forgot'); }} sx={{ fontSize: 12, color: C.saffron, fontFamily: '"Outfit",sans-serif', textTransform: 'none', p: 0, '&:hover': { background: 'none' } }}>Forgot Password?</Button>
                    </Box>
                  )}
                  {error && <Typography role="alert" sx={{ color: '#B42318', fontSize: 12 }}>{error}</Typography>}
                  {notice && <Typography role="status" sx={{ color: C.emerald, fontSize: 12 }}>{notice}</Typography>}
                  <Button className="btn-gradient" fullWidth size="large" disabled={busy} onClick={handleEmailAuth} sx={{ color: '#fff', borderRadius: 14, py: 1.4, fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 15 }}>
                    {busy ? 'Please wait…' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </Button>
                  {authMode === 'signup' && <Button onClick={() => setAuthMode('email')} sx={{ color: '#888', fontFamily: '"Outfit",sans-serif', textTransform: 'none', fontSize: 13 }}>Back to Sign In</Button>}
                </Box>
              )}

              {authMode === 'otp' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Phone Number" fullWidth value={phone} onChange={e => setPhone(e.target.value)} size="small" placeholder="+91 98765 43210" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                  {otpSent && <TextField label="Enter OTP" fullWidth value={otp} onChange={e => setOtp(e.target.value)} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />}
                  <Button
                    className={otpSent ? 'btn-gradient' : 'btn-navy'}
                    fullWidth size="large"
                    onClick={() => { setError('Phone OTP is not enabled in this project yet. Use email and password.'); setOtpSent(true); }}
                    sx={{ color: '#fff', borderRadius: 14, py: 1.4, fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: 15 }}
                  >
                    {otpSent ? 'Verify & Sign In' : 'Send OTP'}
                  </Button>
                </Box>
              )}

              {authMode === 'forgot' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Email Address" fullWidth value={email} onChange={e => setEmail(e.target.value)} type="email" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                  <Button className="btn-gradient" fullWidth size="large" disabled={busy} onClick={handlePasswordReset} sx={{ color: '#fff', borderRadius: 14, py: 1.4, fontFamily: '"Outfit",sans-serif', fontWeight: 700 }}>Send Reset Link</Button>
                  {error && <Typography role="alert" sx={{ color: '#B42318', fontSize: 12 }}>{error}</Typography>}
                  {notice && <Typography role="status" sx={{ color: C.emerald, fontSize: 12 }}>{notice}</Typography>}
                  <Button onClick={() => setAuthMode('email')} sx={{ color: '#888', fontFamily: '"Outfit",sans-serif', textTransform: 'none', fontSize: 13 }}>Back to Sign In</Button>
                </Box>
              )}

              <Divider sx={{ my: 3, '&::before,&::after': { borderColor: 'rgba(11,25,87,0.07)' } }}>
                <Typography sx={{ px: 1, color: '#bbb', fontSize: 11, fontFamily: '"Outfit",sans-serif' }}>new here?</Typography>
              </Divider>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { setError(null); setNotice(null); setAuthMode('signup'); }}
                sx={{ borderColor: 'rgba(11,25,87,0.15)', color: C.navy, borderRadius: 14, py: 1.2, fontFamily: '"Outfit",sans-serif', fontWeight: 600, '&:hover': { borderColor: C.navy, background: 'rgba(11,25,87,0.03)' } }}
              >
                Create Free Account
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
