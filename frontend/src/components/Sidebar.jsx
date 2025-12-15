import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  ViewList as ContainersIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSettings } from '../context/SettingsContext';
import { useEditMode } from '../context/EditModeContext';

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { editMode, toggleEditMode } = useEditMode();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleEditModeToggle = () => {
    toggleEditMode();
    // Jeśli włączamy edit mode, zamknij sidebar
    if (!editMode) {
      onClose();
    }
  };

  const menuItems = [
    { 
      label: 'Strona Główna', 
      icon: <HomeIcon />, 
      path: '/',
      showAlways: true
    },
    { 
      label: 'Kontenery', 
      icon: <ContainersIcon />, 
      path: '/containers',
      showAlways: true
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      anchor={settings.sidebar_position || 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          bgcolor: 'background.default',
          backgroundImage: 'none',
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6">Menu</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation Items */}
        <List sx={{ flexGrow: 1, pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    borderLeft: 3,
                    borderColor: 'primary.main'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Edit Mode Toggle - tylko na stronie głównej */}
          {location.pathname === '/' && (
            <ListItem disablePadding>
              <ListItemButton
                selected={editMode}
                onClick={handleEditModeToggle}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'warning.dark',
                    color: 'warning.contrastText',
                    '&:hover': {
                      bgcolor: 'warning.main',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: editMode ? 'warning.light' : 'inherit' }}>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={editMode ? 'Zakończ edycję' : 'Edytuj'} 
                  secondary={editMode ? 'Tryb edycji aktywny' : 'Dodawaj i usuwaj widgety'}
                  secondaryTypographyProps={{
                    sx: { color: editMode ? 'warning.light' : 'text.secondary' }
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Settings - zawsze na dole */}
          <ListItem disablePadding>
            <ListItemButton
              selected={isActive('/settings')}
              onClick={() => handleNavigation('/settings')}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  borderLeft: 3,
                  borderColor: 'primary.main'
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive('/settings') ? 'primary.main' : 'inherit' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Ustawienia" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;