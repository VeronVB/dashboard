import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';

/**
 * SortableWidget - Wrapper dla widgetu z drag & drop
 * Używa @dnd-kit/sortable do obsługi przeciągania
 */
function SortableWidget({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled,
    transition: {
      duration: 150, // Szybsza animacja
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform), // Tylko przesunięcie, bez scale
    transition: transition || 'transform 150ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        // Wyłącz dotykanie podczas drag
        touchAction: 'none',
        // Cursor
        cursor: disabled ? 'default' : 'grab',
        '&:active': {
          cursor: disabled ? 'default' : 'grabbing'
        }
      }}
    >
      {children}
    </Box>
  );
}

export default SortableWidget;