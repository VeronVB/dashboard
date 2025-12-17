import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { useSettings } from '../context/SettingsContext';
import { useEditMode } from '../context/EditModeContext';
import SearchModal from './SearchModal';
import Sidebar from './Sidebar';

function Navbar() {
  const { settings, updateSettingValue } = useSettings();
  // POPRAWKA: Używamy 'editMode' zamiast 'isEditMode', bo tak nazywa się zmienna w Twoim contextcie
  const { editMode, toggleEditMode } = useEditMode(); 
  const theme = useTheme();
  
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
    window.dispatchEvent(new CustomEvent('openAddWidget'));
  };

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettingValue('theme', newTheme);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* --- LEWA STRONA: Hamburger (jeśli ustawiony na lewo) --- */}
          {settings.sidebar_position === 'left' && (
            <IconButton 
              color="inherit" 
              onClick={() => setSidebarOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* --- LOGO / TYTUŁ --- */}
          <Typography 
            variant="h6" 
            component="div" 
            onClick={() => navigate('/')}
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: 2
              }}
            >
              🏠
            </Box>
            {settings.dashboard_title}
          </Typography>

          {/* --- PRAWA STRONA: Akcje --- */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            
            {/* 1. Search Bar (tylko jeśli włączony i NIE jesteśmy w trybie edycji) */}
            {settings.search_enabled && !editMode && (
              <Tooltip title="Szukaj (Ctrl+K)">
                <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* 2. Przełącznik Motywu */}
            <Tooltip title="Przełącz motyw">
              <IconButton onClick={handleToggleTheme} color="inherit">
                {settings.theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* 3. Tryb Edycji i Dodawanie Widgetu (Tylko na stronie głównej) */}
            {isOverviewPage && (
              <>
                {/* Przycisk DODAJ WIDGET - teraz widoczny w trybie edycji */}
                {editMode && (
                  <Tooltip title="Dodaj nowy widget">
                    <IconButton 
                      onClick={handleAddWidget} 
                      color="inherit"
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        mr: 1
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Przełącznik Trybu Edycji */}
                <Tooltip title={editMode ? "Zakończ edycję" : "Edytuj dashboard"}>
                  <IconButton 
                    onClick={toggleEditMode} 
                    color={editMode ? "secondary" : "inherit"}
                    sx={{ 
                      bgcolor: editMode ? 'rgba(156, 39, 176, 0.1)' : 'transparent',
                      '&:hover': { bgcolor: editMode ? 'rgba(156, 39, 176, 0.2)' : 'rgba(255, 255, 255, 0.08)' }
                     }}
                  >
                    {editMode ? <CheckIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* 4. Ustawienia */}
            <Tooltip title="Ustawienia">
              <IconButton color="inherit" onClick={() => navigate('/settings')}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            {/* 5. Hamburger (jeśli ustawiony na prawo) */}
            {settings.sidebar_position !== 'left' && (
              <IconButton 
                color="inherit" 
                onClick={() => setSidebarOpen(true)}
                edge="end"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- WAŻNE: To rozwiązuje problem nakładania się Navbara na treść --- */}
      <Toolbar /> 

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default Navbar;