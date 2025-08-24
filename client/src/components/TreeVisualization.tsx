import React, { useEffect, useRef } from 'react';

interface Voto {
  id: number;
  nombre: string;
  prediccion: 'varon' | 'nina';
  pais?: string;
  comentario?: string;
  foto_url?: string;
  fecha_voto: string;
}

interface TreeVisualizationProps {
  votos: Voto[];
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ votos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Función para dibujar hoja SVG
  const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size / 76, size / 76); // Escalar basado en el viewBox del SVG

    // Dibujar la forma de la hoja usando el path del SVG
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Path del SVG convertido a coordenadas de canvas
    ctx.moveTo(57, 22.1667);
    ctx.bezierCurveTo(49.0833, 28.5, 52.25, 31.6667, 50.6667, 36.4167);
    ctx.bezierCurveTo(49.0833, 41.1667, 50.6667, 42.75, 44.3333, 47.5);
    ctx.bezierCurveTo(36.2227, 53.583, 29.2917, 49.875, 29.2917, 49.875);
    ctx.bezierCurveTo(27.7083, 51.4583, 21.7708, 54.2292, 21.7708, 54.2292);
    ctx.lineTo(20.0143, 50.7285);
    ctx.bezierCurveTo(26.3476, 49.1452, 27.7083, 47.1042, 27.7083, 47.1042);
    ctx.bezierCurveTo(26.125, 43.9375, 23.75, 38, 28.5, 30.0833);
    ctx.bezierCurveTo(33.25, 22.1667, 57, 22.1667, 57, 22.1667);
    ctx.closePath();
    ctx.fill();

    // Agregar sombra interna para dar profundidad
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.moveTo(30.0833, 44.3333);
    ctx.lineTo(31.6667, 45.9167);
    ctx.lineTo(31.6667, 45.9167);
    ctx.bezierCurveTo(34.8333, 44.3333, 36.4167, 39.5833, 36.4167, 39.5833);
    ctx.bezierCurveTo(38, 34.8333, 45.9167, 26.9167, 45.9167, 26.9167);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Variables globales del componente
  const isMobile = window.innerWidth <= 768;
  const width = isMobile ? window.innerWidth - 20 : 1112; // Ajustar al ancho de pantalla en móvil
  const height = 625;
  const treeImage = new window.Image();
  treeImage.src = '/arbol.png';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = width;
    canvas.height = height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Dibujar cielo con gradiente más suave
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.5, '#B0E0E6');
    skyGradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Dibujar suelo
    const groundGradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
    groundGradient.addColorStop(0, '#98FB98');
    groundGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // Cargar y dibujar imágenes de nubes decorativas (detrás del árbol)
    const nube1Image = new Image();
    const nube2Image = new Image();
    
    let nubesLoaded = 0;
    
    const drawClouds = () => {
      // Nube izquierda - escalada y reposicionada
      const nube1Width = isMobile ? width * 0.25 : 300; // 25% del ancho en móvil
      const nube1Height = isMobile ? nube1Width * 0.6 : 120; // Mantener proporción
      const nube1X = isMobile ? width * 0.05 : width * 0.03;
      const nube1Y = isMobile ? height * 0.05 : height * 0.03;
      ctx.drawImage(nube1Image, nube1X, nube1Y, nube1Width, nube1Height);
      
      // Nube derecha - escalada y reposicionada
      const nube2Width = isMobile ? width * 0.22 : 300; // 22% del ancho en móvil
      const nube2Height = isMobile ? nube2Width * 0.6 : 120; // Mantener proporción
      const nube2X = isMobile ? width * 0.73 : width * 0.70; // Más a la derecha en móvil
      const nube2Y = isMobile ? height * 0.08 : height * 0.10;
      ctx.drawImage(nube2Image, nube2X, nube2Y, nube2Width, nube2Height);
    };
    
    const checkAndDrawClouds = () => {
      nubesLoaded++;
      if (nubesLoaded === 2) {
        drawClouds();
      }
    };
    
    nube1Image.onload = checkAndDrawClouds;
    nube2Image.onload = checkAndDrawClouds;
    
    nube1Image.onerror = () => {
      console.log('Error cargando nube1.png');
      nubesLoaded++;
    };
    
    nube2Image.onerror = () => {
      console.log('Error cargando nube2.png');
      nubesLoaded++;
    };
    
    nube1Image.src = '/nube1.png';
    nube2Image.src = '/nube2.png';

    // Cargar y dibujar la imagen del árbol
    treeImage.onload = () => {
      console.log('Árbol cargado, dibujando en:', { width, height, isMobile });
      // Centrar el árbol horizontalmente
      const treeX = isMobile ? (width / 2) - (298 / 2) : (width / 2) - (298 / 2) - (width * 0.07);
      const treeY = isMobile ? height * 0.15 : height * 0.25; // Más arriba en móvil
      console.log('Posición del árbol:', { treeX, treeY });
      ctx.drawImage(treeImage, treeX, treeY, 298, 468);
      // Después de dibujar el árbol, dibujar las hojas
      drawLeavesAfterTree();
    };

    // Función para dibujar las hojas después de que se carga el árbol
    const drawLeavesAfterTree = () => {
      const total = votos.length;
      console.log('Dibujando hojas:', { total, width, height, isMobile });
      const centerX = isMobile ? (width / 2) : (width / 2) - (width * 0.07); // Centrado en móvil
      const centerY = isMobile ? height * 0.28 : height * 0.43; // Centrado vertical en móvil
      const baseRadius = (isMobile ? 90 : 170) * 1.60;
      console.log('Centro de hojas:', { centerX, centerY, baseRadius });

      votos.forEach((voto, index) => {
        // Espiral de Fibonacci con variación determinística
        const angle = index * 2.39996;
        const radius = Math.sqrt(index / total) * baseRadius * (0.85 + 0.3 * Math.abs(Math.sin(index)));
        // Variación aleatoria determinística
        const randomAngle = ((Math.sin(index * 12.9898 + 78.233) * 43758.5453) % 1 - 0.5) * 0.7;
        const randomRadius = ((Math.sin(index * 92.9898 + 78.233) * 43758.5453) % 1 - 0.5) * 18;
        const leafX = centerX + Math.cos(angle + randomAngle) * (radius + randomRadius);
        const leafY = centerY + Math.sin(angle + randomAngle) * (radius + randomRadius) * 0.8;
        // Tamaño y ángulo
        const leafSize = (isMobile ? 38 : 60) * 2;
        const leafAngle = angle + randomAngle + Math.PI / 2;
        const leafColor = voto.prediccion === 'varon' ? '#3B82F6' : '#EC4899';
        const shadowColor = voto.prediccion === 'varon' ? '#1E40AF' : '#BE185D';
        // Sombra
        drawLeaf(ctx, leafX + 4, leafY + 4, leafSize + 6, leafAngle, shadowColor + '55');
        // Hoja principal
        drawLeaf(ctx, leafX, leafY, leafSize, leafAngle, leafColor);
        // Hoja pequeña encima
        const smallLeafSize = leafSize * 0.6;
        const smallLeafColor = voto.prediccion === 'varon' ? '#60A5FA' : '#F472B6';
        drawLeaf(ctx, leafX, leafY, smallLeafSize, leafAngle + 0.3, smallLeafColor);
      });
    };
    
    // Intentar cargar la imagen del árbol, si no existe usar el árbol dibujado
    treeImage.onerror = () => {
      // Si no se puede cargar la imagen, dibujar el árbol original
      drawOriginalTree();
      drawLeavesAfterTree();
    };
    
    // treeImage.src = '/arbol.png'; // Moved to global scope
    
    // Función para dibujar el árbol original si no hay imagen
    const drawOriginalTree = () => {
      // Dibujar tronco del árbol con gradiente hasta el borde inferior
      const trunkGradient = ctx.createLinearGradient(width / 2 - 25, height - 280, width / 2 + 25, height - 280);
      trunkGradient.addColorStop(0, '#8B4513');
      trunkGradient.addColorStop(0.5, '#A0522D');
      trunkGradient.addColorStop(1, '#8B4513');
      ctx.fillStyle = trunkGradient;
      // Extender el tronco hasta el borde inferior exacto
      const trunkHeight = isMobile ? 400 : 500;
      const trunkY = height - trunkHeight;
      ctx.fillRect(width / 2 - 25, trunkY, 50, trunkHeight);

      // Dibujar ramas principales con mejor distribución
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      
      // Posiciones base para las ramas (ajustadas para tronco hasta el borde)
      const branchBaseY = isMobile ? (height - 350) : (height - 450);
      const branchMidY = isMobile ? (height - 380) : (height - 480);
      const branchEndY = isMobile ? (height - 400) : (height - 500);
      const branchSecY = isMobile ? (height - 370) : (height - 470);
      const branchSecMidY = isMobile ? (height - 390) : (height - 490);
      const branchSecEndY = isMobile ? (height - 410) : (height - 510);
      const branchTopY = isMobile ? (height - 360) : (height - 460);
      const branchTopMidY = isMobile ? (height - 400) : (height - 500);
      const branchTopEndY = isMobile ? (height - 440) : (height - 540);
      
      // Rama izquierda principal
      ctx.beginPath();
      ctx.moveTo(width / 2 - 15, branchBaseY);
      ctx.quadraticCurveTo(width / 2 - 60, branchMidY, width / 2 - 100, branchEndY);
      ctx.stroke();
      
      // Rama derecha principal
      ctx.beginPath();
      ctx.moveTo(width / 2 + 15, branchBaseY);
      ctx.quadraticCurveTo(width / 2 + 60, branchMidY, width / 2 + 100, branchEndY);
      ctx.stroke();
      
      // Ramas secundarias izquierdas
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 8, branchSecY);
      ctx.quadraticCurveTo(width / 2 - 40, branchSecMidY, width / 2 - 70, branchSecEndY);
      ctx.stroke();
      
      // Ramas secundarias derechas
      ctx.beginPath();
      ctx.moveTo(width / 2 + 8, branchSecY);
      ctx.quadraticCurveTo(width / 2 + 40, branchSecMidY, width / 2 + 70, branchSecEndY);
      ctx.stroke();
      
      // Ramas superiores
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width / 2, branchTopY);
      ctx.quadraticCurveTo(width / 2 - 30, branchTopMidY, width / 2 - 50, branchTopEndY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width / 2, branchTopY);
      ctx.quadraticCurveTo(width / 2 + 30, branchTopMidY, width / 2 + 50, branchTopEndY);
      ctx.stroke();
    };

  }, [votos]);

  return (
    <div style={{ width: '100%', height: '625px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', position: 'relative', background: 'transparent' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      />
      {/* Leyenda y contador fuera del canvas, como antes */}
      <div style={{
        position: 'absolute',
        left: 20,
        bottom: 20,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px #0001',
        padding: '18px 22px',
        minWidth: 160,
        fontFamily: 'Poppins, Arial',
        fontSize: 16,
        color: '#222',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 18, height: 18, background: '#2563eb', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#2563eb', fontWeight: 600 }}>👦 Niño</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 18, background: '#db2777', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#db2777', fontWeight: 600 }}>👧 Niña</span>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualization; 