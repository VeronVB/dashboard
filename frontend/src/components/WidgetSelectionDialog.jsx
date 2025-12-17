import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardActionArea,
  Box,
  useTheme,
  Grid // <--- POPRAWIONY IMPORT (MUI v7)
} from '@mui/material';
import { 
  Notes, 
  Dns, 
  Storage, 
  Speed, 
  Security, 
  Search,
  Widgets
} from '@mui/icons-material';
import { getAvailableWidgetTypes } from '../widgets/widgetSchemas';

const ICON_MAP = {
  'notes': Notes,
  'docker-mini': Dns,
  'proxmox': Storage,
  'qbittorrent': Speed,
  'pihole': Security,
  'google-search': Search,
  'default': Widgets
};

function WidgetSelectionDialog({ open, onClose, onSelect }) {
  const theme = useTheme();
  const widgetTypes = getAvailableWidgetTypes();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>Wybierz widget do dodania</DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {widgetTypes.map((type) => {
            const IconComponent = ICON_MAP[type.value] || ICON_MAP['default'];
            
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={type.value}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, border-color 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: theme.palette.primary.main,
                      boxShadow: 3
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => onSelect(type.value)}
                    sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                  >
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      color: theme.palette.primary.main,
                      mb: 2
                    }}>
                      <IconComponent fontSize="large" />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom component="div">
                      {type.label}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
      </DialogActions>
    </Dialog>
  );
}

export default WidgetSelectionDialog;