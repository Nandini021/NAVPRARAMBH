import { createTheme } from '@mui/material/styles';

const C = {
  saffron: '#FF6A00',
  golden: '#F5B800',
  navy: '#0B1957',
  navyLight: '#1A2E7E',
  emerald: '#0A9B5C',
  sky: '#60B2E5',
  cream: '#FFFDF8',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: C.navy, light: C.navyLight, dark: '#060e38' },
    secondary: { main: C.saffron, light: '#FF8C40', dark: '#CC5500' },
    success: { main: C.emerald },
    warning: { main: C.golden },
    info: { main: C.sky },
    background: { default: C.cream, paper: '#FFFFFF' },
    text: { primary: C.navy, secondary: '#555' },
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 800 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          letterSpacing: 0.2,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
          boxShadow: `0 4px 18px rgba(11,25,87,0.28)`,
          '&:hover': { boxShadow: `0 6px 24px rgba(11,25,87,0.38)` },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 24px rgba(11,25,87,0.07)',
          border: '1px solid rgba(11,25,87,0.07)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, borderRadius: 10 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            fontFamily: '"Outfit", sans-serif',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 20, backgroundImage: 'none' },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: C.cream },
      },
    },
  },
});

export default theme;
export { C };
