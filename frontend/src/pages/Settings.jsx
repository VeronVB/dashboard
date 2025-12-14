import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Backup as BackupIcon,
  Keyboard as KeyboardIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useSettings } from '../context/SettingsContext';
import { getBackgrounds, uploadBackground, deleteBackground } from '../services/api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

function Settings() {
  const { settings, updateSettingValue } = useSettings();
  const [tab, setTab] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [backgrounds, setBackgrounds] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormValues(settings);
  }, [settings]);

  useEffect(() => {
    if (tab === 1) {
      fetchBackgrounds();
    }
  }, [tab]);

  const fetchBackgrounds = async () => {
    try {
      const res = await getBackgrounds();
      setBackgrounds(res.data);
    } catch (err) {
      console.error('Błąd ładowania teł:', err);
    }
  };

  const handleToggle = async (key, value, type = 'boolean') => {
    const success = await updateSettingValue(key, value, type);
    if (success) {
      toast.success('Zapisano');
    } else {
      toast.error('Błąd zapisu');
    }
  };

  const handleInputChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const textFields = ['dashboard_title'];
      
      for (const key of textFields) {
        if (formValues[key] !== settings[key]) {
          await updateSettingValue(key, formValues[key], 'string');
        }
      }
      
      setHasChanges(false);
      toast.success('Zapisano zmiany');
    } catch (err) {
      toast.error('Błąd zapisu');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadBackground(file);
      toast.success('Tło przesłane');
      fetchBackgrounds();
    } catch (err) {
      toast.error('Błąd przesyłania');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSelectBackground = async (url) => {
    const success = await updateSettingValue('background_url', url, 'string');
    if (success) {
      toast.success('Tło ustawione');
    }
  };

  const handleClearBackground = async () => {
    const success = await updateSettingValue('background_url', '', 'string');
    if (success) {
      toast.success('Tło usunięte');
    }
  };

  const handleDeleteBackground = async (filename) => {
    try {
      await deleteBackground(filename);
      toast.success('Plik usunięty');
      
      // Jeśli usuwamy aktywne tło, wyczyść ustawienie
      if (settings.background_url?.includes(filename)) {
        await updateSettingValue('background_url', '', 'string');
      }
      
      fetchBackgrounds();
    } catch (err) {
      toast.error('Błąd usuwania');
    }
  };

  const shortcuts = [
    { keys: 'Ctrl + 1', action: 'Strona główna (Overview)' },
    { keys: 'Ctrl + 2', action: 'Kontenery Docker' },
    { keys: 'Ctrl + 0', action: 'Ustawienia' },
    { keys: 'Ctrl + K', action: 'Wyszukiwarka (wkrótce)' },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Ustawienia</Typography>
        {hasChanges && (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Zapisz zmiany
          </Button>
        )}
      </Box>
      
      <Paper>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab icon={<SettingsIcon />} label="Ogólne" />
          <Tab icon={<PaletteIcon />} label="Wygląd" />
          <Tab icon={<BackupIcon />} label="Kopia zapasowa" />
          <Tab icon={<KeyboardIcon />} label="Skróty" />
        </Tabs>

        {/* TAB: Ogólne */}
        <TabPanel value={tab} index={0}>
          <TextField
            fullWidth
            label="Tytuł dashboardu"
            value={formValues.dashboard_title || ''}
            onChange={(e) => handleInputChange('dashboard_title', e.target.value)}
            sx={{ mb: 3 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.search_enabled || false}
                onChange={(e) => handleToggle('search_enabled', e.target.checked, 'boolean')}
              />
            }
            label="Pokaż wyszukiwarkę w navbar"
          />
        </TabPanel>

        {/* TAB: Wygląd */}
        <TabPanel value={tab} index={1}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.theme === 'dark'}
                onChange={(e) => handleToggle('theme', e.target.checked ? 'dark' : 'light', 'string')}
              />
            }
            label="Dark mode"
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Tło dashboardu</Typography>
            <Box>
              {settings.background_url && (
                <Button 
                  size="small" 
                  onClick={handleClearBackground}
                  sx={{ mr: 1 }}
                >
                  Wyłącz tło
                </Button>
              )}
              <Button
                variant="contained"
                component="label"
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                disabled={uploading}
              >
                {uploading ? 'Przesyłanie...' : 'Dodaj tło'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Box>

          {backgrounds.length === 0 ? (
            <Alert severity="info">Brak przesłanych teł</Alert>
          ) : (
            <ImageList cols={4} rowHeight={120} gap={8}>
              {backgrounds.map((bg) => (
                <ImageListItem 
                  key={bg.filename}
                  sx={{ 
                    cursor: 'pointer',
                    border: settings.background_url === bg.url ? '3px solid' : '3px solid transparent',
                    borderColor: settings.background_url === bg.url ? 'primary.main' : 'transparent',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleSelectBackground(bg.url)}
                >
                  <img
                    src={`/api${bg.url}`}
                    alt={bg.filename}
                    loading="lazy"
                    style={{ objectFit: 'cover', height: '100%' }}
                  />
                  <ImageListItemBar
                    sx={{ background: 'rgba(0,0,0,0.7)' }}
                    actionIcon={
                      <Box>
                        {settings.background_url === bg.url && (
                          <IconButton size="small" sx={{ color: 'success.main' }}>
                            <CheckIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          sx={{ color: 'error.main' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBackground(bg.filename);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </TabPanel>

        {/* TAB: Kopia zapasowa */}
        <TabPanel value={tab} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Funkcja w przygotowaniu
          </Alert>
          <Button variant="outlined" disabled sx={{ mr: 2 }}>
            Eksportuj konfigurację
          </Button>
          <Button variant="outlined" disabled>
            Importuj konfigurację
          </Button>
        </TabPanel>

        {/* TAB: Skróty */}
        <TabPanel value={tab} index={3}>
          <List>
            {shortcuts.map((s) => (
              <ListItem key={s.keys}>
                <ListItemText 
                  primary={<Typography component="span" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>{s.keys}</Typography>}
                  secondary={s.action}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Settings;