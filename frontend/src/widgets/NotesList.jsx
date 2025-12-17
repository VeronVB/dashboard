import React, { useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Divider // <--- Dodano Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Notes as NoteIcon,
  OpenInNew as GoToIcon,
  Delete as DeleteIcon // <--- Dodano import DeleteIcon
} from '@mui/icons-material';
import { useWidgets } from '../context/WidgetsContext';

// ============================================================
// KONFIGURACJA
// ============================================================
const MAX_TITLE_LENGTH = 40;
const MAX_PREVIEW_LENGTH = 60;
const MIN_WIDGET_HEIGHT = 208;

/**
 * NotesList - Agregator wszystkich notatek SingleNote z tabów
 */
function NotesList({ onUpdate }) {
  // Dodano removeWidget z contextu
  const { widgets, tabs, activeTabId, setActiveTabId, addWidget, removeWidget } = useWidgets();
  
  const [selectedTabId, setSelectedTabId] = useState(activeTabId);

  // Filtruj widgety
  const allNotes = useMemo(() => {
    return widgets.filter(w => 
      w.type === 'notes' && 
      w.config?.displayMode === 'note'
    );
  }, [widgets]);

  // Notatki z wybranego taba
  const notesInSelectedTab = useMemo(() => {
    return allNotes
      .filter(w => w.tab_id === selectedTabId)
      .sort((a, b) => a.position - b.position);
  }, [allNotes, selectedTabId]);

  // Statystyki
  const notesCountByTab = useMemo(() => {
    const counts = {};
    tabs.forEach(tab => {
      counts[tab.id] = allNotes.filter(w => w.tab_id === tab.id).length;
    });
    return counts;
  }, [allNotes, tabs]);

  // Pobierz tytuł
  const getTitle = (content) => {
    if (!content || content.trim() === '') return 'Pusta notatka';
    const firstLine = content.split('\n')[0];
    const cleanTitle = firstLine.replace(/^#+\s*/, '').trim();
    if (cleanTitle.length > MAX_TITLE_LENGTH) return cleanTitle.substring(0, MAX_TITLE_LENGTH) + '...';
    return cleanTitle || 'Bez tytułu';
  };

  // Pobierz podgląd
  const getPreview = (content) => {
    if (!content || content.trim() === '') return 'Brak treści';
    const lines = content.split('\n');
    const previewLine = lines.slice(1).find(line => line.trim() !== '') || '';
    const cleanPreview = previewLine.replace(/[#*_`>\[\]]/g, '').trim();
    if (cleanPreview.length > MAX_PREVIEW_LENGTH) return cleanPreview.substring(0, MAX_PREVIEW_LENGTH) + '...';
    return cleanPreview || 'Brak treści';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleAddNote = async () => {
    const result = await addWidget(
      'notes', 
      'Nowa notatka', 
      { displayMode: 'note', fontSize: 14, content: '', autoExpand: false },
      { targetTabId: selectedTabId, size: 'small' }
    );

    if (result.success) {
      if (selectedTabId !== activeTabId) setActiveTabId(selectedTabId);
      setTimeout(() => scrollToWidgetAndHighlight(result.widget.id, true), 100);
    }
  };

  const handleGoToNote = (widget) => {
    if (widget.tab_id !== activeTabId) {
      setActiveTabId(widget.tab_id);
      setTimeout(() => scrollToWidgetAndHighlight(widget.id, false), 150);
    } else {
      scrollToWidgetAndHighlight(widget.id, false);
    }
  };

  // --- NOWA FUNKCJA USUWANIA ---
  const handleDeleteNote = async (e, widget) => {
    e.stopPropagation(); // Ważne: żeby nie triggerować przejścia do notatki (onClick na ListItem)
    
    if (window.confirm(`Czy na pewno usunąć notatkę "${widget.name}"?`)) {
      await removeWidget(widget.id);
    }
  };

  const scrollToWidgetAndHighlight = (widgetId, openEditor = false) => {
    const element = document.getElementById(`widget-${widgetId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('widget-highlight');
      setTimeout(() => element.classList.remove('widget-highlight'), 2000);
      if (openEditor) {
        setTimeout(() => {
          const editButton = element.querySelector('[data-edit-button="true"]');
          if (editButton) editButton.click();
        }, 500);
      }
    }
  };

  return (
    <Box sx={{ minHeight: MIN_WIDGET_HEIGHT }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedTabId}
            onChange={(e) => setSelectedTabId(e.target.value)}
            displayEmpty
          >
            {tabs.map(tab => (
              <MenuItem key={tab.id} value={tab.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.name}
                  <Chip label={notesCountByTab[tab.id] || 0} size="small" sx={{ height: 20, fontSize: '0.7rem' }}/>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleAddNote}>
          Dodaj
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {notesInSelectedTab.length} {notesInSelectedTab.length === 1 ? 'notatka' : 'notatek'} w tej zakładce
      </Typography>

      {notesInSelectedTab.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <NoteIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">Brak notatek w tej zakładce</Typography>
          <Typography variant="caption">Kliknij "Dodaj" aby utworzyć pierwszą</Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ mx: -1 }}>
          {notesInSelectedTab.map((widget) => (
            <ListItem
              key={widget.id}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              // Kliknięcie w cały wiersz przenosi do notatki
              onClick={() => handleGoToNote(widget)}
              
              // --- SEKCJA AKCJI PO PRAWEJ STRONIE ---
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  
                  {/* Przycisk Przejdź */}
                  <Tooltip title="Przejdź do notatki">
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => handleGoToNote(widget)}
                    >
                      <GoToIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {/* Separator */}
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />
                  
                  {/* Przycisk Usuń */}
                  <Tooltip title="Usuń notatkę">
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={(e) => handleDeleteNote(e, widget)}
                      sx={{ 
                        color: 'text.disabled', 
                        '&:hover': { color: 'error.main' } 
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <NoteIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getTitle(widget.config?.content)}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                      {getPreview(widget.config?.content)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDate(widget.created_at)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <style>{`
        @keyframes widgetHighlight {
          0% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7); }
          50% { box-shadow: 0 0 20px 10px rgba(255, 152, 0, 0.4); }
          100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
        }
        .widget-highlight { animation: widgetHighlight 1.5s ease-out; }
      `}</style>
    </Box>
  );
}

export default NotesList;