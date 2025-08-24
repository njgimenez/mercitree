const axios = require('axios');

const PROD_API_URL = 'https://backby-tree.onrender.com/api';

async function deleteVotes() {
  console.log('🗑️ Eliminando votos existentes...\n');

  try {
    // Obtener votos actuales
    const votesResponse = await axios.get(`${PROD_API_URL}/votos`);
    console.log(`📊 Votos encontrados: ${votesResponse.data.length}`);
    
    // Eliminar cada voto
    for (const vote of votesResponse.data) {
      console.log(`🗑️ Eliminando voto ID ${vote.id}: ${vote.nombre}`);
      
      try {
        await axios.delete(`${PROD_API_URL}/votos/${vote.id}`);
        console.log(`✅ Voto ID ${vote.id} eliminado exitosamente`);
      } catch (deleteError) {
        console.log(`❌ Error eliminando voto ID ${vote.id}:`, deleteError.message);
      }
    }
    
    // Verificar que se eliminaron
    const finalVotesResponse = await axios.get(`${PROD_API_URL}/votos`);
    console.log(`\n📊 Votos restantes: ${finalVotesResponse.data.length}`);
    
    if (finalVotesResponse.data.length === 0) {
      console.log('🎉 ¡Todos los votos han sido eliminados exitosamente!');
    } else {
      console.log('⚠️ Algunos votos no pudieron ser eliminados');
    }
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error.message);
  }
}

deleteVotes(); 