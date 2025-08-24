import React from 'react';
import { motion } from 'framer-motion';

interface Estadisticas {
  total_votos: number;
  votos_varon: number;
  votos_nina: number;
}

interface StatsProps {
  estadisticas: Estadisticas;
}

const Stats: React.FC<StatsProps> = ({ estadisticas }) => {
  const porcentajeVaron = estadisticas.total_votos > 0 
    ? Math.round((estadisticas.votos_varon / estadisticas.total_votos) * 100) 
    : 0;
  
  const porcentajeNina = estadisticas.total_votos > 0 
    ? Math.round((estadisticas.votos_nina / estadisticas.total_votos) * 100) 
    : 0;

  return (
    <div className="stats">
      <motion.div 
        className="stat-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Columna 1: Icono grande */}
          <div style={{ fontSize: '3rem' }}>🥚</div>
          
          {/* Columna 2: Información de texto */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', textAlign: 'center', marginBottom: '8px' }}>Total de Votos</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{estadisticas.total_votos}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #1e3a8a 100%)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Columna 1: Icono grande */}
          <div style={{ fontSize: '3rem' }}>👦</div>
          
          {/* Columna 2: Información de texto */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', textAlign: 'center', marginBottom: '8px' }}>Predicen Niño</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{estadisticas.votos_varon}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>({porcentajeVaron}%)</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ background: 'linear-gradient(135deg, #BE185D 0%, #9d174d 100%)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Columna 1: Icono grande */}
          <div style={{ fontSize: '3rem' }}>👧</div>
          
          {/* Columna 2: Información de texto */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', textAlign: 'center', marginBottom: '8px' }}>Predicen Niña</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{estadisticas.votos_nina}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>({porcentajeNina}%)</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Stats; 