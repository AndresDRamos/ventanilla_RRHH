@echo off
echo ========================================
echo   Auto-Deploy Sistema RRHH
echo ========================================
echo.
echo Actualizando desde GitHub...

cd /d "%~dp0"
git fetch origin
git checkout deploy
git pull origin deploy

echo.
echo Instalando dependencias...
npm install

echo.
echo Reiniciando servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
npm start

echo.
echo ✓ Deploy completado
pause
