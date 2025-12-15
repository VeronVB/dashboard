import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormHelperText,
  MenuItem,
  Typography
} from '@mui/material';
import { WIDGET_SCHEMAS } from '../widgets/widgetSchemas';

/**
 * EditWidgetDialog - Modal edycji konfiguracji istniejącego widgetu
 * Pozwala zmienić displayMode, fontSize i inne parametry bez usuwania widgetu
 */
function EditWidgetDialog({ open, onClose, onSave, widget }) {
  const [name, setName] = useState('');
  const [config, setConfig] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && widget) {
      setName(widget.name);
      setConfig(widget.config || {});
      setErrors({});
    }
  }, [open, widget]);

  if (!widget) return null;

  const schema = WIDGET_SCHEMAS[widget.type];
  if (!schema) return null;

  const handleSave = () => {
    // Walidacja
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nazwa jest wymagana';
    }

    schema.fields.forEach(field => {
      if (field.required && !config[field.name]) {
        newErrors[field.name] = `${field.label} jest wymagane`;
      }
      
      if (field.type === 'number' && config[field.name]) {
        const val = Number(config[field.name]);
        if (field.min !== undefined && val < field.min) {
          newErrors[field.name] = `Minimalna wartość: ${field.min}`;
        }
        if (field.max !== undefined && val > field.max) {
          newErrors[field.name] = `Maksymalna wartość: ${field.max}`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Zapisz
    onSave({
      name: name.trim(),
      config
    });
  };

  const renderField = (field) => {
    const value = config[field.name] ?? (field.default || '');
    
    // Sprawdź warunkowe wyświetlanie
    if (field.showIf && typeof field.showIf === 'function') {
      if (!field.showIf(config)) return null;
    }
    
    const handleChange = (newValue) => {
      setConfig(prev => ({ ...prev, [field.name]: newValue }));
      // Wyczyść błąd dla tego pola
      if (errors[field.name]) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[field.name];
          return next;
        });
      }
    };

    switch (field.type) {
      case 'select':
        return (
          <TextField
            key={field.name}
            fullWidth
            select
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            required={field.required}
            sx={{ mb: 2 }}
          >
            {field.options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      
      case 'textarea':
        return (
          <TextField
            key={field.name}
            fullWidth
            multiline
            rows={field.rows || 4}
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            required={field.required}
            sx={{ mb: 2 }}
          />
        );
      
      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            type="number"
            label={field.label}
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            inputProps={{
              min: field.min,
              max: field.max,
            }}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            required={field.required}
            sx={{ mb: 2 }}
          />
        );
      
      case 'text':
      default:
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            required={field.required}
            sx={{ mb: 2 }}
          />
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edytuj widget</DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Typ widgetu (read-only) */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Typ: {schema.label}
          </Typography>

          {/* Nazwa widgetu */}
          <TextField
            fullWidth
            label="Nazwa widgetu"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors(prev => {
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }
            }}
            error={!!errors.name}
            helperText={errors.name || 'Opisowa nazwa dla widgetu'}
            required
            sx={{ mb: 3 }}
          />

          {/* Pola konfiguracji */}
          {schema.fields.map(renderField)}

          {/* Info o zmianie danych */}
          {(widget.type === 'notes' && config.displayMode !== widget.config?.displayMode) && (
            <FormHelperText sx={{ mt: 2, color: 'warning.main' }}>
              ⚠️ Zmiana trybu wyświetlania wyczyści obecne dane widgetu.
            </FormHelperText>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Anuluj
        </Button>
        <Button onClick={handleSave} variant="contained">
          Zapisz zmiany
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditWidgetDialog;