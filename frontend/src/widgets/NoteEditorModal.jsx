import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

/**
 * NoteEditorModal - Modal z profesjonalnym edytorem Markdown
 * Używa @uiw/react-md-editor z toolbarem i live preview
 */
function NoteEditorModal({ open, onClose, onSave, initialContent = '', title = 'Edytuj' }) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [open, initialContent]);

  const handleSave = () => {
    onSave(content);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          maxHeight: '90vh',
          m: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent 
        sx={{ 
          p: 0, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
      >
        <Box 
          sx={{ 
            flex: 1,
            overflow: 'hidden',
            p: 2,
            '& .w-md-editor': {
              height: '100% !important',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper'
            },
            '& .w-md-editor-toolbar': {
              bgcolor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
              padding: '8px'
            },
            '& .w-md-editor-content': {
              bgcolor: 'background.paper'
            },
            '& .w-md-editor-input': {
              color: 'text.primary',
              bgcolor: 'background.paper'
            },
            '& .w-md-editor-preview': {
              bgcolor: 'background.paper',
              color: 'text.primary'
            },
            '& .w-md-editor-toolbar-child': {
              color: 'text.secondary'
            },
            '& .w-md-editor-toolbar ul > li button:hover': {
              bgcolor: 'action.hover'
            },
            '& .w-md-editor-toolbar ul > li.active button': {
              bgcolor: 'action.selected'
            }
          }}
        >
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height="100%"
            preview="live"
            hideToolbar={false}
            enableScroll={true}
            visibleDragbar={true}
            highlightEnable={true}
            textareaProps={{
              placeholder: 'Napisz notatkę w Markdown...\n\n# Nagłówek\n## Podtytuł\n\n**Pogrubiony** *Kursywa*\n\n- Lista\n- Elementów\n\n1. Numerowana\n2. Lista\n\n[Link](https://example.com)\n\n```javascript\nconsole.log("Kod");\n```\n\n> Cytat\n\n| Kolumna 1 | Kolumna 2 |\n|-----------|-----------|'
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Anuluj
        </Button>
        <Button onClick={handleSave} variant="contained">
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NoteEditorModal;