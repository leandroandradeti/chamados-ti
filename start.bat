@echo off
chcp 65001 > nul
cls

:menu
echo.
echo ═══════════════════════════════════════════════════════════
echo     🎫 Sistema de Chamados TI
echo ═══════════════════════════════════════════════════════════
echo.
echo    1. ▶️  Iniciar Sistema (Rápido)
echo    2. 🔧 Iniciar com Diagnóstico Completo
echo    3. 🛑 Parar Servidores
echo    4. 🔍 Diagnosticar PostgreSQL
echo    5. ❌ Sair
echo.
echo ═══════════════════════════════════════════════════════════
set /p opcao="Escolha uma opção (1-5): "

if "%opcao%"=="1" goto :start_quick
if "%opcao%"=="2" goto :start_full
if "%opcao%"=="3" goto :stop
if "%opcao%"=="4" goto :diagnose
if "%opcao%"=="5" exit
cls
echo ❌ Opção inválida!
timeout /t 2 > nul
cls
goto :menu

REM ═══════════════════════════════════════════════════════════
REM  OPÇÃO 1: INICIAR RÁPIDO
REM ═══════════════════════════════════════════════════════════
:start_quick
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo    🚀 Iniciando Sistema - Modo Rápido
echo ═══════════════════════════════════════════════════════════
echo.

REM Instala dependências se necessário
if not exist "backend\node_modules" (
    echo 📦 Instalando backend...
    cd backend && call npm install --silent && cd ..
)
if not exist "frontend\node_modules" (
    echo 📦 Instalando frontend...
    cd frontend && call npm install --silent && cd ..
)

REM Cria .env se não existir
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" > nul
    echo ⚠️  Configure backend\.env antes de usar!
)

echo.
echo ✅ Iniciando servidores...
echo.
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:3000
echo    Login:    admin@sistema.com / Admin@123
echo.

start "Backend - Chamados TI" cmd /c "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend - Chamados TI" cmd /c "cd /d %~dp0frontend && npm start"

echo ✅ Sistema iniciado!
echo.
timeout /t 3 > nul
exit

REM ═══════════════════════════════════════════════════════════
REM  OPÇÃO 2: INICIAR COM DIAGNÓSTICO
REM ═══════════════════════════════════════════════════════════
:start_full
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo    🔧 Iniciando Sistema - Modo Completo
echo ═══════════════════════════════════════════════════════════
echo.

REM Detecta PostgreSQL
echo [1/4] Verificando PostgreSQL...
set PG_SERVICE=
for %%s in (postgresql-x64-16 postgresql-x64-15 postgresql-x64-14 postgresql-x64-13 postgresql) do (
    sc query %%s > nul 2>&1
    if not errorlevel 1 (
        set PG_SERVICE=%%s
        goto :pg_found
    )
)

:pg_found
if "%PG_SERVICE%"=="" (
    echo ⚠️  PostgreSQL não detectado como serviço
    set /p continuar="Continuar mesmo assim? (S/N): "
    if /i not "%continuar%"=="S" goto :menu
) else (
    sc query %PG_SERVICE% | find "RUNNING" > nul
    if errorlevel 1 (
        echo ⚠️  PostgreSQL parado, tentando iniciar...
        net start %PG_SERVICE% > nul 2>&1
        if errorlevel 1 (
            echo ❌ Falha. Inicie manualmente: net start %PG_SERVICE%
            set /p continuar="Continuar? (S/N): "
            if /i not "%continuar%"=="S" goto :menu
        ) else (
            echo ✅ PostgreSQL iniciado
        )
    ) else (
        echo ✅ PostgreSQL rodando
    )
)

echo.
echo [2/4] Verificando dependências...
if not exist "backend\node_modules" (
    echo 📦 Instalando backend...
    cd backend && call npm install && cd ..
) else (
    echo ✅ Backend OK
)

if not exist "frontend\node_modules" (
    echo 📦 Instalando frontend...
    cd frontend && call npm install && cd ..
) else (
    echo ✅ Frontend OK
)

