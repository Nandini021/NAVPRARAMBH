import { motion } from 'framer-motion';
import { Box, Typography, IconButton, InputBase, Chip, Divider, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BoltIcon from '@mui/icons-material/Bolt';

export default function TopNav() {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 14, color: '#5D6C8A', mb: 1 }}>Welcome back, Arjun</Typography>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 800, fontSize: { xs: 24, md: 32 }, color: '#0B1957', lineHeight: 1.05 }}>Your premium AI career dashboard</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Mobile First" icon={<BoltIcon />} sx={{ background: 'rgba(245,184,0,0.12)', color: '#b46d00', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }} />
          <IconButton sx={{ background: 'rgba(96,178,229,0.12)', color: '#2B6CB0' }}><SearchIcon /></IconButton>
          <IconButton sx={{ background: 'rgba(255,106,0,0.12)', color: '#C05502' }}><NotificationsActiveIcon /></IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: 2, mb: 4 }}>
        <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.93)', border: '1px solid rgba(11,25,87,0.07)', boxShadow: '0 24px 60px rgba(11,25,87,0.05)' }}>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#0B1957', mb: 1 }}>Search NAVPRARAMBH</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, borderRadius: 3, background: 'rgba(11,25,87,0.04)' }}>
            <SearchIcon sx={{ color: '#5D6C8A' }} />
            <InputBase placeholder="Search courses, internships, skills" sx={{ width: '100%' }} />
          </Box>
        </Box>

        <Box sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(180deg, rgba(255,245,217,0.95), rgba(255,255,255,0.95))', border: '1px solid rgba(245,184,0,0.15)', boxShadow: '0 24px 60px rgba(245,184,0,0.08)' }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#A65D02', mb: 1 }}>SIDDHI status</Typography>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: '#5D6C8A', lineHeight: 1.8 }}>Ready to coach you through every milestone. Tap a module to unlock personalized suggestions.</Typography>
          <Divider sx={{ my: 2, borderColor: 'rgba(166,93,2,0.16)' }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['Career', 'Resume', 'Interview'].map((pill) => (
              <Chip key={pill} label={pill} sx={{ background: 'rgba(11,25,87,0.06)', color: '#0B1957', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }} />
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
