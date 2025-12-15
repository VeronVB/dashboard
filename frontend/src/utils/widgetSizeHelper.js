/**
 * Konwertuje rozmiar widgetu na kolumny Grid
 * 
 * @param {string} size - 'small' | 'medium' | 'large'
 * @returns {object} - { xs, sm, md } dla Grid item
 */
export const getWidgetGridSize = (size = 'medium') => {
  switch (size) {
    case 'small':
      return { xs: 12, sm: 6, md: 4 };   // 4 kolumny (33%)
    
    case 'large':
      return { xs: 12, sm: 12, md: 12 }; // 12 kolumn (100%)
    
    case 'medium':
    default:
      return { xs: 12, sm: 6, md: 6 };   // 6 kolumn (50%)
  }
};

/**
 * Labelki dla UI
 */
export const WIDGET_SIZE_LABELS = {
  small: 'Mały (1/3 szerokości)',
  medium: 'Średni (1/2 szerokości)',
  large: 'Duży (pełna szerokość)'
};