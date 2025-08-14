# Configuración del Sistema de Cuestionarios RRHH

## Requisitos del sistema
- Node.js 18+
- MSSQL Server
- Red local configurada

## Instalación
1. `npm install`
2. Configurar base de datos en .env
3. `npm run dev` para desarrollo
4. `npm start` para producción

## URLs del sistema
- Aplicación: http://localhost:3000
- Base de datos: 192.168.4.5

## Comandos útiles
- `npm run dev` - Modo desarrollo con auto-reload
- `npm start` - Modo producción
- `iniciar-servidor.bat` - Inicio rápido en Windows

## Estructura
```
src/
├── server.js          # Servidor Express
└── public/
    ├── index.html     # Frontend
    ├── main.js        # JavaScript
    ├── style.css      # Estilos
    └── logo.png       # Logo empresa
```

## Base de datos
- Servidor: 192.168.4.5
- Usuario: Configurado en .env
- Tablas: empleados, folios, respuestas
