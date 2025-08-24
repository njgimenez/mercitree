import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
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

interface VotoFormProps {
  onSubmit: (voto: Voto) => void;
}

const VotoForm: React.FC<VotoFormProps> = ({ onSubmit }) => {
  const [nombre, setNombre] = useState('');
  const [prediccion, setPrediccion] = useState<'varon' | 'nina' | ''>('');
  const [pais, setPais] = useState('VE');
  const [comentario, setComentario] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lista de países con banderas
  const paises = [
    { codigo: 'VE', nombre: 'Venezuela', bandera: '🇻🇪' },
    { codigo: 'CO', nombre: 'Colombia', bandera: '🇨🇴' },
    { codigo: 'AR', nombre: 'Argentina', bandera: '🇦🇷' },
    { codigo: 'MX', nombre: 'México', bandera: '🇲🇽' },
    { codigo: 'ES', nombre: 'España', bandera: '🇪🇸' },
    { codigo: 'PE', nombre: 'Perú', bandera: '🇵🇪' },
    { codigo: 'CL', nombre: 'Chile', bandera: '🇨🇱' },
    { codigo: 'EC', nombre: 'Ecuador', bandera: '🇪🇨' },
    { codigo: 'BO', nombre: 'Bolivia', bandera: '🇧🇴' },
    { codigo: 'PY', nombre: 'Paraguay', bandera: '🇵🇾' },
    { codigo: 'UY', nombre: 'Uruguay', bandera: '🇺🇾' },
    { codigo: 'CR', nombre: 'Costa Rica', bandera: '🇨🇷' },
    { codigo: 'PA', nombre: 'Panamá', bandera: '🇵🇦' },
    { codigo: 'DO', nombre: 'República Dominicana', bandera: '🇩🇴' },
    { codigo: 'US', nombre: 'Estados Unidos', bandera: '🇺🇸' },
    { codigo: 'CA', nombre: 'Canadá', bandera: '🇨🇦' },
    { codigo: 'DE', nombre: 'Alemania', bandera: '🇩🇪' },
    { codigo: 'GB-SCT', nombre: 'Escocia', bandera: '🏴' },
    { codigo: 'IE', nombre: 'Irlanda', bandera: '🇮🇪' }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() || !prediccion || !pais || !comentario.trim() || !foto) {
      setError('Todos los datos son importantes para dejar un buen recuerdo. Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('prediccion', prediccion);
      formData.append('pais', pais);
      formData.append('comentario', comentario.trim());
      if (foto) {
        formData.append('foto', foto);
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://192.168.18.49:5000/api'}/votar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSubmit(response.data);
      
      // Limpiar formulario
      setNombre('');
      setPrediccion('');
      setPais('VE');
      setComentario('');
      setFoto(null);
      setFotoPreview(null);
      
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al enviar el voto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </motion.div>
      )}

      <div className="form-group">
        <label>Nombre y País *</label>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'flex-end',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
        }}>
          <div style={{ flex: window.innerWidth <= 768 ? 'none' : 2, width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
            <input
              type="text"
              id="nombre"
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre completo"
              required
            />
          </div>
          <div style={{ flex: window.innerWidth <= 768 ? 'none' : 1, width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
            <select
              id="pais"
              className="input"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              required
            >
              {paises.map((paisOption) => (
                <option key={paisOption.codigo} value={paisOption.codigo}>
                  {paisOption.bandera} {paisOption.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Tu Predicción *</label>
        <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
          <button
            type="button"
            onClick={() => setPrediccion('varon')}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              borderRadius: '12px',
              background: prediccion === 'varon' 
                ? 'linear-gradient(135deg, #1E40AF 0%, #1e3a8a 100%)' 
                : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: prediccion === 'varon' 
                ? '0 4px 15px rgba(30, 64, 175, 0.4)' 
                : '0 2px 8px rgba(59, 130, 246, 0.3)',
              transform: prediccion === 'varon' ? 'scale(1.02)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (prediccion !== 'varon') {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (prediccion !== 'varon') {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>👦</span>
            <span>Niño</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPrediccion('nina')}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              borderRadius: '12px',
              background: prediccion === 'nina' 
                ? 'linear-gradient(135deg, #BE185D 0%, #9d174d 100%)' 
                : 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: prediccion === 'nina' 
                ? '0 4px 15px rgba(190, 24, 93, 0.4)' 
                : '0 2px 8px rgba(236, 72, 153, 0.3)',
              transform: prediccion === 'nina' ? 'scale(1.02)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (prediccion !== 'nina') {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (prediccion !== 'nina') {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.3)';
              }
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>👧</span>
            <span>Niña</span>
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Comentario y Foto *</label>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'flex-start',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
        }}>
          <div style={{ flex: window.innerWidth <= 768 ? 'none' : 2, width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
            <textarea
              id="comentario"
              className="textarea"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un mensaje especial o tu razón para esta predicción..."
              style={{ minHeight: '120px' }}
            />
          </div>
          <div style={{ flex: window.innerWidth <= 768 ? 'none' : 1, width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'dragover' : ''}`}
              style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <input {...getInputProps()} />
              {fotoPreview ? (
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={fotoPreview} 
                    alt="Preview" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover', 
                      borderRadius: '50%',
                      marginBottom: '8px'
                    }} 
                  />
                  <p style={{ fontSize: '0.8rem', margin: '0' }}>Foto ✓</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                  {isDragActive ? (
                    <p style={{ fontSize: '0.8rem', margin: '0' }}>Suelta aquí...</p>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.8rem', margin: '0 0 4px 0' }}><strong>Foto *</strong></p>
                      <p style={{ fontSize: '0.7rem', color: '#666', margin: '0' }}>
                        PNG, JPG, GIF (obligatorio)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <motion.button
        type="submit"
        className="btn"
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: '100%', marginTop: '20px' }}
      >
        {loading ? 'Enviando voto...' : '🌳 Agregar mi predicción al árbol'}
      </motion.button>
    </form>
  );
};

export default VotoForm; 