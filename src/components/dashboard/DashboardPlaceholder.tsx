import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

interface DashboardPlaceholderProps {
  title: string;
  description: string;
  accent?: string;
  rows?: number;
}

export function DashboardPlaceholder({
  title,
  description,
  accent = '#0B1957',
  rows = 3,
}: DashboardPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Box
        sx={{
          minHeight: 160,
          borderRadius: 4,
          p: 3,
          background: 'rgba(255,255,255,0.86)',
          border: '1px dashed rgba(11,25,87,0.16)',
          boxShadow: '0 24px 60px rgba(11,25,87,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 18, color: accent, mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: '#556', lineHeight: 1.75 }}>
            {description}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: 'grid', gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 1.25 }}>
          {Array.from({ length: rows }).map((_, index) => (
            <Box
              key={index}
              sx={{
                height: 10,
                borderRadius: 999,
                background: 'linear-gradient(90deg, rgba(11,25,87,0.12), rgba(11,25,87,0.04))',
              }}
            />
          ))}
        </Box>
      </Box>
    </motion.div>
  );
}
