import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Grid,
  Alert,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useWidgets } from '../context/WidgetsContext';
import { getAvailableWidgetTypes, WIDGET_SCHEMAS } from '../widgets/widgetSchemas';
import WidgetFormDialog from '../components/WidgetFormDialog';

function WidgetsTab() {
  const { widgets, loading, addWidget, editWidget, removeWidget } = useWidgets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  const availableTypes = getAvailableWidgetTypes();

  const handleAddClick = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleSelectType = (type) => {
    setDialogType(type);
    setEditingWidget(null);
    setDialogOpen(true);
    handleAddMenuClose();
  };

  const handleEdit = (widget) => {
    setDialogType(widget.type);
    setEditingWidget(widget);
    setDialogOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Czy na pewno usunąć widget "${name}"?`)) {
      return;
    }

    const result = await removeWidget(id);
    if (result.success) {
      toast.success('Widget usunięty');
    } else {
      toast.error('Błąd usuwania');
    }
  };

  const handleSave = async (data) => {
    let result;
    
    if (editingWidget) {
      // Edycja
      result = await editWidget(editingWidget.id, data);
      if (result.success) {
        toast.success('Widget zaktualizowany');
      }
    } else {
      // Nowy widget
      result = await addWidget(data.type, data.name, data.config);
      if (result.success) {
        toast.success('Widget dodany');
      }
    }

    if (result.success) {
      setDialogOpen(false);
    } else {
      toast.error(result.error || 'Błąd zapisu');
    }
  };

  const getWidgetIcon = (type) => {
    // Na razie tylko Notes, później dodamy więcej
    switch (type) {
      case 'notes':
        return <NotesIcon />;
      default:
        return <NotesIcon />;
    }
  };

  if (loading) {
    return <Typography>Ładowanie...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Widgety ({widgets.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Dodaj widget
        </Button>
        
        <Menu
          anchorEl={addMenuAnchor}
          open={Boolean(addMenuAnchor)}
          onClose={handleAddMenuClose}
        >
          {availableTypes.map(type => (
            <MenuItem key={type.value} onClick={() => handleSelectType(type.value)}>
              <ListItemIcon>
                {getWidgetIcon(type.value)}
              </ListItemIcon>
              <ListItemText 
                primary={type.label}
                secondary={type.description}
              />
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {widgets.length === 0 ? (
        <Alert severity="info">
          Nie masz jeszcze żadnych widgetów. Kliknij "Dodaj widget", aby rozpocząć.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {widgets.map(widget => {
            const schema = WIDGET_SCHEMAS[widget.type];
            return (
              <Grid item xs={12} sm={6} md={4} key={widget.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getWidgetIcon(widget.type)}
                      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                        {widget.name}
                      </Typography>
                      <Chip label={schema?.label || widget.type} size="small" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Pozycja: {widget.position}
                    </Typography>
                    
                    {widget.type === 'notes' && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {widget.config.content?.substring(0, 100)}...
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(widget)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(widget.id, widget.name)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog dodawania/edycji */}
      {dialogType && (
        <WidgetFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          widgetType={dialogType}
          initialData={editingWidget}
        />
      )}
    </Box>
  );
}

export default WidgetsTab;