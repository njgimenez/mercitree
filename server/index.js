const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importar base de datos según el entorno
let db, pool;
if (process.env.NODE_ENV === 'production') {
  const { Pool: PgPool } = require('pg');
  pool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('votos.db');
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? [process.env.FRONTEND_URL || 'https://arbol-de-prediccion.onrender.com'] : ['http://localhost:3000', 'http://192.168.18.49:3000'],
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

// Inicializar base de datos según el entorno
if (process.env.NODE_ENV === 'production') {
  // PostgreSQL para producción
  const createTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS votos (
          id SERIAL PRIMARY KEY,
          nombre TEXT NOT NULL,
          prediccion TEXT NOT NULL CHECK(prediccion IN ('varon', 'nina')),
          pais TEXT,
          comentario TEXT,
          foto_url TEXT,
          fecha_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Tabla votos PostgreSQL creada o verificada correctamente');
    } catch (error) {
      console.error('Error creando tabla PostgreSQL:', error);
    }
  };
  createTable();
} else {
  // SQLite para desarrollo
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
    console.log('Tabla votos SQLite creada o verificada correctamente');
  });
}

// Rutas API
app.get('/api/votos', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // PostgreSQL
    pool.query('SELECT * FROM votos ORDER BY fecha_voto DESC')
      .then(result => res.json(result.rows))
      .catch(error => {
        console.error('Error obteniendo votos:', error);
        res.status(500).json({ error: error.message });
      });
  } else {
    // SQLite
    db.all('SELECT * FROM votos ORDER BY datetime(fecha_voto) DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

app.get('/api/estadisticas', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // PostgreSQL
    pool.query(`
      SELECT 
        COUNT(*) as total_votos,
        SUM(CASE WHEN prediccion = 'varon' THEN 1 ELSE 0 END) as votos_varon,
        SUM(CASE WHEN prediccion = 'nina' THEN 1 ELSE 0 END) as votos_nina
      FROM votos
    `)
      .then(result => res.json(result.rows[0]))
      .catch(error => {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: error.message });
      });
  } else {
    // SQLite
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
  }
});

app.post('/api/votar', upload.single('foto'), (req, res) => {
  const { nombre, prediccion, pais, comentario } = req.body;
  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !prediccion || !pais || !['varon', 'nina'].includes(prediccion)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  if (process.env.NODE_ENV === 'production') {
    // PostgreSQL
    pool.query(`
      INSERT INTO votos (nombre, prediccion, pais, comentario, foto_url, fecha_voto)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nombre, prediccion, pais, comentario, foto_url])
      .then(result => {
        res.json({
          ...result.rows[0],
          mensaje: 'Voto registrado exitosamente'
        });
      })
      .catch(error => {
        console.error('Error insertando voto:', error);
        res.status(500).json({ error: error.message });
      });
  } else {
    // SQLite
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
  }
});

// En producción, solo servir la API
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.json({
      message: 'API de Árbol de Predicciones funcionando correctamente',
      endpoints: {
        votos: '/api/votos',
        estadisticas: '/api/estadisticas',
        votar: '/api/votar'
      }
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
  console.log(`API disponible en http://192.168.18.49:${PORT}/api`);
}); 