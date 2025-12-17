import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getWidgets, createWidget, updateWidget, deleteWidget, 
  getTabs, createTab as apiCreateTab, updateTab as apiUpdateTab, deleteTab as apiDeleteTab 
} from '../services/api';

const WidgetsContext = createContext();

export function WidgetsProvider({ children }) {
  const [widgets, setWidgets] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // Pobieramy równolegle widgety i zakładki
      const [widgetsRes, tabsRes] = await Promise.all([
        getWidgets(),
        getTabs()
      ]);
      
      // Axios zwraca dane w .data, upewnij się że to tablice
      const widgetsData = Array.isArray(widgetsRes.data) ? widgetsRes.data : [];
      const tabsData = Array.isArray(tabsRes.data) ? tabsRes.data : [];

      setWidgets(widgetsData);
      setTabs(tabsData);
      
      // Ustaw domyślną zakładkę, jeśli żadna nie jest wybrana
      if (tabsData.length > 0 && !activeTabId) {
        setActiveTabId(tabsData[0].id);
      }
    } catch (err) {
      console.error('Błąd ładowania danych:', err);
      // W razie błędu ustaw puste tablice, żeby nie wywalić aplikacji (filter error)
      setWidgets([]); 
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dodaje nowy widget
   * @param {string} type - typ widgetu (np. 'notes')
   * @param {string} name - nazwa widgetu
   * @param {object} config - konfiguracja widgetu
   * @param {object} options - opcje dodatkowe
   * @param {number} options.targetTabId - ID zakładki docelowej (domyślnie activeTabId)
   * @param {string} options.size - rozmiar widgetu: 'small' | 'medium' | 'large' (domyślnie 'medium')
   */
  const addWidget = async (type, name, config, options = {}) => {
    try {
      const tabId = options.targetTabId || activeTabId;
      const size = options.size || 'medium';
      
      if (!tabId) throw new Error("Nie wybrano zakładki");
      
      const res = await createWidget({ type, name, config, tab_id: tabId, size });
      setWidgets(prev => [...prev, res.data]);
      return { success: true, widget: res.data };
    } catch (err) {
      console.error('Błąd dodawania widgetu:', err);
      return { success: false, error: err.message };
    }
  };

  const editWidget = async (id, updates) => {
    try {
      const res = await updateWidget(id, updates);
      setWidgets(prev => prev.map(w => w.id === id ? res.data : w));
      return { success: true, widget: res.data };
    } catch (err) {
      console.error('Błąd edycji widgetu:', err);
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

  // --- TAB ACTIONS ---

  const addTab = async (name) => {
    try {
      const res = await apiCreateTab(name);
      setTabs(prev => [...prev, res.data]);
      setActiveTabId(res.data.id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const modifyTab = async (id, name) => {
    try {
      const res = await apiUpdateTab(id, name);
      setTabs(prev => prev.map(t => t.id === id ? res.data : t));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeTab = async (id) => {
    try {
      await apiDeleteTab(id);
      const newTabs = tabs.filter(t => t.id !== id);
      setTabs(newTabs);
      setWidgets(prev => prev.filter(w => w.tab_id !== id));
      
      if (activeTabId === id && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <WidgetsContext.Provider 
      value={{ 
        widgets, setWidgets,
        tabs, activeTabId, setActiveTabId,
        loading, 
        addWidget, editWidget, removeWidget, refetch: fetchAll,
        addTab, modifyTab, removeTab
      }}
    >
      {children}
    </WidgetsContext.Provider>
  );
}

export const useWidgets = () => {
  const context = useContext(WidgetsContext);
  if (!context) throw new Error('useWidgets must be used within WidgetsProvider');
  return context;
};