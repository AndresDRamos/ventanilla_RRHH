@echo off
echo ========================================
echo   Backup del Sistema RRHH
echo ========================================
echo.

set fecha=%date:~6,4%-%date:~3,2%-%date:~0,2%
set carpeta_backup=backups\%fecha%

echo Creando backup en: %carpeta_backup%
mkdir "%carpeta_backup%" 2>nul

echo Copiando archivos...
xcopy /E /I /Y src "%carpeta_backup%\src"
copy package.json "%carpeta_backup%\"
copy .env "%carpeta_backup%\" 2>nul
copy README.md "%carpeta_backup%\"

echo.
echo ✓ Backup completado: %carpeta_backup%
echo.
pause
