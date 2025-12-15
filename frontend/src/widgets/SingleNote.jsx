import React, { useState } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditMode } from '../context/EditModeContext';
import NoteEditorModal from './NoteEditorModal';

/**
 * SingleNote - Pojedyncza notatka Markdown
 * displayMode: 'note'
 */
function SingleNote({ content, fontSize, onUpdate }) {
  const { editMode } = useEditMode();
  const [editorOpen, setEditorOpen] = useState(false);

  const isEmpty = !content || content.trim() === '';

  const handleSave = (newContent) => {
    onUpdate(newContent);
    setEditorOpen(false);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 100 }}>
      {/* Edytuj button - tylko w edit mode lub gdy pusta */}
      {true && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 2, 
          right: 10, 
          zIndex: 10 
        }}>
          <Tooltip title="Edytuj notatkę">
            <IconButton 
              size="small" 
              onClick={() => setEditorOpen(true)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Content */}
      {isEmpty ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'text.secondary',
            cursor: 'pointer'
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
            p: 2,
            minHeight: 150,
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
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