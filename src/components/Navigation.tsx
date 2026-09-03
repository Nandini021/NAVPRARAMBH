import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Collapse from '@mui/material/Collapse';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MapIcon from '@mui/icons-material/Map';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const NAV_ITEMS = [
  {
    label: 'Explore',
    items: [
      { label: 'Jobs', path: '/jobs', icon: <WorkIcon sx={{ fontSize: 16 }} /> },
      { label: 'Internships', path: '/internships', icon: <PersonOutlineIcon sx={{ fontSize: 16 }} /> },
      { label: 'Career Explorer', path: '/careers', icon: <MapIcon sx={{ fontSize: 16 }} /> },
      { label: 'Roadmaps', path: '/careers', icon: <MapIcon sx={{ fontSize: 16 }} /> },
      { label: 'Government Opportunities', path: '/government-opportunities', icon: <AccountBalanceIcon sx={{ fontSize: 16 }} /> },
    ],
  },
  {
    label: 'Learn',
    items: [
      { label: 'Courses', path: '/courses', icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
      { label: 'Certifications', path: '/certifications', icon: <EmojiEventsIcon sx={{ fontSize: 16 }} /> },
    ],
  },
  { label: 'Placement Prep', path: '/placement-prep', icon: null },
  { label: 'Knowledge Games', path: '/games', icon: <SportsEsportsIcon sx={{ fontSize: 16 }} /> },
  {
    label: 'Community',
    items: [
      { label: 'Students', path: '/dashboard', icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
      { label: 'Company', path: '/login', icon: <BusinessIcon sx={{ fontSize: 16 }} /> },
      { label: 'College', path: '/login', icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
    ],
  },
];

const C = { navy: '#0B1957', saffron: '#FF6A00', golden: '#F5B800' };

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const elevated = useScrollTrigger({ disableHysteresis: true, threshold: 20 });
  const [anchorEl, setAnchorEl] = useState<{ [k: string]: HTMLElement | null }>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const openMenu = (key: string, el: HTMLElement) => setAnchorEl(p => ({ ...p, [key]: el }));
  const closeMenu = (key: string) => setAnchorEl(p => ({ ...p, [key]: null }));

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: elevated ? 'rgba(255,253,248,0.92)' : 'rgba(255,253,248,0.80)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: elevated ? '1px solid rgba(11,25,87,0.08)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 5 }, py: 0.5, minHeight: { xs: 64, md: 72 } }}>
          {/* LOGO */}
          <Box component="button" type="button" aria-label="Go to NAVPRARAMBH homepage" onClick={() => navigate('/')} sx={{ border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', mr: { xs: 0, md: 3 }, p: 0 }}>
            <Box sx={{ position: 'relative', width: 40, height: 40 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6A00 0%,#F5B800 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(255,106,0,0.35)' }}>
                <Typography sx={{ color: '#fff', fontSize: 18, fontFamily: '"Cinzel",serif', fontWeight: 700, lineHeight: 1 }}>N</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: { xs: 16, md: 18 }, color: C.navy, letterSpacing: 1.5, lineHeight: 1.1 }}>NAVPRARAMBH</Typography>
              <Typography sx={{ fontFamily: '"Fraunces",serif', fontSize: 9, color: C.saffron, letterSpacing: 0.5, lineHeight: 1, fontStyle: 'italic' }}>नवप्रारंभ</Typography>
            </Box>
          </Box>

          {/* DESKTOP NAV */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.3 }}>
            {NAV_ITEMS.map((item) =>
              item.items ? (
                <Box key={item.label}>
                  <Button
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16, transition: 'transform 0.2s', transform: anchorEl[item.label] ? 'rotate(180deg)' : 'none' }} />}
                    onClick={(e) => openMenu(item.label, e.currentTarget)}
                    sx={{ color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 500, fontSize: 14, borderRadius: 10, px: 1.5, py: 1, '&:hover': { background: 'rgba(11,25,87,0.05)' } }}
                  >
                    {item.label}
                  </Button>
                  <Menu
                    anchorEl={anchorEl[item.label]}
                    open={Boolean(anchorEl[item.label])}
                    onClose={() => closeMenu(item.label)}
                    PaperProps={{ sx: { mt: 1, borderRadius: 3, minWidth: 200, boxShadow: '0 8px 40px rgba(11,25,87,0.12)', border: '1px solid rgba(11,25,87,0.07)', background: 'rgba(255,253,248,0.98)' } }}
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                  >
                    {item.items.map((sub) => (
                      <MenuItem key={sub.label} onClick={() => { closeMenu(item.label); navigate(sub.path); }} sx={{ gap: 1.5, py: 1.5, px: 2.5, borderRadius: 2, mx: 1, mb: 0.5, fontFamily: '"Outfit",sans-serif', fontWeight: 500, fontSize: 14, color: C.navy, '&:hover': { background: 'rgba(255,106,0,0.06)', color: C.saffron } }}>
                        <Box sx={{ color: C.saffron }}>{sub.icon}</Box>
                        {sub.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              ) : (
                <Button key={item.label} onClick={() => navigate(item.path!)} sx={{ color: location.pathname === item.path ? C.saffron : C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 500, fontSize: 14, borderRadius: 10, px: 1.5, py: 1, background: location.pathname === item.path ? 'rgba(255,106,0,0.07)' : 'transparent', '&:hover': { background: 'rgba(11,25,87,0.05)' } }}>
                  {item.label}
                </Button>
              )
            )}
          </Box>

          {/* RIGHT ACTIONS */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Button onClick={() => window.dispatchEvent(new Event('navprarambh:open-siddhi'))} startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} sx={{ color: C.saffron, fontFamily: '"Outfit",sans-serif', fontWeight: 600, fontSize: 13, borderRadius: 10, px: 1.5, '&:hover': { background: 'rgba(255,106,0,0.06)' } }}>
              SIDDHI AI
            </Button>
            <IconButton onClick={() => navigate('/settings')} aria-label="Open language settings" title="Language and region settings" sx={{ color: C.navy, '&:hover': { background: 'rgba(11,25,87,0.05)' } }}>
              <LanguageIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Button onClick={() => navigate('/login')} variant="outlined" sx={{ borderColor: 'rgba(11,25,87,0.2)', color: C.navy, fontFamily: '"Outfit",sans-serif', fontWeight: 600, borderRadius: 12, px: 2, py: 0.8, '&:hover': { borderColor: C.navy, background: 'rgba(11,25,87,0.04)' } }}>
              Student Login
            </Button>
            <Button onClick={() => navigate('/login')} className="btn-gradient" sx={{ color: '#fff', fontFamily: '"Outfit",sans-serif', fontWeight: 600, borderRadius: 12, px: 2.5, py: 0.8 }}>
              Get Started
            </Button>
          </Box>

          {/* MOBILE HAMBURGER */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: C.navy }}><MenuIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 300, background: '#FFFDF8', boxShadow: '-8px 0 40px rgba(11,25,87,0.1)' } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: '"Cinzel",serif', fontWeight: 700, color: C.navy, fontSize: 16 }}>NAVPRARAMBH</Typography>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: C.navy }}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ opacity: 0.12 }} />
        <List sx={{ px: 2, mt: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Box key={item.label}>
              {item.items ? (
                <>
                  <ListItem onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)} sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { background: 'rgba(11,25,87,0.04)' } }}>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, color: C.navy }} />
                    <KeyboardArrowDownIcon sx={{ color: C.navy, transition: 'transform 0.2s', transform: mobileExpanded === item.label ? 'rotate(180deg)' : 'none', fontSize: 18 }} />
                  </ListItem>
                  <Collapse in={mobileExpanded === item.label}>
                    {item.items.map((sub) => (
                      <ListItem key={sub.label} onClick={() => { navigate(sub.path); setMobileOpen(false); }} sx={{ pl: 4, borderRadius: 2, cursor: 'pointer', '&:hover': { background: 'rgba(255,106,0,0.06)' } }}>
                        <ListItemText primary={sub.label} primaryTypographyProps={{ fontFamily: '"Outfit",sans-serif', fontSize: 14, color: C.navy }} />
                      </ListItem>
                    ))}
                  </Collapse>
                </>
              ) : (
                <ListItem onClick={() => { navigate(item.path!); setMobileOpen(false); }} sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { background: 'rgba(11,25,87,0.04)' } }}>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontFamily: '"Outfit",sans-serif', fontWeight: 600, color: C.navy }} />
                </ListItem>
              )}
            </Box>
          ))}
        </List>
        <Divider sx={{ opacity: 0.12, mx: 2 }} />
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button fullWidth variant="outlined" onClick={() => { navigate('/login'); setMobileOpen(false); }} sx={{ borderColor: 'rgba(11,25,87,0.2)', color: C.navy, borderRadius: 12, fontFamily: '"Outfit",sans-serif', fontWeight: 600 }}>Student Login</Button>
          <Button fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }} className="btn-gradient" sx={{ color: '#fff', borderRadius: 12, fontFamily: '"Outfit",sans-serif', fontWeight: 600 }}>Get Started</Button>
        </Box>
      </Drawer>

      {/* spacer */}
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />
    </>
  );
}
