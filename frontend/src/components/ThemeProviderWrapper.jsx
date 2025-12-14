import React, { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSettings } from '../context/SettingsContext';

function ThemeProviderWrapper({ children }) {
  const { settings, loading } = useSettings();

  const theme = useMemo(() => createTheme({
    palette: {
      mode: settings.theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: settings.theme === 'dark' 
        ? { default: '#121212', paper: '#1e1e1e' }
        : { default: '#fafafa', paper: '#ffffff' },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  }), [settings.theme]);

  if (loading) return null;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default ThemeProviderWrapper;