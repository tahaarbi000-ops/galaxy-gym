import { createTheme } from '@mui/material/styles';

const gold = '#D4AF37';
const goldLight = '#F1D57A';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: gold,
      light: goldLight,
      dark: '#A8862B',
      contrastText: '#0B0B0F',
    },
    secondary: {
      main: '#8E7CC3',
    },
    background: {
      default: '#0B0B0F',
      paper: '#141419',
    },
    success: { main: '#3ED598' },
    warning: { main: '#F5B85D' },
    error: { main: '#EF5A6F' },
    info: { main: '#5AA9E6' },
    text: {
      primary: '#F3F1EA',
      secondary: 'rgba(243,241,234,0.62)',
    },
    divider: 'rgba(212,175,55,0.14)',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h5: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at 15% 0%, rgba(212,175,55,0.08) 0%, rgba(11,11,15,1) 45%), #0B0B0F',
          minHeight: '100vh',
        },
        '*::-webkit-scrollbar': { width: 8, height: 8 },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(212,175,55,0.35)',
          borderRadius: 8,
        },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(212,175,55,0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#141419',
          border: '1px solid rgba(212,175,55,0.12)',
          backgroundImage:
            'linear-gradient(160deg, rgba(212,175,55,0.06) 0%, rgba(20,20,25,0) 60%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, paddingTop: 9, paddingBottom: 9 },
        containedPrimary: {
          background: `linear-gradient(135deg, ${goldLight} 0%, ${gold} 60%, #A8862B 100%)`,
          color: '#0B0B0F',
          boxShadow: '0 8px 20px rgba(212,175,55,0.25)',
          '&:hover': {
            background: `linear-gradient(135deg, ${goldLight} 0%, ${gold} 100%)`,
            boxShadow: '0 10px 26px rgba(212,175,55,0.35)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(212,175,55,0.1)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        notchedOutline: {
          borderColor: 'rgba(212,175,55,0.25)',
        },
      },
    },
  },
});

export default theme;
