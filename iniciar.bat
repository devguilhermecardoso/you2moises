@echo off
chcp 65001 >nul
title You2Moises - Desenvolvido por Guilherme Cardoso (@devguilhermecardoso)
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado neste computador.
    echo Baixe e instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Instalando dependencias do You2Moises pela primeira vez. Aguarde...
    call npm install
)

netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo You2Moises ja esta rodando! Abrindo no navegador...
    start "" "http://localhost:3000"
    exit /b 0
)

echo Iniciando servidor You2Moises em segundo plano...
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'node.exe' -ArgumentList 'server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
