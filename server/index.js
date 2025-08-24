const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? ['https://merci-frontend.onrender.com'] : ['http://localhost:3000', 'http://192.168.18.49:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static(__dirname));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Inicializar base de datos
const db = new sqlite3.Database('votos.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS votos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    prediccion TEXT NOT NULL CHECK(prediccion IN ('varon', 'nina')),
    pais TEXT,
    comentario TEXT,
    foto_url TEXT,
    fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Agregar columnas de posición si no existen (para bases de datos existentes)
  // Ya no se necesitan las columnas leaf_x, leaf_y, leaf_size, leaf_angle
  // Ya no se necesitan las columnas leaf_x, leaf_y, leaf_size, leaf_angle
  // Ya no se necesitan las columnas leaf_x, leaf_y, leaf_size, leaf_angle
  // Ya no se necesitan las columnas leaf_x, leaf_y, leaf_size, leaf_angle
});

// Rutas API
app.get('/api/votos', (req, res) => {
  db.all('SELECT * FROM votos ORDER BY datetime(fecha_voto) DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/estadisticas', (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_votos,
      SUM(CASE WHEN prediccion = 'varon' THEN 1 ELSE 0 END) as votos_varon,
      SUM(CASE WHEN prediccion = 'nina' THEN 1 ELSE 0 END) as votos_nina
    FROM votos
  `, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post('/api/votar', upload.single('foto'), (req, res) => {
  const { nombre, prediccion, pais, comentario } = req.body;
  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !prediccion || !pais || !['varon', 'nina'].includes(prediccion)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

    const stmt = db.prepare(`
    INSERT INTO votos (nombre, prediccion, pais, comentario, foto_url, fecha_voto)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run([nombre, prediccion, pais, comentario, foto_url], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      id: this.lastID,
      nombre,
      prediccion,
      pais,
      comentario,
      foto_url,
      mensaje: 'Voto registrado exitosamente'
    });
  });

  stmt.finalize();
});

// Servir archivos estáticos del cliente en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
  console.log(`API disponible en http://192.168.18.49:${PORT}/api`);
}); 