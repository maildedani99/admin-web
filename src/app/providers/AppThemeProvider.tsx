'use client';

import * as React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
// Si prefieres claro/oscuro dinámico más adelante, aquí lo manejamos.

const theme = createTheme({
  palette: {
    mode: 'dark', // o 'light'
    primary: { main: '#D60001' },
  },
  // ...typography, components, etc.
});

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
