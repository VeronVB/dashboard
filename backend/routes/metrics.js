const express = require('express');
const router = express.Router();
const { getProxmoxMetrics, getDockerMetrics } = require('../services/influx');

// GET /api/metrics/proxmox
router.get('/proxmox', async (req, res) => {
  try {
    const rawData = await getProxmoxMetrics();
    
    // Parsujemy surowe dane do czytelnego formatu
    const metrics = {
      cpu: null,
      memory: null,
      disk: null,
      uptime: null,
      timestamp: null,
    };

    rawData.forEach(row => {
      const field = row._field;
      const value = row._value;
      
      if (field === 'cpuload') metrics.cpu = value;
      if (field === 'mem_used') metrics.memory = value;
      if (field === 'disk_used_percentage') metrics.disk = value;
      if (field === 'uptime') metrics.uptime = value;
      
      if (!metrics.timestamp) metrics.timestamp = row._time;
    });

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/docker
router.get('/docker', async (req, res) => {
  try {
    const rawData = await getDockerMetrics();
    res.json(rawData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/status - sprawdź czy homelab jest online
router.get('/status', async (req, res) => {
  try {
    const proxmoxData = await getProxmoxMetrics();
    
    if (proxmoxData.length === 0) {
      return res.json({ status: 'offline', message: 'Brak danych z homelaba' });
    }

    // Sprawdź timestamp ostatnich danych
    const lastUpdate = new Date(proxmoxData[0]._time);
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / 1000 / 60;

    if (diffMinutes > 2) {
      return res.json({ 
        status: 'offline', 
        message: `Ostatni kontakt: ${Math.floor(diffMinutes)} min temu`,
        lastUpdate: lastUpdate.toISOString(),
      });
    }

    res.json({ 
      status: 'online', 
      lastUpdate: lastUpdate.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;