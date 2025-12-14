const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const BACKGROUNDS_DIR = path.join(__dirname, '..', 'uploads', 'backgrounds');

// Upewnij się że folder istnieje
if (!fs.existsSync(BACKGROUNDS_DIR)) {
  fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, BACKGROUNDS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Dozwolone tylko obrazy (jpg, png, gif, webp)'));
    }
  }
});

// POST /api/uploads/background
router.post('/background', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Brak pliku' });
  }
  res.json({ 
    filename: req.file.filename,
    url: `/uploads/backgrounds/${req.file.filename}`
  });
});

// GET /api/uploads/backgrounds
router.get('/backgrounds', (req, res) => {
  try {
    const files = fs.readdirSync(BACKGROUNDS_DIR);
    const backgrounds = files
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map(filename => ({
        filename,
        url: `/uploads/backgrounds/${filename}`
      }));
    res.json(backgrounds);
  } catch (err) {
    res.json([]);
  }
});

// DELETE /api/uploads/background/:filename
router.delete('/background/:filename', (req, res) => {
  const filepath = path.join(BACKGROUNDS_DIR, req.params.filename);
  
  // Zabezpieczenie przed path traversal
  if (!filepath.startsWith(BACKGROUNDS_DIR)) {
    return res.status(403).json({ error: 'Niedozwolona ścieżka' });
  }
  
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Plik nie istnieje' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;