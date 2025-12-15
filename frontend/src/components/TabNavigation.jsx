import React, { useState } from 'react';
import { 
  Tabs, Tab, Box, IconButton, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, Button, Menu, MenuItem 
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useWidgets } from '../context/WidgetsContext';
import { useEditMode } from '../context/EditModeContext';

function TabNavigation() {
  const { tabs, activeTabId, setActiveTabId, addTab, modifyTab, removeTab } = useWidgets();
  const { editMode } = useEditMode();

  // State dla dialogów i menu
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [editTabOpen, setEditTabOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [editTabName, setEditTabName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTabId, setSelectedTabId] = useState(null);

  const handleChange = (event, newValue) => {
    setActiveTabId(newValue);
  };

  const handleCreate = async () => {
    if (newTabName.trim()) {
      await addTab(newTabName);
      setNewTabName('');
      setNewTabOpen(false);
    }
  };

  const handleEditOpen = (tab) => {
    setEditTabName(tab.name);
    setSelectedTabId(tab.id);
    setEditTabOpen(true);
    setAnchorEl(null);
  };

  const handleUpdate = async () => {
    if (editTabName.trim() && selectedTabId) {
      await modifyTab(selectedTabId, editTabName);
      setEditTabOpen(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTabId && window.confirm('Usunąć zakładkę i wszystkie jej widgety?')) {
      await removeTab(selectedTabId);
      setAnchorEl(null);
    }
  };

  const openMenu = (event, tabId) => {
    event.stopPropagation(); // Żeby nie zmieniać taba przy kliku w menu
    setSelectedTabId(tabId);
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
      <Tabs 
        value={activeTabId || false} 
        onChange={handleChange} 
        variant="scrollable" 
        scrollButtons="auto"
        sx={{ flexGrow: 1 }}
      >
        {tabs.map((tab) => (
          <Tab 
            key={tab.id} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.name}
                {editMode && activeTabId === tab.id && (
                  <IconButton size="small" onClick={(e) => openMenu(e, tab.id)} sx={{ p: 0.5 }}>
                    <MoreIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            } 
            value={tab.id} 
          />
        ))}
      </Tabs>

      {editMode && (
        <IconButton onClick={() => setNewTabOpen(true)} sx={{ ml: 1 }}>
          <AddIcon />
        </IconButton>
      )}

      {/* Menu edycji zakładki */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleEditOpen(tabs.find(t => t.id === selectedTabId))}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Zmień nazwę
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Usuń zakładkę
        </MenuItem>
      </Menu>

      {/* Dialog Nowej Zakładki */}
      <Dialog open={newTabOpen} onClose={() => setNewTabOpen(false)}>
        <DialogTitle>Nowa zakładka</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa zakładki"
            fullWidth
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTabOpen(false)}>Anuluj</Button>
          <Button onClick={handleCreate} variant="contained">Stwórz</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edycji Zakładki */}
      <Dialog open={editTabOpen} onClose={() => setEditTabOpen(false)}>
        <DialogTitle>Edytuj zakładkę</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa zakładki"
            fullWidth
            value={editTabName}
            onChange={(e) => setEditTabName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTabOpen(false)}>Anuluj</Button>
          <Button onClick={handleUpdate} variant="contained">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TabNavigation;