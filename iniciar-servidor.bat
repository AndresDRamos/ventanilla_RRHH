@echo off
echo ========================================
echo   Sistema de Cuestionarios - RRHH
echo ========================================
echo.
echo Iniciando servidor local...
echo Puerto: 3000
echo Base de datos: MSSQL (192.168.4.5)
echo.

cd /d "%~dp0"
npm run dev

pause
