import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * SortableWidget - Wrapper dla widgetu z drag & drop
 * Używa @dnd-kit/sortable do obsługi przeciągania
 */
function SortableWidget({ id, widget, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: { size: widget?.size },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: isDragging ? CSS.Translate.toString(transform) : undefined,
        transition: isDragging ? transition : undefined,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: disabled ? 'default' : 'grab',
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.cursor = 'grabbing';
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.cursor = 'grab';
      }}
    >
      {children}
    </div>
  );
}

export default SortableWidget;