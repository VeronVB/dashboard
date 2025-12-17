import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { WIDGET_SCHEMAS, validateWidgetConfig, getDefaultConfig } from '../widgets/widgetSchemas';
// Dodaj import API
import { getEndpoints } from '../services/api'; 

function WidgetFormDialog({ open, onClose, onSave, widgetType, initialData = null }) {
  const schema = WIDGET_SCHEMAS[widgetType];
  const [name, setName] = useState('');
  const [config, setConfig] = useState({});
  const [errors, setErrors] = useState({});
  
  // Stan na dynamiczne opcje (np. lista endpointów)
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setConfig(initialData.config);
    } else {
      setName(schema?.label || '');
      setConfig(getDefaultConfig(widgetType));
    }
    setErrors({});
    setDynamicOptions({}); // Reset opcji przy zmianie

    // Logika pobierania danych zależna od typu widgetu
    if (open && widgetType === 'docker-mini') {
      fetchEndpoints();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, widgetType, schema, open]);

  const fetchEndpoints = async () => {
    setLoadingOptions(true);
    try {
      const res = await getEndpoints();
      const options = res.data.map(ep => ({
        value: ep.id,
        label: `${ep.name} (ID: ${ep.id})`
      }));
      
      setDynamicOptions(prev => ({ ...prev, endpointId: options }));

      // Jeśli to nowy widget i nie ma wybranego endpointa, wybierz pierwszy z listy
      if (!initialData && options.length > 0) {
        setConfig(prev => ({ ...prev, endpointId: options[0].value }));
      }
    } catch (err) {
      console.error('Failed to load endpoints', err);
      // Fallback: pozwól wpisać ręcznie w razie błędu? 
      // Tutaj po prostu zostawiamy pustą listę.
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSave = () => {
    const validation = validateWidgetConfig(widgetType, config);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    if (!name.trim()) {
      setErrors({ name: 'Nazwa jest wymagana' });
      return;
    }
    onSave({
      type: widgetType,
      name: name.trim(),
      config
    });
  };

  const renderField = (field) => {
    const value = config[field.name] ?? (field.default || '');
    
    if (field.showIf && typeof field.showIf === 'function') {
      if (!field.showIf(config)) return null;
    }

    const handleChange = (newValue) => {
      setConfig(prev => ({ ...prev, [field.name]: newValue }));
      if (errors[field.name]) {
        setErrors(prev => { const n = { ...prev }; delete n[field.name]; return n; });
      }
    };

    // Sprawdź czy mamy dynamiczne opcje dla tego pola, jeśli nie - użyj tych ze schematu
    const fieldOptions = dynamicOptions[field.name] || field.options || [];

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
            disabled={loadingOptions && !fieldOptions.length && field.name === 'endpointId'}
            sx={{ mb: 2 }}
          >
            {fieldOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
            {/* Wyświetl loading wewnątrz listy jeśli pusta */}
            {field.name === 'endpointId' && loadingOptions && (
              <MenuItem disabled><CircularProgress size={20} /></MenuItem>
            )}
          </TextField>
        );
      
      // ... (reszta case'ów: textarea, number, text - bez zmian)
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
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
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
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            sx={{ mb: 2 }}
          />
        );
      default:
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            error={!!errors[field.name]}
            helperText={errors[field.name] || field.helperText}
            sx={{ mb: 2 }}
          />
        );
    }
  };

  if (!schema) return null;

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
            onChange={(e) => setName(e.target.value)}
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
        <Button onClick={handleSave} variant="contained" disabled={loadingOptions}>
          {initialData ? 'Zapisz' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WidgetFormDialog;