const axios = require('axios');

const PROD_API_URL = 'https://backby-tree.onrender.com/api';

async function testProductionAPI() {
  console.log('🔍 Probando API de producción...\n');

  try {
    // 1. Probar endpoint de votos
    console.log('1️⃣ Probando GET /api/votos...');
    const votesResponse = await axios.get(`${PROD_API_URL}/votos`);
    console.log('   Status:', votesResponse.status);
    console.log('   Data:', JSON.stringify(votesResponse.data, null, 2));
    console.log('');

    // 2. Probar endpoint de estadísticas
    console.log('2️⃣ Probando GET /api/estadisticas...');
    const statsResponse = await axios.get(`${PROD_API_URL}/estadisticas`);
    console.log('   Status:', statsResponse.status);
    console.log('   Data:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // 3. Probar endpoint de votar
    console.log('3️⃣ Probando POST /api/votar...');
    const testVote = {
      nombre: 'Test Producción',
      prediccion: 'varon',
      pais: 'Argentina',
      comentario: 'Voto de prueba para producción'
    };

    const formData = new FormData();
    formData.append('nombre', testVote.nombre);
    formData.append('prediccion', testVote.prediccion);
    formData.append('pais', testVote.pais);
    formData.append('comentario', testVote.comentario);

    const voteResponse = await axios.post(`${PROD_API_URL}/votar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('   Status:', voteResponse.status);
    console.log('   Data:', JSON.stringify(voteResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProductionAPI(); 