import { motion } from 'framer-motion';
import { Box, Typography, Button } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function RightAIPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Box sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(180deg, rgba(10,155,92,0.12), rgba(255,255,255,0.96))', border: '1px solid rgba(10,155,92,0.12)', boxShadow: '0 24px 60px rgba(10,155,92,0.06)', position: 'sticky', top: 24 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: 3, background: 'linear-gradient(135deg,#0A9B5C,#60B2E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <SmartToyIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 800, fontSize: 18, color: '#0A9B5C' }}>SIDDHI</Typography>
            <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: '#275b45' }}>Your AI career companion</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: '#2D5743', lineHeight: 1.9, mb: 3 }}>
          SIDDHI is ready to help you with career recommendations, resume health, interview coaching, and milestone reminders. Future modules will populate this AI assistant panel.
        </Typography>

        <Box sx={{ display: 'grid', gap: 1.75, mb: 3 }}>
          {['Actionable insights', 'Live checklist', 'Progress heatmap'].map((item) => (
            <Box key={item} sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(10,155,92,0.12)' }}>
              <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: '#2F5D4E' }}>{item}</Typography>
            </Box>
          ))}
        </Box>

        <Button fullWidth variant="contained" sx={{ background: '#0A9B5C', color: '#fff', textTransform: 'none', fontFamily: '"Outfit", sans-serif', fontWeight: 700, '&:hover': { background: '#08855b' } }}>
          Open SIDDHI Assistant
        </Button>
      </Box>
    </motion.div>
  );
}