echo.
echo [3/4] Verificando configuração...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" > nul
    echo ⚠️  Arquivo .env criado. Configure:
    echo    - DB_PASSWORD
    echo    - JWT_SECRET
    notepad "backend\.env"
)
echo ✅ Configuração OK

echo.
echo [4/4] Iniciando servidores...
echo.
echo ═══════════════════════════════════════════════════════════
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:3000
echo    Login:    admin@sistema.com / Admin@123
echo ═══════════════════════════════════════════════════════════
echo.

start "Backend DEV" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5 /nobreak > nul
start "Frontend DEV" cmd /k "cd /d %~dp0frontend && npm start"

echo ✅ Sistema iniciado com diagnóstico completo!
echo.
set /p abrir="Abrir navegador? (S/N): "
if /i "%abrir%"=="S" start http://localhost:3000

timeout /t 3 > nul
exit

REM ═══════════════════════════════════════════════════════════
REM  OPÇÃO 3: PARAR SERVIDORES
REM ═══════════════════════════════════════════════════════════
:stop
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo    🛑 Parando Servidores
echo ═══════════════════════════════════════════════════════════
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Parando Backend (PID: %%a)...
    taskkill /PID %%a /F > nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Parando Frontend (PID: %%a)...
    taskkill /PID %%a /F > nul 2>&1
)

echo.
echo ✅ Servidores parados!
echo.
timeout /t 3 > nul
cls
goto :menu

REM ═══════════════════════════════════════════════════════════
REM  OPÇÃO 4: DIAGNÓSTICO POSTGRESQL
REM ═══════════════════════════════════════════════════════════
:diagnose
cls
echo.
echo ═══════════════════════════════════════════════════════════
echo    🔍 Diagnóstico PostgreSQL
echo ═══════════════════════════════════════════════════════════
echo.

echo [1] Procurando serviços PostgreSQL...
echo.
set FOUND=0
for /f "tokens=2" %%s in ('sc query type^= service state^= all ^| findstr /i "postgres"') do (
    set FOUND=1
    echo ✅ Serviço: %%s
    sc query %%s | findstr "STATE"
    echo.
)

if %FOUND%==0 (
    echo ❌ Nenhum serviço PostgreSQL encontrado!
    echo.
    echo 💡 Verifique se PostgreSQL está instalado:
    echo    - Download: https://www.postgresql.org/download/windows/
    echo.
)

echo [2] Verificando executável...
echo.
where psql > nul 2>&1
if not errorlevel 1 (
    echo ✅ psql encontrado no PATH
    psql --version
) else (
    echo ❌ psql não encontrado no PATH
    echo.
    echo Procurando em locais comuns...
    for %%v in (16 15 14 13 12) do (
        if exist "C:\Program Files\PostgreSQL\%%v\bin\psql.exe" (
            echo ✅ Encontrado: C:\Program Files\PostgreSQL\%%v\bin\
            echo.
            echo 💡 Adicione ao PATH:
            echo    setx PATH "%%PATH%%;C:\Program Files\PostgreSQL\%%v\bin"
        )
    )
)

echo.
echo [3] Testando conexão...
echo.
psql -U postgres -c "SELECT version();" 2>nul
if not errorlevel 1 (
    echo.
    echo ✅ Conexão OK!
    psql -U postgres -lqt | cut -d ^| -f 1 | findstr "chamados_ti" > nul
    if not errorlevel 1 (
        echo ✅ Banco 'chamados_ti' existe
    ) else (
        echo ⚠️  Banco 'chamados_ti' não existe
        echo.
        echo Para criar:
        echo    psql -U postgres -c "CREATE DATABASE chamados_ti;"
        echo    psql -U postgres -d chamados_ti -f database\schema.sql
    )
) else (
    echo ❌ Falha na conexão
    echo.
    echo 💡 Verifique:
    echo    1. PostgreSQL está rodando?
    echo    2. Senha do usuário 'postgres' está correta?
)

echo.
echo ═══════════════════════════════════════════════════════════
pause
cls
goto :menu
