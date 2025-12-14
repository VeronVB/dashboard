import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Typography,
  Chip,
  Box
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  ViewList as ContainersIcon,
  Settings as SettingsIcon,
  PlayArrow as RunningIcon,
  Stop as StoppedIcon
} from '@mui/icons-material';
import { getContainers } from '../services/api';

const PAGES = [
  { type: 'page', name: 'Overview', path: '/', icon: HomeIcon },
  { type: 'page', name: 'Kontenery', path: '/containers', icon: ContainersIcon },
  { type: 'page', name: 'Ustawienia', path: '/settings', icon: SettingsIcon },
];

function SearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [containers, setContainers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      fetchContainers();
    }
  }, [open]);

  const fetchContainers = async () => {
    try {
      const res = await getContainers();
      setContainers(res.data);
    } catch (err) {
      console.error('Błąd ładowania kontenerów:', err);
    }
  };

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    
    const matchedPages = PAGES.filter(p => 
      p.name.toLowerCase().includes(q)
    );

    const matchedContainers = containers
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map(c => ({
        type: 'container',
        name: c.name,
        state: c.state,
        endpointName: c.endpointName,
      }));

    return [...matchedPages, ...matchedContainers];
  }, [query, containers]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    if (item.type === 'page') {
      navigate(item.path);
    } else if (item.type === 'container') {
      navigate('/containers');
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          position: 'fixed',
          top: '20%',
          m: 0,
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Szukaj stron, kontenerów..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { py: 1 }
          }}
          sx={{ 
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            borderBottom: 1,
            borderColor: 'divider'
          }}
        />
        
        {results.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: 'auto', py: 1 }}>
            {results.map((item, index) => {
              const Icon = item.type === 'page' ? item.icon : 
                (item.state === 'running' ? RunningIcon : StoppedIcon);
              
              return (
                <ListItem
                  key={`${item.type}-${item.name}`}
                  onClick={() => handleSelect(item)}
                  selected={index === selectedIndex}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <Icon color={item.state === 'running' ? 'success' : item.state === 'exited' ? 'error' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.name}
                    secondary={item.type === 'container' ? item.endpointName : null}
                  />
                  <Chip 
                    label={item.type === 'page' ? 'Strona' : 'Kontener'} 
                    size="small" 
                    variant="outlined"
                  />
                </ListItem>
              );
            })}
          </List>
        ) : query && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Brak wyników</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SearchModal;