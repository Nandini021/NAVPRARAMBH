import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const C = {
  navy: '#0B1957',
  saffron: '#FF6A00',
  golden: '#F5B800',
  emerald: '#0A9B5C',
};

interface Props {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<'cover' | 'opening' | 'ribbons' | 'done'>('cover');
  const [reducedMotion, setReducedMotion] = useState(false);
  const timersRef = useRef<number[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    sessionStorage.setItem('np_intro', 'seen');
    onComplete();
  };

  const handleOpen = () => {
    if (reducedMotion) {
      complete();
      return;
    }
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    setPhase('opening');
    timersRef.current = [
      window.setTimeout(() => setPhase('ribbons'), 300),
      window.setTimeout(() => setPhase('done'), 720),
      window.setTimeout(complete, 860),
    ];
  };

  const handleSkip = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    complete();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,

        background:
          phase === 'ribbons' || phase === 'done'
            ? 'linear-gradient(180deg,#FFF8E8 0%,#FFF2D0 30%,#FFFDF8 100%)'
            : 'linear-gradient(180deg,#0B1957 0%,#1A2E7E 60%,#0B1957 100%)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        transition: reducedMotion ? 'none' : 'background 0.45s ease, opacity 0.18s ease',

        opacity: phase === 'done' ? 0 : 1,
        pointerEvents: phase === 'done' ? 'none' : 'auto',
        willChange: phase === 'opening' || phase === 'ribbons' ? 'opacity' : 'auto',
      }}
    >
      {/* =========================
          STARS ON COVER
      ========================== */}

      {phase === 'cover' &&
        [
          { top: '10%', left: '15%', s: 3 },
          { top: '20%', right: '20%', s: 2 },
          { top: '35%', left: '8%', s: 2 },
          { top: '15%', right: '10%', s: 3 },
          { bottom: '25%', left: '20%', s: 2 },
          { bottom: '30%', right: '15%', s: 3 },
        ].map((star, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              ...star,

              width: star.s,
              height: star.s,

              borderRadius: '50%',

              background: C.golden,

              opacity: 0.6,

              animation: `sunRay ${
                1.5 + i * 0.3
              }s ease-in-out infinite`,
            }}
          />
        ))}

      {/* =========================
          RIBBONS
      ========================== */}

      {phase === 'ribbons' && (
        <>
          {/* Saffron ribbon */}
          <Box
            sx={{
              position: 'absolute',
              top: '42%',
              left: 0,
              right: 0,

              height: 28,

              background: 'rgba(255,153,0,0.75)',

              animation:
                'ribbonFlow 0.9s ease forwards',

              transformOrigin: 'left center',

              filter: 'blur(0.5px)',
            }}
          />

          {/* White ribbon */}
          <Box
            sx={{
              position: 'absolute',
              top: '47%',
              left: 0,
              right: 0,

              height: 28,

              background: 'rgba(255,255,255,0.7)',

              animation:
                'ribbonFlow 0.9s 0.08s ease forwards',

              transformOrigin: 'left center',
            }}
          />

          {/* Emerald ribbon */}
          <Box
            sx={{
              position: 'absolute',
              top: '52%',
              left: 0,
              right: 0,

              height: 28,

              background: 'rgba(10,155,92,0.75)',

              animation:
                'ribbonFlow 0.65s 0.12s ease forwards',

              transformOrigin: 'left center',
            }}
          />

          {/* Golden particles */}

          {[...Array(12)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',

                left: `${10 + i * 8}%`,

                top: `${35 + (i % 4) * 8}%`,

                width: i % 3 === 0 ? 6 : 4,

                height: i % 3 === 0 ? 6 : 4,

                borderRadius: '50%',

                background:
                  i % 2 === 0
                    ? C.golden
                    : C.saffron,

                animation: `particleFloat ${
                  0.8 + (i % 3) * 0.3
                }s ${i * 0.07}s ease-out forwards`,
              }}
            />
          ))}
        </>
      )}

      {/* =========================
          JOURNAL COVER
      ========================== */}

      {(phase === 'cover' || phase === 'opening') && (
        <Box
          className="book-scene"
          sx={{
            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            gap: 4,

            position: 'relative',

            zIndex: 2,
          }}
        >
          {/* =========================
              THE JOURNAL
          ========================== */}

          <Box
            className={`book-cover ${
              phase === 'opening' ? 'open' : ''
            }`}
            onClick={
              phase === 'cover'
                ? handleOpen
                : undefined
            }
            sx={{
              width: {
                xs: 260,
                sm: 320,
              },

              height: {
                xs: 360,
                sm: 440,
              },

              cursor:
                phase === 'cover'
                  ? 'pointer'
                  : 'default',

              position: 'relative',
            }}
          >
            {/* =========================
                FRONT COVER
            ========================== */}

            <Box
              className="book-cover-front"
              sx={{
                width: '100%',

                height: '100%',

                borderRadius:
                  '4px 16px 16px 4px',

                background:
                  'linear-gradient(160deg,#1A2E7E 0%,#0B1957 50%,#060E38 100%)',

                boxShadow:
                  '8px 8px 40px rgba(0,0,0,0.6), -2px 0 8px rgba(0,0,0,0.3)',

                display: 'flex',

                flexDirection: 'column',

                alignItems: 'center',

                justifyContent: 'center',

                padding: '32px 24px',

                border:
                  '1.5px solid rgba(245,184,0,0.25)',

                position: 'relative',

                overflow: 'hidden',
              }}
            >
              {/* Embossed border */}

              <Box
                sx={{
                  position: 'absolute',

                  inset: 10,

                  border:
                    '1px solid rgba(245,184,0,0.2)',

                  borderRadius: 2,

                  pointerEvents: 'none',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',

                  inset: 14,

                  border:
                    '0.5px solid rgba(245,184,0,0.1)',

                  borderRadius: 2,

                  pointerEvents: 'none',
                }}
              />

              {/* =========================
                  SUNRISE EMBLEM
              ========================== */}

              <Box
                sx={{
                  position: 'relative',

                  mb: 3,
                }}
              >
                {/* Glow */}

                <Box
                  sx={{
                    width: 80,

                    height: 80,

                    borderRadius: '50%',

                    background:
                      'radial-gradient(circle,#F5B800 0%,#FF6A00 60%,transparent 75%)',

                    filter: 'blur(8px)',

                    opacity: 0.4,

                    position: 'absolute',

                    top: '50%',

                    left: '50%',

                    transform:
                      'translate(-50%,-50%)',
                  }}
                />

                {/* Sun */}

                <Box
                  sx={{
                    width: 64,

                    height: 64,

                    borderRadius: '50%',

                    background:
                      'linear-gradient(135deg,#F5B800,#FF6A00)',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    boxShadow:
                      '0 0 24px rgba(245,184,0,0.5)',

                    position: 'relative',

                    zIndex: 1,
                  }}
                >
                  <AutoAwesomeIcon
                    sx={{
                      color: '#fff',

                      fontSize: 30,
                    }}
                  />
                </Box>

                {/* Sun rays */}

                {[0, 45, 90, 135, 180, 225, 270, 315].map(
                  (deg, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',

                        top: '50%',

                        left: '50%',

                        width: 36,

                        height: 2.5,

                        background:
                          'linear-gradient(90deg,rgba(245,184,0,0.6),transparent)',

                        borderRadius: 1,

                        transformOrigin:
                          'left center',

                        transform: `translate(28px,-50%) rotate(${deg}deg)`,

                        animation: `sunRay ${
                          2 + i * 0.2
                        }s ease-in-out infinite`,
                      }}
                    />
                  )
                )}
              </Box>

              {/* =========================
                  NAVPRARAMBH TITLE
              ========================== */}

              <Typography
                sx={{
                  fontFamily:
                    '"Cinzel",serif',

                  fontWeight: 700,

                  color: C.golden,

                  fontSize: {
                    xs: 22,
                    sm: 26,
                  },

                  letterSpacing: 2,

                  textAlign: 'center',

                  textShadow:
                    '0 0 20px rgba(245,184,0,0.6)',

                  mb: 0.5,
                }}
              >
                NAVPRARAMBH
              </Typography>

              {/* Sanskrit */}

              <Typography
                sx={{
                  fontFamily:
                    '"Fraunces",serif',

                  fontStyle: 'italic',

                  color:
                    'rgba(245,184,0,0.7)',

                  fontSize: 14,

                  letterSpacing: 1,

                  mb: 2,
                }}
              >
                नवप्रारंभ
              </Typography>

              {/* Divider */}

              <Box
                sx={{
                  width: '60%',

                  height: 1,

                  background:
                    'linear-gradient(90deg,transparent,rgba(245,184,0,0.4),transparent)',

                  mb: 2,
                }}
              />

              {/* =========================
                  MAIN TAGLINE
              ========================== */}

              <Typography
                sx={{
                  fontFamily:
                    '"Fraunces",serif',

                  fontStyle: 'italic',

                  color:
                    'rgba(255,255,255,0.85)',

                  fontSize: {
                    xs: 12,
                    sm: 13,
                  },

                  textAlign: 'center',

                  lineHeight: 1.5,

                  mb: 1,
                }}
              >
                Rise Like the Sun
              </Typography>

              {/* =========================
                  PLATFORM DESCRIPTION
              ========================== */}

              <Typography
                sx={{
                  fontFamily:
                    '"Outfit",sans-serif',

                  color:
                    'rgba(255,255,255,0.65)',

                  fontSize: {
                    xs: 9.5,
                    sm: 10.5,
                  },

                  textAlign: 'center',

                  lineHeight: 1.6,

                  maxWidth: 210,
                }}
              >
                Your AI-powered journey from
                learning to career.
              </Typography>

              {/* =========================
                  FOUR CORE STEPS
              ========================== */}

              <Typography
                sx={{
                  mt: 1.5,

                  fontFamily:
                    '"Outfit",sans-serif',

                  fontWeight: 600,

                  color:
                    'rgba(245,184,0,0.85)',

                  fontSize: {
                    xs: 8.5,
                    sm: 9.5,
                  },

                  letterSpacing: 0.8,

                  textAlign: 'center',
                }}
              >
                Discover. Learn. Prepare. Get
                Matched.
              </Typography>

              {/* =========================
                  SIDDHI
              ========================== */}

              <Typography
                sx={{
                  mt: 1.5,

                  fontFamily:
                    '"Outfit",sans-serif',

                  color:
                    'rgba(255,255,255,0.5)',

                  fontSize: {
                    xs: 8,
                    sm: 9,
                  },

                  textAlign: 'center',

                  maxWidth: 220,

                  lineHeight: 1.5,
                }}
              >
                Powered by{' '}
                <Box
                  component="span"
                  sx={{
                    color:
                      'rgba(139,92,246,0.95)',

                    fontWeight: 700,
                  }}
                >
                  SIDDHI
                </Box>
                , your AI Career Mentor.
              </Typography>

              {/* Divider */}

              <Box
                sx={{
                  mt: 2,

                  width: '50%',

                  height: 1,

                  background:
                    'linear-gradient(90deg,transparent,rgba(245,184,0,0.4),transparent)',
                }}
              />

              {/* Career Journal */}

              <Typography
                sx={{
                  mt: 1.5,

                  color:
                    'rgba(245,184,0,0.5)',

                  fontSize: 10,

                  fontFamily:
                    '"Outfit",sans-serif',

                  letterSpacing: 2,
                }}
              >
                CAREER JOURNAL
              </Typography>

              {/* Loading dots */}

              {phase === 'cover' && (
                <Box
                  sx={{
                    mt: 2,

                    display: 'flex',

                    alignItems: 'center',

                    gap: 1,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      className="ai-dot"
                      sx={{
                        width: 5,

                        height: 5,

                        borderRadius: '50%',

                        background:
                          'rgba(245,184,0,0.6)',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* =========================
              OPEN JOURNAL TEXT
          ========================== */}

          {phase === 'cover' && (
            <Box
              sx={{
                display: 'flex',

                flexDirection: 'column',

                alignItems: 'center',

                gap: 2,

                animation:
                  'pageIn 0.8s ease forwards',
              }}
            >
              <Typography
                sx={{
                  color:
                    'rgba(245,184,0,0.8)',

                  fontFamily:
                    '"Outfit",sans-serif',

                  fontSize: 13,

                  letterSpacing: 1.5,

                  textAlign: 'center',
                }}
              >
                TAP TO OPEN YOUR CAREER
                JOURNAL
              </Typography>

              <Button
                onClick={handleSkip}
                sx={{
                  color:
                    'rgba(255,255,255,0.4)',

                  fontSize: 11,

                  fontFamily:
                    '"Outfit",sans-serif',

                  '&:hover': {
                    color:
                      'rgba(255,255,255,0.7)',

                    background:
                      'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Skip Intro
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}