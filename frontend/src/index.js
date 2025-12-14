import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import ThemeProviderWrapper from './components/ThemeProviderWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeProviderWrapper>
        <CssBaseline />
        <App />
      </ThemeProviderWrapper>
    </SettingsProvider>
  </React.StrictMode>
);