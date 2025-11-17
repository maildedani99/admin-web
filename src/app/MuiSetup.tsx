'use client';

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#ef4444' },                  // rojo Rebirth
    background: { default: '#f7f7f8', paper: '#ffffff' },
    text: { primary: '#111111' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } } },
  },
});

export default function MuiSetup({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
