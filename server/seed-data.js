const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos
const db = new sqlite3.Database('./server/votos.db');

// Nombres de ejemplo para los votos
const nombres = [
  'María González', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Pérez', 'Sofia López',
  'Diego García', 'Valentina Torres', 'Andrés Morales', 'Isabella Silva', 'Mateo Herrera',
  'Camila Vargas', 'Sebastián Jiménez', 'Valeria Castro', 'Nicolás Ruiz', 'Gabriela Mendoza',
  'Daniel Ortega', 'Lucía Flores', 'Alejandro Rojas', 'Emma Navarro', 'David Moreno',
  'Sara Paredes', 'Javier Soto', 'Natalia Vega', 'Roberto Guzmán', 'Carmen Reyes',
  'Fernando Cruz', 'Adriana Medina', 'Ricardo Aguilar', 'Patricia Luna', 'Miguel Salazar',
  'Laura Cortés', 'Francisco Méndez', 'Claudia Ríos', 'Eduardo Vega', 'Monica Campos',
  'Héctor Miranda', 'Verónica Ponce', 'Alberto Fuentes', 'Rosa Delgado', 'Manuel Acosta',
  'Teresa Figueroa', 'Raúl Espinoza', 'Elena Mendoza', 'Oscar Valdez', 'Silvia Robles',
  'Arturo Molina', 'Beatriz Sandoval', 'Felipe Guerrero', 'Diana Cárdenas', 'José Mendoza',
  'Rosa Velázquez', 'Alfonso Serrano', 'Margarita Ochoa', 'Rogelio Contreras', 'Consuelo Luna',
  'Efrain Maldonado', 'Dolores Cisneros', 'Clemente Zamora', 'Esperanza Galván'
];

// Países disponibles (Venezuela primero para mayor probabilidad)
const paises = ['VE', 'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'ES', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'US', 'CA', 'FR', 'DE', 'IT', 'GB', 'AU', 'NZ', 'JP', 'CN', 'IN', 'RU', 'OT'];

// Comentarios de ejemplo
const comentarios = [
  '¡Estoy muy emocionado por conocer al bebé!',
  'Tengo una corazonada de que será...',
  'Basándome en las tradiciones familiares...',
  '¡No puedo esperar para ser tío/tía!',
  'Mi intuición me dice que...',
  '¡Será una sorpresa maravillosa!',
  'Espero que tenga los ojos de su mamá...',
  '¡Ya estoy comprando regalos!',
  'Mi predicción se basa en...',
  '¡Qué emoción tener un nuevo miembro en la familia!',
  'Estoy seguro de que será...',
  '¡No puedo contener la emoción!',
  'Mi corazón me dice que...',
  '¡Será perfecto sin importar qué!',
  'Basándome en los sueños que tuve...',
  '¡Ya estoy planeando las actividades!',
  'Mi predicción viene de...',
  '¡Qué bendición tener este bebé!',
  'Estoy convencido de que será...',
  '¡No puedo esperar para conocerlo!',
  'Mi intuición nunca falla...',
  '¡Será el bebé más hermoso!',
  'Basándome en las señales...',
  '¡Ya estoy preparando todo!',
  'Mi corazón late por...',
  '¡Qué alegría tener un nuevo sobrino/sobrina!',
  'Estoy seguro de que heredará...',
  '¡No puedo contener la felicidad!',
  'Mi predicción se basa en la luna...',
  '¡Será una sorpresa perfecta!',
  'Basándome en los viejos cuentos...',
  '¡Ya estoy comprando ropita!',
  'Mi intuición me guía hacia...',
  '¡Qué emoción tener un nuevo primo/prima!',
  'Estoy convencido de que tendrá...',
  '¡No puedo esperar para abrazarlo!',
  'Mi predicción viene del corazón...',
  '¡Será el bebé más amado!',
  'Basándome en las estrellas...',
  '¡Ya estoy planeando la fiesta!',
  'Mi corazón sabe que será...',
  '¡Qué bendición para la familia!',
  'Estoy seguro de que será especial...',
  '¡No puedo contener las lágrimas de alegría!',
  'Mi intuición nunca me ha fallado...',
  '¡Será perfecto en todos los sentidos!',
  'Basándome en los signos...',
  '¡Ya estoy preparando el cuarto!',
  'Mi predicción se basa en el amor...',
  '¡Qué emoción tener un nuevo nieto/nieta!',
  'Estoy convencido de que heredará la bondad...',
  '¡No puedo esperar para enseñarle todo!',
  'Mi corazón late fuerte por...',
  '¡Será una sorpresa maravillosa!',
  'Basándome en los sueños...',
  '¡Ya estoy comprando juguetes!',
  'Mi intuición me dice que será único...',
  '¡Qué alegría para toda la familia!',
  'Estoy seguro de que será brillante...',
  '¡No puedo contener la emoción!',
  'Mi predicción viene de las estrellas...',
  '¡Será el bebé más hermoso del mundo!'
];

// Función para generar una fecha aleatoria en los últimos 30 días
function getRandomDate() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Función para insertar datos de ejemplo
function insertSampleData() {
  console.log('🌱 Insertando 60 casos de ejemplo en la base de datos...');
  
  const stmt = db.prepare(`
    INSERT INTO votos (nombre, prediccion, pais, comentario, fecha_voto)
    VALUES (?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;
  
  for (let i = 0; i < 60; i++) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const prediccion = Math.random() > 0.5 ? 'varon' : 'nina';
    const pais = paises[Math.floor(Math.random() * paises.length)];
    const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
    const fecha_voto = getRandomDate();

    stmt.run([nombre, prediccion, pais, comentario, fecha_voto], function(err) {
      if (err) {
        console.error('Error insertando voto:', err);
      } else {
        insertedCount++;
        console.log(`✅ Voto ${insertedCount}/60 insertado: ${nombre} (${pais}) predice ${prediccion === 'varon' ? '👦 niño' : '👧 niña'}`);
        
        if (insertedCount === 60) {
          console.log('\n🎉 ¡Todos los datos de ejemplo han sido insertados exitosamente!');
          console.log('📊 Ahora puedes ver el árbol con 60 hojas de diferentes colores.');
          console.log('🌐 Abre http://localhost:3000 para ver el resultado.');
          
          // Mostrar estadísticas finales
          db.get(`
            SELECT 
              COUNT(*) as total_votos,
              SUM(CASE WHEN prediccion = 'varon' THEN 1 ELSE 0 END) as votos_varon,
              SUM(CASE WHEN prediccion = 'nina' THEN 1 ELSE 0 END) as votos_nina
            FROM votos
          `, (err, row) => {
            if (!err && row) {
              console.log('\n📈 Estadísticas finales:');
              console.log(`   Total de votos: ${row.total_votos}`);
              console.log(`   Predicen niño: ${row.votos_varon} (${Math.round((row.votos_varon / row.total_votos) * 100)}%)`);
              console.log(`   Predicen niña: ${row.votos_nina} (${Math.round((row.votos_nina / row.total_votos) * 100)}%)`);
            }
            stmt.finalize();
            db.close();
          });
        }
      }
    });
  }
}

// Ejecutar la inserción de datos
insertSampleData(); 