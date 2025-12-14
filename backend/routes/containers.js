const express = require('express');
const router = express.Router();
const { 
  getAllContainers, 
  restartContainer, 
  stopContainer,
  startContainer 
} = require('../services/portainer');

// GET /api/containers - lista wszystkich kontenerów
router.get('/', async (req, res) => {
  try {
    const containers = await getAllContainers();
    
    // Parsujemy do czytelnego formatu
    const formatted = containers.map(c => ({
      id: c.Id,
      name: c.Names[0].replace('/', ''), // usuń "/" z nazwy
      image: c.Image,
      state: c.State,
      status: c.Status,
      endpointId: c.endpointId,
      endpointName: c.endpointName,
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/containers/:endpointId/:containerId/start
router.post('/:endpointId/:containerId/start', async (req, res) => {
  try {
    const { endpointId, containerId } = req.params;
    const result = await startContainer(endpointId, containerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/containers/:endpointId/:containerId/stop
router.post('/:endpointId/:containerId/stop', async (req, res) => {
  try {
    const { endpointId, containerId } = req.params;
    const result = await stopContainer(endpointId, containerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/containers/:endpointId/:containerId/restart
router.post('/:endpointId/:containerId/restart', async (req, res) => {
  try {
    const { endpointId, containerId } = req.params;
    const result = await restartContainer(endpointId, containerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;