import React from 'react';
import { Box, Typography } from '@mui/material';
import { Notes as NotesIcon } from '@mui/icons-material';

/**
 * Placeholder widget - do testowania edit mode
 * Docelowo zostanie zastąpiony prawdziwym NotesWidget
 */
function PlaceholderWidget({ name, type }) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <NotesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Widget typu: {type}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        (To jest placeholder - prawdziwy widget będzie w następnej części)
      </Typography>
    </Box>
  );
}

export default PlaceholderWidget;