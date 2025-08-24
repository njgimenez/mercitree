import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import VotoForm from './components/VotoForm';
import TreeVisualization from './components/TreeVisualization';
import Stats from './components/Stats';
import VotosList from './components/VotosList';


interface Voto {
  id: number;
  nombre: string;
  prediccion: 'varon' | 'nina';
  pais?: string;
  comentario?: string;
  foto_url?: string;
  fecha_voto: string;
  leaf_x?: number;
  leaf_y?: number;
  leaf_size?: number;
  leaf_angle?: number;
}

interface Estadisticas {
  total_votos: number;
  votos_varon: number;
  votos_nina: number;
}

const API_BASE_URL = 'http://192.168.18.49:5000/api';

function App() {
  const [votos, setVotos] = useState<Voto[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_votos: 0,
    votos_varon: 0,
    votos_nina: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchVotos = async () => {
    try {
      const [votosResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/votos`),
        axios.get(`${API_BASE_URL}/estadisticas`)
      ]);
      
      setVotos(votosResponse.data);
      setEstadisticas(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotos();
  }, []);

  const handleVotoSubmit = async (nuevoVoto: Voto) => {
    setVotos(prev => [nuevoVoto, ...prev]);
    await fetchVotos(); // Refrescar estadísticas
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '3rem', marginBottom: '20px' }}
          >
            🌳
          </motion.div>
          <h2>Cargando el árbol de predicciones...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="card">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ 
              textAlign: 'center', 
              fontSize: window.innerWidth <= 768 ? '1.2rem' : '2.5rem', 
              marginBottom: '10px',
              color: '#333',
              lineHeight: '1.2'
            }}
          >🌳 Árbol de Predicciones 🌳 </motion.h1>
          <p style={{ textAlign: 'center', fontSize: '1rem', color: '#666', marginBottom: '30px' }}>
            ¡Vota y ve cómo crece nuestro árbol con tus predicciones!
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Stats estadisticas={estadisticas} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="card">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>🌿 Visualización del Árbol</h2>
          <TreeVisualization votos={votos} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="card">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>📝 ¡Agrega tu predicción!</h2>
          <VotoForm onSubmit={handleVotoSubmit} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="card">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>👥 Todas las Predicciones</h2>
          <VotosList votos={votos} />
        </div>
      </motion.div>


    </div>
  );
}

export default App; 