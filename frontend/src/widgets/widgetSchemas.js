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
          { value: 'notes-list', label: 'Przeglądarka notatek (agregator)' },
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
      },
      {
        name: 'autoExpand',
        label: 'Automatyczne rozwijanie',
        type: 'select',
        default: false,
        options: [
          { value: false, label: 'Nie - zwijaj długą treść (domyślne)' },
          { value: true, label: 'Tak - zawsze pokazuj całą treść' }
        ],
        helperText: 'Gdy wyłączone, długa treść będzie zwinięta z przyciskiem "rozwiń"'
      }
    ]
  },

  'docker-mini': {
    label: 'Docker Mini',
    icon: 'dns',
    description: 'Status kontenerów z wybranego endpointa',
    fields: [
      {
        name: 'endpointId',
        label: 'Endpoint Portainer',
        type: 'select',      // Zmieniamy z 'number' na 'select'
        required: true,
        default: '',
        options: [],         // Będzie wypełnione dynamicznie
        helperText: 'Wybierz środowisko z listy'
      },
      {
        name: 'containerFilter',
        label: 'Filtr nazw (Regex)',
        type: 'text',
        default: '',
        helperText: 'Opcjonalnie: np. "prod|db" aby filtrować listę',
      },
      {
        name: 'showActions',
        label: 'Pokaż akcje',
        type: 'select',
        default: true,
        options: [
          { value: true, label: 'Tak' },
          { value: false, label: 'Nie' }
        ]
      }
    ]
  },

  qbittorrent: {
    label: 'qBittorrent',
    icon: 'download',
    description: 'Podgląd i zarządzanie torrentami przez WebUI API',
    fields: [
      {
        name: 'name',
        label: 'Nazwa instancji',
        type: 'text',
        required: true,
        default: 'qBittorrent',
      },
      {
        name: 'host',
        label: 'Host (np. http://192.168.1.50)',
        type: 'text',
        required: true,
        default: 'http://localhost',
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: true,
        default: 8080,
      },
      {
        name: 'username',
        label: 'Użytkownik',
        type: 'text',
        required: true,
        default: '',
      },
      {
        name: 'password',
        label: 'Hasło',
        type: 'password',
        required: true,
        default: '',
      },
      {
        name: 'refreshInterval',
        label: 'Częstotliwość odświeżania (sekundy)',
        type: 'number',
        default: 20,
        min: 5,
        max: 300,
      },
      {
        name: 'viewMode',
        label: 'Tryb widoku',
        type: 'select',
        default: 'table',
        options: [
          { value: 'table', label: 'Tabela' },
          { value: 'cards', label: 'Kafle' },
        ],
      },
    ],
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