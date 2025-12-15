import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWidgets, createWidget, updateWidget, deleteWidget } from '../services/api';

const WidgetsContext = createContext();

export function WidgetsProvider({ children }) {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      const res = await getWidgets();
      setWidgets(res.data);
    } catch (err) {
      console.error('Błąd ładowania widgetów:', err);
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (type, name, config) => {
    try {
      const res = await createWidget({ type, name, config });
      setWidgets(prev => [...prev, res.data]);
      return { success: true, widget: res.data };
    } catch (err) {
      console.error('Błąd dodawania widgetu:', err);
      return { success: false, error: err.message };
    }
  };

  const editWidget = async (id, updates) => {
    try {
      console.log('=== editWidget CALLED ===');
      console.log('ID:', id);
      console.log('Updates:', updates);
      
      const res = await updateWidget(id, updates);
      
      console.log('=== BACKEND RESPONSE ===');
      console.log('Response data:', res.data);
      console.log('Response data.size:', res.data.size);
      
      setWidgets(prev => prev.map(w => w.id === id ? res.data : w));
      return { success: true, widget: res.data };
    } catch (err) {
      console.error('Błąd aktualizacji widgetu:', err);
      return { success: false, error: err.message };
    }
  };

  const removeWidget = async (id) => {
    try {
      await deleteWidget(id);
      setWidgets(prev => prev.filter(w => w.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Błąd usuwania widgetu:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <WidgetsContext.Provider 
      value={{ 
        widgets, 
        setWidgets,  // Dla optimistic updates (drag & drop)
        loading, 
        addWidget, 
        editWidget, 
        removeWidget,
        refetch: fetchWidgets 
      }}
    >
      {children}
    </WidgetsContext.Provider>
  );
}

export const useWidgets = () => {
  const context = useContext(WidgetsContext);
  if (!context) {
    throw new Error('useWidgets must be used within WidgetsProvider');
  }
  return context;
};