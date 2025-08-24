#!/bin/bash

echo "🌳 Iniciando Árbol de Predicciones - Revelación de Sexo"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm run install-all
fi

echo "🚀 Iniciando la aplicación..."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "📱 Frontend (móvil): http://192.168.18.49:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "🔧 Backend (móvil): http://192.168.18.49:5000"
echo ""
echo "Presiona Ctrl+C para detener la aplicación"
echo ""

# Iniciar la aplicación
npm run dev 