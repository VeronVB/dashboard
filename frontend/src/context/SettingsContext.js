import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../services/api';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    dashboard_title: 'Homelab Dashboard',
    search_enabled: true,
    theme: 'dark',
    background_url: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      setSettings(res.data);
    } catch (err) {
      console.error('Błąd ładowania ustawień:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettingValue = async (key, value, type = 'string') => {
    try {
      await updateSetting(key, value, type);
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (err) {
      console.error('Błąd zapisu:', err);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettingValue, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};