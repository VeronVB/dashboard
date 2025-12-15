import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Collapse,
  Divider,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NoteEditorModal from './NoteEditorModal';

/**
 * NotesList - Lista notatek
 * displayMode: 'notes-list'
 */
function NotesList({ notes, onUpdate }) {
  const [expanded, setExpanded] = useState({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Usunąć tę notatkę?')) {
      onUpdate(notes.filter(n => n.id !== id));
    }
  };

  const handleSave = (content) => {
    if (editingNote) {
      // Edycja
      onUpdate(notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, content, updatedAt: new Date().toISOString() }
          : n
      ));
    } else {
      // Nowa notatka
      const newNote = {
        id: Date.now(),
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdate([...notes, newNote]);
    }
    setEditorOpen(false);
  };

  const getTitle = (content) => {
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#+\s*/, '').substring(0, 50) || 'Bez tytułu';
  };

  return (
    <Box>
      {/* Header z przyciskiem dodaj */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Notatki ({notes.length})
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={handleAdd}>
          Dodaj
        </Button>
      </Box>

      {/* Lista notatek */}
      {notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Brak notatek. Kliknij "Dodaj" aby utworzyć pierwszą.
        </Typography>
      ) : (
        <List disablePadding>
          {notes.map((note, index) => (
            <React.Fragment key={note.id}>
              {index > 0 && <Divider />}
              <ListItem
                disablePadding
                sx={{ flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 1 }}>
                  <IconButton size="small" onClick={() => toggleExpand(note.id)}>
                    {expanded[note.id] ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                  
                  <ListItemText
                    primary={getTitle(note.content)}
                    secondary={new Date(note.updatedAt).toLocaleString('pl-PL')}
                    sx={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => toggleExpand(note.id)}
                  />

                  <IconButton size="small" onClick={() => handleEdit(note)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(note.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Collapse in={expanded[note.id]} timeout="auto">
                  <Box sx={{ p: 2, bgcolor: 'action.hover', fontSize: '0.9em' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content}
                    </ReactMarkdown>
                  </Box>
                </Collapse>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Editor Modal */}
      <NoteEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        initialContent={editingNote?.content || ''}
        title={editingNote ? 'Edytuj notatkę' : 'Nowa notatka'}
      />
    </Box>
  );
}

export default NotesList;