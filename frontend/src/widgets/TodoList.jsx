import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  TextField,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

/**
 * TodoList - Lista TODO z checkboxami
 * displayMode: 'todo-list'
 */
function TodoList({ todos, onUpdate }) {
  const [newTodoText, setNewTodoText] = useState('');

  const handleToggle = (id) => {
    onUpdate(todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const handleAdd = () => {
    if (!newTodoText.trim()) return;
    
    const newTodo = {
      id: Date.now(),
      text: newTodoText.trim(),
      done: false,
      createdAt: new Date().toISOString()
    };
    
    onUpdate([...todos, newTodo]);
    setNewTodoText('');
  };

  const handleDelete = (id) => {
    onUpdate(todos.filter(t => t.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const doneCount = todos.filter(t => t.done).length;
  const totalCount = todos.length;

  return (
    <Box>
      {/* Header z licznikiem */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {doneCount}/{totalCount} wykonanych
        </Typography>
      </Box>

      {/* Input dodawania */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Dodaj nowe zadanie..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleAdd}
          disabled={!newTodoText.trim()}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* Lista TODO */}
      {todos.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Brak zadań. Dodaj pierwsze powyżej.
        </Typography>
      ) : (
        <List disablePadding>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              dense
              disablePadding
              sx={{
                '&:hover .delete-btn': { opacity: 1 }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Checkbox
                  edge="start"
                  checked={todo.done}
                  onChange={() => handleToggle(todo.id)}
                  size="small"
                />
              </ListItemIcon>
              
              <ListItemText
                primary={todo.text}
                sx={{
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? 'text.secondary' : 'text.primary',
                  opacity: todo.done ? 0.6 : 1
                }}
              />

              <IconButton
                className="delete-btn"
                size="small"
                onClick={() => handleDelete(todo.id)}
                sx={{ opacity: 0, transition: 'opacity 0.2s' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default TodoList;