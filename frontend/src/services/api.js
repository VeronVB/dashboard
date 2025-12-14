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

export default api;