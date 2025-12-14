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

export default api;