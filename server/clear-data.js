const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos
const db = new sqlite3.Database('votos.db');

console.log('🗑️ Limpiando todos los datos de la base de datos...');

db.run('DELETE FROM votos', function(err) {
  if (err) {
    console.error('❌ Error limpiando la base de datos:', err);
  } else {
    console.log(`✅ Se eliminaron ${this.changes} registros de la base de datos.`);
    console.log('🌱 La base de datos está lista para nuevos votos reales.');
  }
  
  db.close();
}); 