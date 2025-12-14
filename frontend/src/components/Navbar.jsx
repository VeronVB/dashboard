import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSettings } from '../context/SettingsContext';

function Navbar() {
  const { settings } = useSettings();

  return (
    <AppBar position="static">
      <Toolbar>
        <HomeIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {settings.dashboard_title}
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            Overview
          </Button>
          <Button color="inherit" component={Link} to="/containers">
            Containers
          </Button>
          <Button color="inherit" component={Link} to="/settings" startIcon={<SettingsIcon />}>
            Settings
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;