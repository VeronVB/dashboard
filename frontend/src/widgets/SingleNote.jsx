import React, { useState } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NoteEditorModal from './NoteEditorModal';

// ============================================================
// KONFIGURACJA WYSOKOŚCI
// Zmniejszono do 19px aby zmieścił się w 200px (DEFAULT_COLLAPSED_HEIGHT)
// ============================================================
const MIN_WIDGET_HEIGHT = 190; 

/**
 * SingleNote - Pojedyncza notatka Markdown
 * displayMode: 'note'
 */
function SingleNote({ content, fontSize, onUpdate }) {
  const [editorOpen, setEditorOpen] = useState(false);

  const isEmpty = !content || content.trim() === '';

  const handleSave = (newContent) => {
    onUpdate(newContent);
    setEditorOpen(false);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: MIN_WIDGET_HEIGHT, height: '100%' }}>
      {/* Content */}
      {isEmpty ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'text.secondary',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setEditorOpen(true)}
        >
          <Typography variant="body2">
            Brak treści. Kliknij aby dodać notatkę.
          </Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            pb: 4, // Padding na przycisk edycji
            '& h1': { fontSize: '2em', mt: 0, mb: 2 },
            '& h2': { fontSize: '1.5em', mt: 2, mb: 1 },
            '& h3': { fontSize: '1.2em', mt: 1, mb: 1 },
            '& p': { mb: 1 },
            '& ul, & ol': { pl: 3, mb: 1 },
            '& code': { 
              bgcolor: 'action.hover', 
              px: 0.5, 
              py: 0.2, 
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.9em'
            },
            '& pre': { 
              bgcolor: 'action.hover', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto'
            },
            '& blockquote': {
              borderLeft: 3,
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              color: 'text.secondary',
              fontStyle: 'italic'
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              mb: 2
            },
            '& th, & td': {
              border: 1,
              borderColor: 'divider',
              p: 1,
              textAlign: 'left'
            },
            '& th': {
              bgcolor: 'action.hover',
              fontWeight: 'bold'
            }
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </Box>
      )}

      {/* Przycisk edycji - ZAWSZE w prawym dolnym rogu */}
      <Tooltip title="Edytuj notatkę">
        <IconButton 
          size="small" 
          onClick={() => setEditorOpen(true)}
          data-edit-button="true"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            color: 'text.secondary',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 1,
            zIndex: 5,
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Editor Modal */}
      <NoteEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        initialContent={content}
        title="Edytuj notatkę"
      />
    </Box>
  );
}

export default SingleNote;