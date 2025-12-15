const express = require('express');
const router = express.Router();
const { getAllTabs, createTab, updateTab, deleteTab } = require('../db/database');

// GET /api/tabs
router.get('/', (req, res) => {
  try {
    const tabs = getAllTabs();
    res.json(tabs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tabs
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const tab = createTab(name);
    res.status(201).json(tab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tabs/:id
router.put('/:id', (req, res) => {
  try {
    const { name } = req.body;
    const id = parseInt(req.params.id);
    const updated = updateTab(id, name);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tabs/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Zabezpieczenie: nie usuwaj tab_id=1 (Główny), chyba że chcesz pozwolić na pusty dashboard
    // Dla uproszczenia pozwalamy, ale frontend powinien obsłużyć brak tabów.
    deleteTab(id);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;