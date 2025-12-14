require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const metricsRoutes = require('./routes/metrics');
const containersRoutes = require('./routes/containers');
const settingsRoutes = require('./routes/settings');
const uploadsRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/containers', containersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadsRoutes);

// Static serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});