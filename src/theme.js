import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007a78', // teal accent used in profile avatar
    },
    secondary: {
      main: '#8ab4f8',
    },
    background: {
      default: '#202124',
      paper: '#18191a',
    },
    text: {
      primary: '#e8eaed',
      secondary: '#b0b3b6',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Pretendard, Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
})

export default theme
