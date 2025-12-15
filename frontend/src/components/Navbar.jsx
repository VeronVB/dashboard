import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useSettings } from '../context/SettingsContext';
import { useEditMode } from '../context/EditModeContext';
import SearchModal from './SearchModal';
import Sidebar from './Sidebar';

function Navbar() {
  const { settings } = useSettings();
  const { editMode, disableEditMode } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isOverviewPage = location.pathname === '/';

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('openSearch', handleOpenSearch);
    return () => window.removeEventListener('openSearch', handleOpenSearch);
  }, []);

  const handleAddWidget = () => {
    // To będzie triggerować event który Overview nasłuchuje
    window.dispatchEvent(new CustomEvent('openAddWidget'));
  };

  const handleExitEditMode = () => {
    disableEditMode();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Logo/Title - klikalne */}
          <Typography 
            variant="h6" 
            component="div" 
            onClick={() => navigate('/')}
            sx={{ 
              flexGrow: 0,
              mr: 3,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              },
              transition: 'opacity 0.2s'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              🏠
            </Box>
            {settings.dashboard_title}
          </Typography>

          {/* Edit Mode - Dodaj Widget (tylko w trybie edycji na Overview) */}
          {editMode && isOverviewPage && (
            <Tooltip title="Dodaj widget">
              <IconButton 
                color="inherit" 
                onClick={handleAddWidget}
                sx={{ 
                  mr: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Exit Edit Mode (tylko w trybie edycji na Overview) */}
          {editMode && isOverviewPage && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleExitEditMode}
              sx={{ mr: 2 }}
            >
              Zakończ edycję
            </Button>
          )}

          {/* Search Bar (tylko gdy enabled i nie ma edit mode) */}
          {settings.search_enabled && !editMode && (
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

          {/* Hamburger Menu - LEFT (jeśli sidebar po lewej) */}
          {settings.sidebar_position === 'left' && (
            <Tooltip title="Menu">
              <IconButton 
                color="inherit" 
                onClick={() => setSidebarOpen(true)}
                edge="start"
                sx={{ mr: 2, order: -1 }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Language/Globe Icon (placeholder) */}
          <Tooltip title="Język / Strefa czasowa">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <LanguageIcon />
            </IconButton>
          </Tooltip>

          {/* Hamburger Menu - RIGHT (jeśli sidebar po prawej) */}
          {settings.sidebar_position !== 'left' && (
            <Tooltip title="Menu">
              <IconButton 
                color="inherit" 
                onClick={() => setSidebarOpen(true)}
                edge="end"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;