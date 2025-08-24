# 🌳 Árbol de Predicciones - Revelación de Sexo

Una hermosa aplicación web para que tus familiares y amigos voten sobre el sexo del bebé y vean cómo crece un árbol interactivo con hojas de colores según sus predicciones.

## ✨ Características

- **Árbol Interactivo**: Visualización en tiempo real del árbol con hojas azules (varón) y rosadas (niña)
- **Subida de Fotos**: Los votantes pueden subir sus fotos junto con sus predicciones
- **Comentarios**: Espacio para mensajes especiales y razones de la predicción
- **Estadísticas en Tiempo Real**: Contador de votos y porcentajes
- **Diseño Responsivo**: Funciona perfectamente en móviles y computadoras
- **Animaciones Suaves**: Interfaz moderna con animaciones fluidas

## 🚀 Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd /ruta/del/proyecto
   ```

2. **Instalar todas las dependencias**
   ```bash
   npm run install-all
   ```

3. **Iniciar la aplicación en modo desarrollo**
   ```bash
   npm run dev
   ```

   Esto iniciará:
   - Servidor backend en `http://localhost:5000` (o `http://192.168.18.49:5000` para móvil)
   - Cliente frontend en `http://localhost:3000` (o `http://192.168.18.49:3000` para móvil)

## 📁 Estructura del Proyecto

```
revelacion-sexo/
├── server/                 # Backend (Node.js + Express)
│   ├── index.js           # Servidor principal
│   ├── package.json       # Dependencias del servidor
│   └── uploads/           # Carpeta para fotos subidas
├── client/                # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.tsx        # Componente principal
│   │   └── index.tsx      # Punto de entrada
│   ├── package.json       # Dependencias del cliente
│   └── tsconfig.json      # Configuración TypeScript
├── package.json           # Scripts principales
└── README.md             # Este archivo
```

## 🎯 Cómo Usar

1. **Abrir la aplicación** en tu navegador: 
   - **Computadora**: `http://localhost:3000`
   - **Móvil**: `http://192.168.18.49:3000` (misma red WiFi)

2. **Ver las estadísticas** en la parte superior de la página

3. **Observar el árbol** que se actualiza automáticamente con cada voto

4. **Agregar tu predicción**:
   - Completa tu nombre
   - Selecciona tu predicción (varón o niña)
   - Opcional: agrega un comentario
   - Opcional: sube una foto
   - Haz clic en "Agregar mi predicción al árbol"

5. **Ver tu hoja** aparecer en el árbol con el color correspondiente

## 🧪 Datos de Ejemplo

### Para agregar 60 casos de ejemplo:
```bash
cd server && node seed-data.js
```

### Para limpiar todos los datos:
```bash
cd server && node clear-data.js
```

### Datos de ejemplo incluidos:
- **60 votos aleatorios** con nombres realistas
- **Predicciones balanceadas** (aproximadamente 50/50)
- **Comentarios emocionantes** y variados
- **Fechas distribuidas** en los últimos 30 días

## 🌐 Despliegue en Producción

### Para desplegar en un servidor:

1. **Construir el cliente**
   ```bash
   cd client
   npm run build
   ```

2. **Configurar variables de entorno**
   ```bash
   export NODE_ENV=production
   ```

3. **Iniciar el servidor**
   ```bash
   cd server
   npm start
   ```

### Para desplegar en servicios como Heroku, Vercel, o Netlify:

1. Configura las variables de entorno necesarias
2. El servidor servirá automáticamente los archivos estáticos del cliente
3. Asegúrate de que el puerto esté configurado correctamente

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **SQLite** - Base de datos ligera
- **Multer** - Manejo de subida de archivos
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Framer Motion** - Animaciones
- **React Dropzone** - Subida de archivos
- **Axios** - Cliente HTTP

## 📊 Base de Datos

La aplicación utiliza SQLite con la siguiente estructura:

```sql
CREATE TABLE votos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  prediccion TEXT NOT NULL CHECK(prediccion IN ('varon', 'nina')),
  comentario TEXT,
  foto_url TEXT,
  fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Personalización

### Cambiar Colores del Árbol
Edita el archivo `client/src/components/TreeVisualization.tsx`:
- Hojas azules (varón): `#3b82f6`
- Hojas rosadas (niña): `#ec4899`

### Cambiar Estilos
Modifica `client/src/index.css` para personalizar la apariencia.

### Agregar Nuevas Funcionalidades
- El código está modularizado y es fácil de extender
- Puedes agregar más campos al formulario
- Implementar autenticación si es necesario
- Agregar más visualizaciones

## 🔧 Solución de Problemas

### Error de CORS
Si tienes problemas de CORS, verifica que el servidor esté corriendo en el puerto 5000.

### Error de Subida de Fotos
Asegúrate de que la carpeta `server/uploads` tenga permisos de escritura.

### Error de Base de Datos
La base de datos SQLite se crea automáticamente. Si hay problemas, elimina el archivo `votos.db` y reinicia el servidor.

## 📱 Compatibilidad

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Móviles (iOS/Android)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎉 ¡Disfruta tu Revelación de Sexo!

¡Esperamos que esta aplicación haga tu revelación de sexo aún más especial y memorable! 🌳👶✨ 