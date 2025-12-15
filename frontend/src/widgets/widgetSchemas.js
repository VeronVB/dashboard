/**
 * Schematy konfiguracji widgetów
 * Każdy schema definiuje:
 * - label: nazwa wyświetlana w UI
 * - icon: nazwa pliku ikony (z @loganmarchione/homelab-svg-assets lub /uploads/icons/)
 * - fields: pola formularza konfiguracji
 */

export const WIDGET_SCHEMAS = {
  notes: {
    label: 'Notatki',
    icon: 'notes',
    description: 'Notatki, listy zadań i TODO',
    fields: [
      {
        name: 'displayMode',
        label: 'Tryb wyświetlania',
        type: 'select',
        required: true,
        default: 'note',
        options: [
          { value: 'note', label: 'Pojedyncza notatka Markdown' },
          { value: 'notes-list', label: 'Lista notatek' },
          { value: 'todo-list', label: 'Lista TODO (checklist)' }
        ],
        helperText: 'Wybierz jak widget ma działać'
      },
      {
        name: 'fontSize',
        label: 'Rozmiar czcionki (px)',
        type: 'number',
        default: 14,
        min: 10,
        max: 24,
        showIf: (config) => config.displayMode === 'note',
        helperText: 'Tylko dla trybu "Pojedyncza notatka"'
      }
    ]
  },
  
  // Następne widgety dodamy w kolejnych fazach:
  // qbittorrent: { ... },
  // pihole: { ... },
};

/**
 * Pobierz dostępne typy widgetów
 */
export const getAvailableWidgetTypes = () => {
  return Object.keys(WIDGET_SCHEMAS).map(type => ({
    value: type,
    label: WIDGET_SCHEMAS[type].label,
    description: WIDGET_SCHEMAS[type].description
  }));
};

/**
 * Walidacja konfiguracji widgetu
 */
export const validateWidgetConfig = (type, config) => {
  const schema = WIDGET_SCHEMAS[type];
  if (!schema) {
    throw new Error(`Unknown widget type: ${type}`);
  }
  
  const errors = {};
  
  schema.fields.forEach(field => {
    if (field.required && !config[field.name]) {
      errors[field.name] = 'To pole jest wymagane';
    }
    
    if (field.type === 'number' && config[field.name]) {
      const val = config[field.name];
      if (field.min !== undefined && val < field.min) {
        errors[field.name] = `Minimalna wartość: ${field.min}`;
      }
      if (field.max !== undefined && val > field.max) {
        errors[field.name] = `Maksymalna wartość: ${field.max}`;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Utwórz domyślną konfigurację dla typu widgetu
 */
export const getDefaultConfig = (type) => {
  const schema = WIDGET_SCHEMAS[type];
  if (!schema) return {};
  
  const config = {};
  schema.fields.forEach(field => {
    if (field.default !== undefined) {
      config[field.name] = field.default;
    }
  });
  
  return config;
};