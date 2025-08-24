import React from 'react';
import { motion } from 'framer-motion';

interface Voto {
  id: number;
  nombre: string;
  prediccion: 'varon' | 'nina';
  pais?: string;
  comentario?: string;
  foto_url?: string;
  fecha_voto: string;
}

// Mapeo de códigos de país a banderas
const getBandera = (codigoPais: string) => {
  const banderas: { [key: string]: string } = {
    'AR': '🇦🇷', 'BO': '🇧🇴', 'BR': '🇧🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'CR': '🇨🇷', 'CU': '🇨🇺', 'DO': '🇩🇴', 'EC': '🇪🇨', 'SV': '🇸🇻',
    'ES': '🇪🇸', 'GT': '🇬🇹', 'HN': '🇭🇳', 'MX': '🇲🇽', 'NI': '🇳🇮', 'PA': '🇵🇦', 'PY': '🇵🇾', 'PE': '🇵🇪', 'PR': '🇵🇷', 'UY': '🇺🇾',
    'VE': '🇻🇪', 'US': '🇺🇸', 'CA': '🇨🇦', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'GB': '🇬🇧', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'JP': '🇯🇵',
    'CN': '🇨🇳', 'IN': '🇮🇳', 'RU': '🇷🇺', 'OT': '🌍'
  };
  return banderas[codigoPais] || '🌍';
};

interface VotosListProps {
  votos: Voto[];
  onImageClick: (imageUrl: string) => void;
}

const VotosList: React.FC<VotosListProps> = ({ votos, onImageClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (votos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌱</div>
        <h3>¡Sé el primero en votar!</h3>
        <p style={{ color: '#666' }}>
          Aún no hay predicciones. ¡Agrega la tuya y ve cómo crece el árbol!
        </p>
      </div>
    );
  }

  return (
    <div className="votos-list">
      {votos.map((voto, index) => (
        <motion.div
          key={voto.id}
          className={`voto-card ${voto.prediccion}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {voto.foto_url && (
              <img
                src={voto.foto_url.startsWith('data:') ? voto.foto_url : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://192.168.18.49:5000'}${voto.foto_url}`}
                alt={`Foto de ${voto.nombre}`}
                className="voto-foto"
                style={{ cursor: 'pointer' }}
                onClick={() => onImageClick(voto.foto_url!.startsWith('data:') ? voto.foto_url! : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://192.168.18.49:5000'}${voto.foto_url}`)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            
            {voto.pais && (
              <div style={{ fontSize: '2rem' }} title={`País: ${voto.pais}`}>
                {getBandera(voto.pais)}
              </div>
            )}
          </div>
          
          <div className="voto-nombre">{voto.nombre}</div>
          
          <div className={`voto-prediccion ${voto.prediccion}`}>
            {voto.prediccion === 'varon' ? '👦 Niño' : '👧 Niña'}
          </div>
          
          {voto.comentario && (
            <div className="voto-comentario">
              "{voto.comentario}"
            </div>
          )}
          
          <div className="voto-fecha">
            {formatDate(voto.fecha_voto)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default VotosList; 