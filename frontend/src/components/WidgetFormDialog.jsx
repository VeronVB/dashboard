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
  MenuItem
} from '@mui/material';
import { WIDGET_SCHEMAS, validateWidgetConfig, getDefaultConfig } from '../widgets/widgetSchemas';

function WidgetFormDialog({ open, onClose, onSave, widgetType, initialData = null }) {
  const schema = WIDGET_SCHEMAS[widgetType];
  const [name, setName] = useState('');
  const [config, setConfig] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Edycja - załaduj istniejące dane
      setName(initialData.name);
      setConfig(initialData.config);
    } else {
      // Nowy widget - użyj domyślnych wartości
      setName(schema.label);
      setConfig(getDefaultConfig(widgetType));
    }
    setErrors({});
  }, [initialData, widgetType, schema, open]);

  const handleSave = () => {
    // Walidacja
    const validation = validateWidgetConfig(widgetType, config);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (!name.trim()) {
      setErrors({ name: 'Nazwa jest wymagana' });
      return;
    }

    // Zapisz
    onSave({
      type: widgetType,
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

  if (!schema) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edytuj widget' : 'Dodaj widget'}: {schema.label}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Nazwa wyświetlana"
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
            helperText={errors.name}
            required
            sx={{ mb: 3 }}
          />

          {schema.fields.map(renderField)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleSave} variant="contained">
          {initialData ? 'Zapisz' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WidgetFormDialog;