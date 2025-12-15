import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Metryki
export const getProxmoxMetrics = () => api.get('/metrics/proxmox');
export const getStatus = () => api.get('/metrics/status');

// Kontenery
export const getContainers = () => api.get('/containers');

export const startContainer = (endpointId, containerId) => 
  api.post(`/containers/${endpointId}/${containerId}/start`);
export const stopContainer = (endpointId, containerId) => 
  api.post(`/containers/${endpointId}/${containerId}/stop`);
export const restartContainer = (endpointId, containerId) => 
  api.post(`/containers/${endpointId}/${containerId}/restart`);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSetting = (key, value, type = 'string') => 
  api.put(`/settings/${key}`, { value, type });

// Uploads
export const uploadBackground = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/uploads/background', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getBackgrounds = () => api.get('/uploads/backgrounds');

export const deleteBackground = (filename) => 
  api.delete(`/uploads/background/${filename}`);

// Backup
export const exportBackup = () => api.get('/backup/export', { responseType: 'blob' });

export const importBackup = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/backup/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ============================================================
// TABS
// ============================================================

export const getTabs = () => api.get(`/tabs`);
export const createTab = (name) => api.post(`/tabs`, { name });
export const updateTab = (id, name) => api.put(`/tabs/${id}`, { name });
export const deleteTab = (id) => api.delete(`/tabs/${id}`);

// ============================================================
// WIDGETS
// ============================================================

export const getWidgets = () => api.get('/widgets');

export const getWidget = (id) => api.get(`/widgets/${id}`);
export const createWidget = (data) => 
  api.post('/widgets', data);

export const updateWidget = (id, data) => 
  api.put(`/widgets/${id}`, data);

export const deleteWidget = (id) => 
  api.delete(`/widgets/${id}`);

export const updateWidgetPositions = (updates) => 
  api.patch('/widgets/positions', { updates });

export default api;