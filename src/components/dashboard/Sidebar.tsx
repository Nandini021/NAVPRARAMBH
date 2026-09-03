import { Box, Avatar, Typography, Stack, Divider, Chip, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon fontSize="small" /> },
  { label: 'Jobs', icon: <WorkIcon fontSize="small" /> },
  { label: 'Courses', icon: <SchoolIcon fontSize="small" /> },
  { label: 'Roadmap', icon: <TimelineIcon fontSize="small" /> },
  { label: 'SIDDHI Studio', icon: <AutoAwesomeIcon fontSize="small" /> },
  { label: 'Profile', icon: <AccountCircleIcon fontSize="small" /> },
  { label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
];

export default function Sidebar() {
  return (
    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
      <Box sx={{ position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
        <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.88)', boxShadow: '0 24px 60px rgba(11,25,87,0.05)', border: '1px solid rgba(11,25,87,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg,#FF6A00,#F5B800)', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>A</Avatar>
            <Box>
              <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 16, color: '#0B1957' }}>Arjun Mehta</Typography>
              <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: '#5D6C8A' }}>Computer Science · Final Year</Typography>
            </Box>
          </Box>

          <Stack spacing={1.25}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                fullWidth
                variant="text"
                startIcon={item.icon}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  color: '#1A2E7E',
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 600,
                  py: 1.4,
                  borderRadius: 3,
                  '&:hover': { background: 'rgba(96,178,229,0.08)' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Divider sx={{ my: 3, borderColor: 'rgba(11,25,87,0.08)' }} />

          <Stack spacing={1}>
            <Chip label="Streak 14" sx={{ background: 'rgba(255,106,0,0.08)', color: '#C75D00', fontWeight: 700, fontFamily: '"Outfit", sans-serif' }} />
            <Chip label="XP Level 8" sx={{ background: 'rgba(10,155,92,0.08)', color: '#0A9B5C', fontWeight: 700, fontFamily: '"Outfit", sans-serif' }} />
            <Chip label="Premium Learner" sx={{ background: 'rgba(11,25,87,0.08)', color: '#0B1957', fontWeight: 700, fontFamily: '"Outfit", sans-serif' }} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
