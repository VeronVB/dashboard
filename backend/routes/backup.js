const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const extractZip = require('extract-zip');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Upewnij się że folder temp istnieje
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const upload = multer({ 
  dest: TEMP_DIR,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// GET /api/backup/export — pobierz backup jako ZIP
router.get('/export', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dashboard-backup-${timestamp}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    // Dodaj data.db
    const dbPath = path.join(DATA_DIR, 'data.db');
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'data/data.db' });
    }

    // Dodaj folder uploads
    if (fs.existsSync(UPLOADS_DIR)) {
      archive.directory(UPLOADS_DIR, 'uploads');
    }

    await archive.finalize();
  } catch (err) {
    console.error('Backup export error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backup/import — przywróć backup z ZIP
router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Brak pliku' });
  }

  const zipPath = req.file.path;
  const extractDir = path.join(TEMP_DIR, `extract-${Date.now()}`);

  try {
    // Rozpakuj ZIP
    await extractZip(zipPath, { dir: extractDir });

    // Przywróć data.db
    const backupDbPath = path.join(extractDir, 'data', 'data.db');
    if (fs.existsSync(backupDbPath)) {
      const targetDbPath = path.join(DATA_DIR, 'data.db');
      fs.copyFileSync(backupDbPath, targetDbPath);
    }

    // Przywróć uploads
    const backupUploadsDir = path.join(extractDir, 'uploads');
    if (fs.existsSync(backupUploadsDir)) {
      copyDirSync(backupUploadsDir, UPLOADS_DIR);
    }

    res.json({ success: true, message: 'Backup przywrócony. Odśwież stronę.' });
  } catch (err) {
    console.error('Backup import error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Cleanup
    fs.rmSync(zipPath, { force: true });
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
});

// Helper: kopiuj folder rekursywnie
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = router;