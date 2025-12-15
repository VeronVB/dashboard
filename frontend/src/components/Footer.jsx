import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { useSettings } from '../context/SettingsContext';

/**
 * Footer - Stopka ze statusem homelab
 * Widoczność kontrolowana przez ustawienie 'show_footer'
 */
function Footer({ status }) {
  const { settings } = useSettings();

  // Jeśli wyłączone w ustawieniach - nie renderuj
  if (settings.show_footer === false) {
    return null;
  }

  const isOnline = status?.status === 'online';
  const lastUpdate = status?.lastUpdate 
    ? new Date(status.lastUpdate).toLocaleString('pl-PL')
    : '';

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        bgcolor: alpha('#000', 0.3),
        backdropFilter: 'blur(10px)',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        zIndex: 1000
      }}
    >
      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Homelab: 
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: isOnline ? 'success.main' : 'error.main',
            fontWeight: 'bold'
          }}
        >
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Box>
        {lastUpdate && (
          <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85em' }}>
            ({lastUpdate})
          </Box>
        )}
      </Typography>
    </Box>
  );
}

export default Footer;