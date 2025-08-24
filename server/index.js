const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? [process.env.FRONTEND_URL || 'https://merci-frontend.onrender.com'] : ['http://localhost:3000', 'http://192.168.18.49:3000'],
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

// Inicializar base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/merci',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Crear tabla si no existe
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
    console.log('Tabla votos creada o verificada correctamente');
  } catch (error) {
    console.error('Error creando tabla:', error);
  }
};

createTable();

// Rutas API
app.get('/api/votos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM votos ORDER BY fecha_voto DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo votos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estadisticas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_votos,
        SUM(CASE WHEN prediccion = 'varon' THEN 1 ELSE 0 END) as votos_varon,
        SUM(CASE WHEN prediccion = 'nina' THEN 1 ELSE 0 END) as votos_nina
      FROM votos
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/votar', upload.single('foto'), async (req, res) => {
  const { nombre, prediccion, pais, comentario } = req.body;
  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !prediccion || !pais || !['varon', 'nina'].includes(prediccion)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO votos (nombre, prediccion, pais, comentario, foto_url, fecha_voto)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nombre, prediccion, pais, comentario, foto_url]);
    
    res.json({
      ...result.rows[0],
      mensaje: 'Voto registrado exitosamente'
    });
  } catch (error) {
    console.error('Error insertando voto:', error);
    res.status(500).json({ error: error.message });
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