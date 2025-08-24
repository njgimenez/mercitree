const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Buffer } = require('buffer');

// Importar base de datos según el entorno
let db, pool;
if (process.env.NODE_ENV === 'production') {
  try {
    const { Pool: PgPool } = require('pg');
    console.log('🔧 Configurando PostgreSQL para producción...');
    console.log('📊 DATABASE_URL configurada:', process.env.DATABASE_URL ? 'SÍ' : 'NO');
    
    pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Pool de PostgreSQL creado exitosamente');
  } catch (error) {
    console.error('❌ Error configurando PostgreSQL:', error);
    pool = null;
  }
} else {
  try {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database('votos.db');
    console.log('✅ SQLite configurado para desarrollo');
  } catch (error) {
    console.error('❌ Error configurando SQLite:', error);
    db = null;
  }
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

// Ruta para servir imágenes base64 en producción
if (process.env.NODE_ENV === 'production') {
  app.get('/api/image/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!pool) {
        return res.status(500).json({ error: 'Base de datos no disponible' });
      }
      
      const result = await pool.query('SELECT foto_url FROM votos WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      
      const fotoUrl = result.rows[0].foto_url;
      
      if (!fotoUrl || !fotoUrl.startsWith('data:image/')) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      
      // Extraer el tipo MIME y los datos base64
      const matches = fotoUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Formato de imagen inválido' });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convertir base64 a buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Enviar la imagen
      res.set('Content-Type', mimeType);
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
      res.send(imageBuffer);
      
    } catch (error) {
      console.error('Error sirviendo imagen:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
}

// Configuración de multer para subida de archivos
let storage;
let upload;

if (process.env.NODE_ENV === 'production') {
  // En producción, usar memoria para convertir a base64
  storage = multer.memoryStorage();
  upload = multer({ 
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
} else {
  // En desarrollo, usar disco
  storage = multer.diskStorage({
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
  
  upload = multer({ 
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
}

// Inicializar base de datos según el entorno
if (process.env.NODE_ENV === 'production') {
  // PostgreSQL para producción
  console.log('Inicializando PostgreSQL en producción...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA');
  
  const createTable = async () => {
    try {
      console.log('Creando tabla votos en PostgreSQL...');
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
      console.log('✅ Tabla votos PostgreSQL creada o verificada correctamente');
    } catch (error) {
      console.error('❌ Error creando tabla PostgreSQL:', error);
      console.error('Detalles del error:', error.message);
    }
  };
  
  // Verificar conexión antes de crear tabla
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Conexión a PostgreSQL exitosa');
      createTable();
    })
    .catch(error => {
      console.error('❌ Error conectando a PostgreSQL:', error);
      console.error('DATABASE_URL:', process.env.DATABASE_URL);
    });
} else {
  // SQLite para desarrollo
  console.log('Inicializando SQLite en desarrollo...');
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
    console.log('✅ Tabla votos SQLite creada o verificada correctamente');
  });
}

// Rutas API
app.get('/api/votos', (req, res) => {
  console.log('GET /api/votos - Entorno:', process.env.NODE_ENV);
  
  if (process.env.NODE_ENV === 'production') {
    // PostgreSQL
    if (!pool) {
      console.error('Pool de PostgreSQL no está inicializado');
      return res.status(500).json({ error: 'Base de datos no disponible - Pool no inicializado' });
    }
    
    pool.query('SELECT * FROM votos ORDER BY fecha_voto DESC')
      .then(result => {
        console.log('Votos obtenidos:', result.rows.length);
        res.json(result.rows);
      })
      .catch(error => {
        console.error('Error obteniendo votos:', error);
        res.status(500).json({ error: `Error de base de datos: ${error.message}` });
      });
  } else {
    // SQLite
    db.all('SELECT * FROM votos ORDER BY datetime(fecha_voto) DESC', (err, rows) => {
      if (err) {
        console.error('Error SQLite:', err);
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
  console.log('POST /api/votar - Entorno:', process.env.NODE_ENV);
  console.log('Body recibido:', req.body);
  
  const { nombre, prediccion, pais, comentario } = req.body;
  
  // Manejar la foto según el entorno
  let foto_url = null;
  
  if (req.file) {
    if (process.env.NODE_ENV === 'production') {
      // En producción, convertir a base64
      const mimeType = req.file.mimetype;
      const base64Data = req.file.buffer.toString('base64');
      foto_url = `data:${mimeType};base64,${base64Data}`;
      console.log('Foto convertida a base64, tamaño:', base64Data.length);
    } else {
      // En desarrollo, usar ruta de archivo
      foto_url = `/uploads/${req.file.filename}`;
    }
  }

  if (!nombre || !prediccion || !pais || !['varon', 'nina'].includes(prediccion)) {
    console.error('Datos inválidos:', { nombre, prediccion, pais });
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  if (process.env.NODE_ENV === 'production') {
    // PostgreSQL
    if (!pool) {
      console.error('Pool de PostgreSQL no está inicializado');
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }
    
    console.log('Insertando voto en PostgreSQL:', { nombre, prediccion, pais, comentario, foto_url: foto_url ? 'base64' : null });
    
    pool.query(`
      INSERT INTO votos (nombre, prediccion, pais, comentario, foto_url, fecha_voto)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nombre, prediccion, pais, comentario, foto_url])
      .then(result => {
        console.log('Voto insertado exitosamente:', result.rows[0]);
        res.json({
          ...result.rows[0],
          mensaje: 'Voto registrado exitosamente'
        });
      })
      .catch(error => {
        console.error('Error insertando voto en PostgreSQL:', error);
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
        console.error('Error SQLite:', err);
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
      environment: process.env.NODE_ENV,
      database: process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA',
      pool: pool ? 'Inicializado' : 'NO INICIALIZADO',
      endpoints: {
        votos: '/api/votos',
        estadisticas: '/api/estadisticas',
        votar: '/api/votar',
        test: '/api/test'
      }
    });
  });
  
  // Ruta de prueba para verificar el servidor
  app.get('/api/test', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA',
      pool: pool ? 'Inicializado' : 'NO INICIALIZADO',
      port: process.env.PORT || 5000,
      node_version: process.version
    });
  });
  
  // Ruta de health check para Render
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA',
      version: '1.0.1'
    });
  });


}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌐 API disponible en http://192.168.18.49:${PORT}/api`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Base de datos: ${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
}); 