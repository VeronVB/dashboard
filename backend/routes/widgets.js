const express = require('express');
const router = express.Router();
const {
  getAllWidgets,
  getWidget,
  createWidget,
  updateWidget,
  deleteWidget,
  updateWidgetPositions
} = require('../db/database');

// GET /api/widgets - wszystkie widgety
router.get('/', (req, res) => {
  try {
    const widgets = getAllWidgets();
    res.json(widgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/widgets/:id - pojedynczy widget
router.get('/:id', (req, res) => {
  try {
    const widget = getWidget(parseInt(req.params.id));
    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    res.json(widget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/widgets - dodaj nowy widget
router.post('/', (req, res) => {
  try {
    const { type, name, config, position, size } = req.body;
    
    if (!type || !name || !config) {
      return res.status(400).json({ error: 'Missing required fields: type, name, config' });
    }
    
    const widget = createWidget(type, name, config, position, size);
    res.status(201).json(widget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/widgets/:id - aktualizuj widget
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { type, name, config, position, size } = req.body;
    
    const widget = updateWidget(id, { type, name, config, position, size });
    res.json(widget);
  } catch (error) {
    if (error.message === 'Widget not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/widgets/:id - usuń widget
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = deleteWidget(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Widget not found' });
    }
    
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/widgets/positions - aktualizuj pozycje (drag-and-drop)
router.patch('/positions', (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Expected array of {id, position}' });
    }
    
    updateWidgetPositions(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;