const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/votos.db');

const names = ["Ana", "Luis", "Maria", "Pedro", "Sofia", "Carlos", "Laura", "Diego", "Elena", "Pablo"];
const predictions = ["varon", "nina"];
const comments = [
    "¡Felicidades a los futuros padres!",
    "Que llegue con mucha salud y alegría.",
    "Estoy muy emocionado/a por conocerle.",
    "Mi predicción es por intuición, ¡que sea lo que Dios quiera!",
    "Un abrazo grande desde la distancia.",
    "Que este bebé traiga mucha luz a sus vidas.",
    "¡Ya quiero ver ese arbolito lleno de hojas!",
    "Con todo mi cariño para la familia.",
    "Mucha felicidad en esta dulce espera.",
    "¡Sorpresa! No puedo esperar."
];

const validCountries = [
  'VE', 'CO', 'AR', 'MX', 'ES', 'PE', 'CL', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'DO', 'US', 'CA', 'DE', 'GB-SCT', 'IE'
];

db.serialize(() => {
    // Si la tabla no existe, la crea (incluyendo la foto_url que es opcional)
    db.run(`CREATE TABLE IF NOT EXISTS votos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        prediccion TEXT NOT NULL,
        pais TEXT,
        comentario TEXT,
        foto_url TEXT,
        fecha_voto TEXT NOT NULL
    )`);

    const stmt = db.prepare("INSERT INTO votos (nombre, prediccion, pais, comentario, foto_url, fecha_voto) VALUES (?, ?, ?, ?, ?, ?)");

    for (let i = 0; i < 50; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
        const randomCountry = validCountries[Math.floor(Math.random() * validCountries.length)];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        const fecha_voto = new Date().toISOString(); // Fecha actual

        stmt.run(randomName, randomPrediction, randomCountry, randomComment, null, fecha_voto, function(err) {
            if (err) {
                console.error(`Error al insertar voto ${i + 1}:`, err.message);
            }
        });
    }

    stmt.finalize(() => {
        console.log("Se agregaron 50 votos de prueba a la base de datos.");
        db.close();
    });
}); 