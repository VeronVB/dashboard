const express = require('express');
const router = express.Router();
const { getSetting, setSetting, getAllSettings } = require('../db/database');

// GET /api/settings - wszystkie ustawienia
router.get('/', (req, res) => {
  try {
    const settings = getAllSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/settings/:key - pojedyncze ustawienie
router.get('/:key', (req, res) => {
  try {
    const value = getSetting(req.params.key);
    if (value === null) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings/:key - aktualizuj ustawienie
router.put('/:key', (req, res) => {
  try {
    const { value, type } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    setSetting(req.params.key, value, type || 'string');
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;