import React from 'react';
import { Alert } from '@mui/material';
import SingleNote from './SingleNote';
import NotesList from './NotesList';
import TodoList from './TodoList';

/**
 * NotesWidget - główny komponent routujący do 3 trybów
 */
function NotesWidget({ widget, onUpdate }) {
  const { config } = widget;
  const displayMode = config.displayMode || 'note';

  switch (displayMode) {
    case 'note':
      return (
        <SingleNote
          content={config.content || ''}
          fontSize={config.fontSize || 14}
          onUpdate={(newContent) => {
            onUpdate({ ...config, content: newContent });
          }}
        />
      );

    case 'notes-list':
      return (
        <NotesList
          notes={config.notes || []}
          onUpdate={(newNotes) => {
            onUpdate({ ...config, notes: newNotes });
          }}
        />
      );

    case 'todo-list':
      return (
        <TodoList
          todos={config.todos || []}
          onUpdate={(newTodos) => {
            onUpdate({ ...config, todos: newTodos });
          }}
        />
      );

    default:
      return (
        <Alert severity="error">
          Nieznany tryb wyświetlania: {displayMode}
        </Alert>
      );
  }
}

export default NotesWidget;