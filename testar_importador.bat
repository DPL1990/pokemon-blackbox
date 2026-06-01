@echo off
title Testar Importador - Pokemon BlackBox
echo ====================================================
echo POKEMON BLACKBOX - INICIAR TESTE DO IMPORTADOR
echo ====================================================
echo O servidor local vai ser iniciado e o browser abrira 
echo em http://localhost:8000 automaticamente.
echo.
echo Pressione qualquer tecla para iniciar o servidor...
pause > nul
echo A iniciar...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
