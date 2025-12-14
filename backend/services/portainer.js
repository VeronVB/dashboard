const axios = require('axios');

const portainerAPI = axios.create({
  baseURL: process.env.PORTAINER_URL + '/api',
  headers: {
    'X-API-Key': process.env.PORTAINER_TOKEN,
  },
});

// Pobierz listę wszystkich kontenerów
async function getAllContainers() {
  try {
    console.log('Portainer URL:', process.env.PORTAINER_URL);
    console.log('Token exists:', !!process.env.PORTAINER_TOKEN);
    // Najpierw pobierz listę endpointów
    const { data: endpoints } = await portainerAPI.get('/endpoints');
    
    const allContainers = [];
    
    for (const endpoint of endpoints) {
      try {
        // Docker API przez Portainer
        const { data: containers } = await portainerAPI.get(
          `/endpoints/${endpoint.Id}/docker/containers/json`,
          { params: { all: true } }
        );
        
        containers.forEach(container => {
          allContainers.push({
            ...container,
            endpointId: endpoint.Id,
            endpointName: endpoint.Name,
          });
        });
      } catch (err) {
        console.error(`Błąd dla endpointa ${endpoint.Name}:`, err.message);
      }
    }
    
    return allContainers;
  } catch (error) {
    console.error('Portainer API error:', error.message);
    throw error;
  }
}

// Start kontenera
async function startContainer(endpointId, containerId) {
  try {
    await portainerAPI.post(
      `/endpoints/${endpointId}/docker/containers/${containerId}/start`
    );
    return { success: true };
  } catch (error) {
    console.error('Start error:', error.message);
    throw error;
  }
}

// Stop kontenera
async function stopContainer(endpointId, containerId) {
  try {
    await portainerAPI.post(
      `/endpoints/${endpointId}/docker/containers/${containerId}/stop`
    );
    return { success: true };
  } catch (error) {
    console.error('Stop error:', error.message);
    throw error;
  }
}

// Restart kontenera
async function restartContainer(endpointId, containerId) {
  try {
    await portainerAPI.post(
      `/endpoints/${endpointId}/docker/containers/${containerId}/restart`
    );
    return { success: true };
  } catch (error) {
    console.error('Restart error:', error.message);
    throw error;
  }
}

module.exports = {
  getAllContainers,
  restartContainer,
  stopContainer,
  startContainer,
};