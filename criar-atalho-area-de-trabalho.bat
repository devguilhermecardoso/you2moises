@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Criando atalho do You2Moises na sua Area de Trabalho...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $desktop = [Environment]::GetFolderPath('Desktop'); ^
   $s = $ws.CreateShortcut((Join-Path $desktop 'You2Moises.lnk')); ^
   $s.TargetPath = '%~dp0iniciar.bat'; ^
   $s.WorkingDirectory = '%~dp0'; ^
   $s.WindowStyle = 7; ^
   $s.Description = 'You2Moises - YouTube para MP3 e Moises (por Guilherme Cardoso)'; ^
   $s.IconLocation = 'shell32.dll,168'; ^
   $s.Save()"

echo.
echo Pronto! O atalho "You2Moises" foi criado na sua Area de Trabalho.
pause
