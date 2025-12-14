import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, InputBase } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { useSettings } from '../context/SettingsContext';
import SearchModal from './SearchModal';

function Navbar() {
  const { settings } = useSettings();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('openSearch', handleOpenSearch);
    return () => window.removeEventListener('openSearch', handleOpenSearch);
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <HomeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {settings.dashboard_title}
          </Typography>
          
          {settings.search_enabled && (
            <Button
              color="inherit"
              startIcon={<SearchIcon />}
              onClick={() => setSearchOpen(true)}
              sx={{ 
                mr: 2, 
                border: 1, 
                borderColor: 'rgba(255,255,255,0.3)',
                borderRadius: 1,
                textTransform: 'none'
              }}
            >
              Szukaj...
              <Typography 
                component="span" 
                sx={{ 
                  ml: 2, 
                  px: 0.5, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 0.5,
                  fontSize: '0.75rem'
                }}
              >
                Ctrl+K
              </Typography>
            </Button>
          )}

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

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;