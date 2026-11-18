@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Gerando arquivo You2Moises-Compartilhar.zip (sem sua sessao de login e sem seus downloads)...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference = 'SilentlyContinue'; ^
   $dest = Join-Path '%~dp0' 'You2Moises-Compartilhar.zip'; ^
   if (Test-Path $dest) { Remove-Item $dest -Force }; ^
   $items = @('package.json', 'server.js', 'iniciar.bat', 'criar-atalho-area-de-trabalho.bat', 'README.md', 'LICENSE', 'public', 'src'); ^
   Compress-Archive -Path $items -DestinationPath $dest -Force"

echo.
echo =====================================================================
echo Pacote criado com sucesso: d:\Dev\Modmoises\You2Moises-Compartilhar.zip
echo Voce pode enviar esse arquivo .zip para seus amigos com seguranca!
echo =====================================================================
pause
